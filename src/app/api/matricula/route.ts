import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { findOrCreateCustomer, createCharge, getPixQrCode } from "@/lib/asaas/client";
import { validarCupom } from "@/lib/cupons/validar";

const bodySchema = z.object({
  planoId: z.string().uuid(),
  nome: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().min(11),
  telefone: z.string().min(8),
  cep: z.string().min(8),
  numeroEndereco: z.string().min(1),
  billingType: z.enum(["PIX", "BOLETO", "CREDIT_CARD"]),
  cupomCodigo: z.string().trim().min(1).optional()
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", detalhes: parsed.error.flatten() }, { status: 400 });
  }

  const { planoId, nome, email, cpf, telefone, cep, numeroEndereco, billingType, cupomCodigo } = parsed.data;
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
    const resultado = await validarCupom(supabase, cupomCodigo, plano.preco_centavos);
    if (!resultado.ok) {
      return NextResponse.json({ error: "Cupom inválido ou expirado." }, { status: 400 });
    }
    descontoCentavos = resultado.resultado.descontoCentavos;
    precoFinalCentavos = resultado.resultado.valorFinalCentavos;
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
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);

    const charge = await createCharge({
      customer: customer.id,
      billingType,
      value: precoFinalCentavos / 100,
      dueDate: dueDate.toISOString().slice(0, 10),
      description: `Matrícula Decola Med — ${plano.nome}`,
      externalReference: preCadastro.id
    });

    await supabase
      .from("pre_cadastros")
      .update({ asaas_customer_id: customer.id, asaas_charge_id: charge.id })
      .eq("id", preCadastro.id);

    // Response no formato MatriculaChargeResult (src/types/matricula.ts) — a
    // página de confirmação consome exatamente este payload via
    // sessionStorage, então billingType/value/dueDate precisam vir aqui
    // mesmo não sendo usados por esta rota em si.
    const response: Record<string, unknown> = {
      chargeId: charge.id,
      billingType,
      value: precoFinalCentavos / 100,
      dueDate,
      invoiceUrl: charge.invoiceUrl,
      bankSlipUrl: charge.bankSlipUrl ?? null,
      pix: null
    };

    if (billingType === "PIX") {
      const pix = await getPixQrCode(charge.id);
      response.pix = pix;
    }

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("Erro ao integrar com o Asaas:", err);
    return NextResponse.json(
      { error: "Não foi possível gerar a cobrança no momento. Tente novamente em instantes." },
      { status: 502 }
    );
  }
}
