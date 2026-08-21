import { hojeISO, somarDias } from "@/lib/site/data";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { findOrCreateCustomer, createCharge, getPixQrCode, getPayment, AsaasValidacaoError } from "@/lib/asaas/client";
import { podeReaproveitar } from "@/lib/matricula/cobranca-reaproveitavel";
import { validarCupom } from "@/lib/cupons/validar";
import { MENSAGEM_PLANO_NAO_ELEGIVEL } from "@/lib/cupons/planos-aplicaveis";
import { lerConfiguracao, opcaoEscolhida } from "@/lib/planos/parcelamento";

const bodySchema = z.object({
  planoId: z.string().uuid(),
  nome: z.string().trim().min(3),
  // .toLowerCase() evita o mesmo problema já corrigido em /admin/usuarios:
  // duas contas "diferentes" pro mesmo aluno por causa de maiúscula/
  // minúscula no e-mail (o Supabase Auth normaliza para minúsculo por
  // dentro, então profiles.email precisa bater com isso).
  email: z.string().trim().toLowerCase().email(),
  cpf: z.string().min(11),
  telefone: z.string().min(8),
  cep: z.string().min(8),
  numeroEndereco: z.string().min(1),
  billingType: z.enum(["PIX", "BOLETO", "CREDIT_CARD"]),
  // Quantas parcelas o cliente escolheu no cartão. Ausente = à vista, que é
  // o que Pix e boleto sempre são.
  parcelas: z.coerce.number().int().min(1).optional(),
  cupomCodigo: z.string().trim().min(1).optional()
});

/**
 * Por quanto tempo uma confirmação repetida é tratada como a MESMA compra.
 *
 * Os reenvios observados no banco aconteceram entre 9 e 36 segundos. Meia
 * hora cobre com folga a pessoa que volta, hesita e confirma de novo, sem
 * chegar perto do vencimento do boleto (2 dias). Passado esse tempo, uma
 * confirmação nova é uma compra nova.
 */
const JANELA_DE_REENVIO_MS = 30 * 60 * 1000;

interface DadosDaResposta {
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD";
  valorTotalCentavos: number;
  parcelasCobradas: number;
  valorDaParcelaCentavos: number | null;
  dueDate: string;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
}

/**
 * O payload que a tela de confirmação consome (MatriculaChargeResult, em
 * src/types/matricula.ts). Montado num lugar só porque agora há dois
 * caminhos até ele — a cobrança recém-criada e a cobrança reaproveitada — e
 * os dois precisam entregar exatamente o mesmo formato.
 *
 * O QR Code do Pix é buscado aqui: no reaproveitamento ele precisa ser
 * pedido de novo, porque o payload antigo ficou no navegador da tentativa
 * anterior (que pode nem ser o mesmo dispositivo).
 */
async function montarResposta(chargeId: string, dados: DadosDaResposta): Promise<Record<string, unknown>> {
  const resposta: Record<string, unknown> = {
    chargeId,
    billingType: dados.billingType,
    value: dados.valorTotalCentavos / 100,
    // A tela de confirmação repete o parcelamento para o cliente conferir o
    // que foi cobrado — sem isso ele veria só o total, sem saber em quantas
    // vezes ficou.
    parcelas: dados.parcelasCobradas,
    valorDaParcela: dados.valorDaParcelaCentavos !== null ? dados.valorDaParcelaCentavos / 100 : null,
    dueDate: dados.dueDate,
    invoiceUrl: dados.invoiceUrl,
    bankSlipUrl: dados.bankSlipUrl,
    pix: null
  };

  if (dados.billingType === "PIX") {
    resposta.pix = await getPixQrCode(chargeId);
  }

  return resposta;
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", detalhes: parsed.error.flatten() }, { status: 400 });
  }

  const { planoId, nome, email, cpf, telefone, cep, numeroEndereco, billingType, parcelas, cupomCodigo } =
    parsed.data;
  const supabase = createAdminClient();

  const { data: plano, error: planoError } = await supabase
    .from("planos")
    .select("*")
    .eq("id", planoId)
    .eq("ativo", true)
    .single();

  if (planoError || !plano) {
    return NextResponse.json({ error: "Plano não encontrado ou indisponível." }, { status: 404 });
  }

  // Cupom: revalidamos aqui (nunca confiamos no desconto calculado no cliente,
  // mesmo que o front já tenha chamado /api/cupons/validar antes).
  let precoFinalCentavos = plano.preco_centavos;
  let descontoCentavos = 0;
  if (cupomCodigo) {
    const resultado = await validarCupom(supabase, cupomCodigo, plano.preco_centavos, planoId);
    if (!resultado.ok) {
      // O motivo importa: "cupom inválido" faz a pessoa conferir se digitou
      // certo, quando na verdade o código está certo e só não vale para o
      // plano que ela escolheu.
      return NextResponse.json(
        {
          error:
            resultado.erro === "plano_nao_elegivel"
              ? MENSAGEM_PLANO_NAO_ELEGIVEL
              : "Cupom inválido ou expirado."
        },
        { status: 400 }
      );
    }
    descontoCentavos = resultado.resultado.descontoCentavos;
    precoFinalCentavos = resultado.resultado.valorFinalCentavos;
  }

  // ---- Parcelamento -------------------------------------------------------
  //
  // Calculado ANTES de gravar o pré-cadastro. Antes ficava depois, dentro do
  // try: um pedido de 12x num plano de 3x devolvia 400 mas já tinha deixado
  // uma linha órfã em `pre_cadastros`.
  //
  // O número de parcelas vem do navegador, e o navegador é entrada não
  // confiável: pedir 12x num plano configurado para 3x não pode virar uma
  // cobrança em 12x. Quem decide é a configuração do PLANO, lida do banco
  // agora — e `opcaoEscolhida` devolve null para qualquer coisa fora do teto.
  //
  // O valor também é recalculado aqui, pela MESMA função que montou as
  // opções mostradas na tela. É o que garante que o total exibido ao cliente
  // e o total enviado ao gateway são o mesmo número.
  //
  // Só o cartão parcela: Pix e boleto seguem exatamente como antes.
  const parcelamento = lerConfiguracao(plano as Record<string, unknown>);
  const opcao =
    billingType === "CREDIT_CARD" ? opcaoEscolhida(precoFinalCentavos, parcelas ?? 1, parcelamento) : null;

  if (billingType === "CREDIT_CARD" && !opcao) {
    return NextResponse.json(
      { error: "Esse número de parcelas não está disponível para este plano." },
      { status: 400 }
    );
  }

  // Com parcelamento, o Asaas cobra `installmentValue` N vezes — então o
  // total da compra é parcela × N, não o preço do plano. Sem parcelamento,
  // o valor é o de sempre.
  const parcelasCobradas = opcao && opcao.parcelas > 1 ? opcao.parcelas : 1;
  const valorTotalCentavos = opcao ? opcao.totalCentavos : precoFinalCentavos;

  // ---- Já existe uma cobrança em aberto para esta mesma compra? -----------
  //
  // A pessoa que volta e confirma de novo alguns segundos depois estava
  // ganhando uma SEGUNDA cobrança no Asaas — cinco casos no banco, dois deles
  // com duas cobranças reais emitidas. Se a anterior ainda está em aberto e
  // com os mesmos termos, devolvemos ela. Ver lib/matricula/cobranca-reaproveitavel.
  const { data: anterior } = await supabase
    .from("pre_cadastros")
    .select("id, asaas_charge_id")
    .eq("email", email)
    .eq("plano_id", planoId)
    .eq("convertido", false)
    .not("asaas_charge_id", "is", null)
    .gte("created_at", new Date(Date.now() - JANELA_DE_REENVIO_MS).toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (anterior?.asaas_charge_id) {
    try {
      const cobranca = await getPayment(anterior.asaas_charge_id);
      if (podeReaproveitar(cobranca, { billingType, valorCentavos: valorTotalCentavos, parcelas: parcelasCobradas })) {
        return NextResponse.json(
          await montarResposta(cobranca.id, {
            billingType,
            valorTotalCentavos,
            parcelasCobradas,
            valorDaParcelaCentavos: opcao?.valorDaParcelaCentavos ?? null,
            dueDate: cobranca.dueDate ?? somarDias(hojeISO(), 2),
            invoiceUrl: cobranca.invoiceUrl ?? null,
            bankSlipUrl: cobranca.bankSlipUrl ?? null
          }),
          { status: 200 }
        );
      }
    } catch (e) {
      // Não conseguir consultar a cobrança anterior não pode impedir a
      // compra: seguimos e emitimos uma nova, que é o comportamento de antes.
      console.error("Falha ao verificar cobrança anterior:", anterior.asaas_charge_id, e instanceof Error ? e.message : e);
    }
  }

  // 1. Pré-cadastro no Supabase, antes de qualquer chamada externa.
  const { data: preCadastro, error: preCadastroError } = await supabase
    .from("pre_cadastros")
    .insert({
      nome,
      email,
      cpf,
      telefone,
      plano_id: planoId,
      cupom_codigo: cupomCodigo ? cupomCodigo.trim().toUpperCase() : null,
      desconto_centavos: descontoCentavos
    })
    .select()
    .single();

  if (preCadastroError || !preCadastro) {
    return NextResponse.json({ error: "Não foi possível salvar o pré-cadastro." }, { status: 500 });
  }

  try {
    // 2. Cliente no Asaas (reaproveita se já existir pelo CPF).
    const customer = await findOrCreateCustomer({
      name: nome,
      email,
      cpfCnpj: cpf.replace(/\D/g, ""),
      mobilePhone: telefone.replace(/\D/g, ""),
      postalCode: cep.replace(/\D/g, ""),
      addressNumber: numeroEndereco,
      externalReference: preCadastro.id
    });

    // 3. Cobrança. dueDate = hoje + 2 dias úteis (ajuste conforme sua regra comercial).
    // Vencimento contado no fuso do aluno: em UTC, uma compra feita às 22h
    // ganhava um dia a menos de prazo do que o combinado.
    const dueDate = somarDias(hojeISO(), 2);

    const charge = await createCharge({
      customer: customer.id,
      billingType,
      value: valorTotalCentavos / 100,
      dueDate,
      description: `Matrícula Decola Med — ${plano.nome}`,
      externalReference: preCadastro.id,
      ...(parcelasCobradas > 1
        ? {
            installmentCount: parcelasCobradas,
            // O valor de CADA parcela, já fechado em centavos por nós. Mandar
            // o total e deixar o Asaas dividir traria um segundo
            // arredondamento, do outro lado, que poderia não bater com o que
            // o cliente acabou de ver na tela.
            installmentValue: opcao!.valorDaParcelaCentavos / 100
          }
        : {})
    });

    await supabase
      .from("pre_cadastros")
      .update({ asaas_customer_id: customer.id, asaas_charge_id: charge.id })
      .eq("id", preCadastro.id);

    return NextResponse.json(
      await montarResposta(charge.id, {
        billingType,
        valorTotalCentavos,
        parcelasCobradas,
        valorDaParcelaCentavos: opcao?.valorDaParcelaCentavos ?? null,
        dueDate,
        invoiceUrl: charge.invoiceUrl ?? null,
        bankSlipUrl: charge.bankSlipUrl ?? null
      }),
      { status: 201 }
    );
  } catch (err) {
    // O id do pré-cadastro amarra o log à linha da tabela: a retenção de log
    // da Vercel é curta, e sem essa âncora um erro de ontem vira um registro
    // órfão em `pre_cadastros` sem nenhuma pista do motivo.
    console.error(`Erro ao integrar com o Asaas (pre_cadastro ${preCadastro.id}):`, err);

    // O Asaas recusou os DADOS e disse o porquê ("valor mínimo", "CPF
    // inválido", "CEP não encontrado"). Devolver a explicação dele é o certo:
    // são erros que a pessoa consegue corrigir, e o 400 avisa o formulário de
    // que não adianta repetir a mesma requisição.
    if (err instanceof AsaasValidacaoError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Qualquer outra falha (chave errada, Asaas fora do ar, rede) é problema
    // nosso, não de quem está comprando — mensagem genérica, detalhe no log.
    return NextResponse.json(
      { error: "Não foi possível gerar a cobrança no momento. Tente novamente em instantes." },
      { status: 502 }
    );
  }
}
