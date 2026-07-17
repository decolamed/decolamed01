import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  ASAAS_CONFIRMATION_EVENTS,
  mapBillingTypeToFormaPagamento,
  type AsaasWebhookPayload
} from "@/lib/asaas/client";

// Configure esta URL no painel do Asaas: Configurações > Integrações > Webhooks.
// Marque ao menos os eventos: PAYMENT_CONFIRMED, PAYMENT_RECEIVED.
// O Asaas envia o token configurado no header abaixo — usado para validar a origem.
export async function POST(request: Request) {
  const token = request.headers.get("asaas-access-token");
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const payload = (await request.json()) as AsaasWebhookPayload;

  if (!ASAAS_CONFIRMATION_EVENTS.includes(payload.event)) {
    // Outros eventos (ex: PAYMENT_OVERDUE, PAYMENT_DELETED) podem ser
    // tratados aqui futuramente. Por ora apenas confirmamos o recebimento.
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();
  const { payment } = payload;
  const preCadastroId = payment.externalReference;

  if (!preCadastroId) {
    console.error("Webhook Asaas sem externalReference:", payment.id);
    return NextResponse.json({ received: true });
  }

  const { data: preCadastro } = await supabase
    .from("pre_cadastros")
    .select("*, planos(*)")
    .eq("id", preCadastroId)
    .single();

  if (!preCadastro) {
    console.error("Pré-cadastro não encontrado para webhook:", preCadastroId);
    return NextResponse.json({ received: true });
  }

  // Se o pré-cadastro usou um cupom de afiliado, buscamos o parceiro e o
  // percentual de comissão para gravar junto do pagamento (ver migração 005
  // — comissao_centavos/parceiro_id em `pagamentos` e a trigger que gera a
  // linha correspondente em `comissoes_parceiro`).
  let parceiroId: string | null = null;
  let comissaoCentavos = 0;
  if (preCadastro.cupom_codigo) {
    const { data: cupomInfo } = await supabase
      .from("cupons")
      .select("parceiro_id, percentual_comissao")
      .eq("codigo", preCadastro.cupom_codigo)
      .single();
    if (cupomInfo?.parceiro_id) {
      parceiroId = cupomInfo.parceiro_id;
      comissaoCentavos = Math.round((payment.value * 100 * (cupomInfo.percentual_comissao ?? 0)) / 100);
    }
  }

  const duracaoMeses: number | null = preCadastro.planos?.duracao_meses ?? null;
  let acessoExpiraEm: string | null = null;
  if (duracaoMeses) {
    const expira = new Date();
    expira.setMonth(expira.getMonth() + duracaoMeses);
    acessoExpiraEm = expira.toISOString();
  }

  // Precisamos do matricula_id ANTES de gravar o pagamento, para que o aluno
  // consiga ver o próprio pagamento depois (a policy de RLS pagamentos_select_own
  // depende de pagamentos.matricula_id apontar para uma matrícula dele).
  let matriculaId: string | null = null;

  if (preCadastro.convertido) {
    // Reenvio de evento (ex: PAYMENT_CONFIRMED seguido de PAYMENT_RECEIVED):
    // a matrícula já existe, só localizamos o id dela.
    const { data: matriculaExistente } = await supabase
      .from("matriculas")
      .select("id")
      .eq("pre_cadastro_id", preCadastro.id)
      .single();
    matriculaId = matriculaExistente?.id ?? null;
  } else {
    // 1. Cria o usuário no Supabase Auth via convite — o próprio aluno define
    //    a senha pelo link recebido por e-mail (nunca enviamos senha pronta).
    const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      preCadastro.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/redefinir-senha`,
        data: { nome: preCadastro.nome }
      }
    );

    if (inviteError || !invited?.user) {
      console.error("Erro ao convidar aluno:", inviteError);
      return NextResponse.json({ error: "Falha ao criar usuário." }, { status: 500 });
    }

    // 2. Profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: invited.user.id,
      nome: preCadastro.nome,
      email: preCadastro.email,
      telefone: preCadastro.telefone,
      cpf: preCadastro.cpf,
      role: "aluno",
      plano_id: preCadastro.plano_id
    });

    if (profileError) {
      // Não podemos deixar passar batido: sem profile, o aluno teria um
      // usuário de login criado mas nenhum jeito de o app reconhecê-lo (login
      // quebraria, matrícula ficaria "órfã"). Melhor falhar aqui e deixar o
      // Asaas reenviar o webhook depois, do que criar um estado inconsistente
      // que só apareceria como bug muito mais tarde.
      console.error("Erro ao criar profile no webhook:", profileError);
      return NextResponse.json({ error: "Falha ao criar perfil do aluno." }, { status: 500 });
    }

    // 3. Matrícula — capturamos o id gerado para linkar o pagamento a seguir.
    const { data: novaMatricula, error: matriculaError } = await supabase
      .from("matriculas")
      .insert({
        aluno_id: invited.user.id,
        pre_cadastro_id: preCadastro.id,
        plano_id: preCadastro.plano_id,
        status: "ativa",
        asaas_customer_id: preCadastro.asaas_customer_id,
        asaas_charge_id: preCadastro.asaas_charge_id,
        acesso_liberado_em: new Date().toISOString(),
        acesso_expira_em: acessoExpiraEm,
        cupom_codigo: preCadastro.cupom_codigo
      })
      .select("id")
      .single();

    if (matriculaError || !novaMatricula) {
      console.error("Erro ao criar matrícula:", matriculaError);
      return NextResponse.json({ error: "Falha ao criar matrícula." }, { status: 500 });
    }

    matriculaId = novaMatricula.id;

    // 4. Marca o pré-cadastro como convertido
    const { error: convertidoError } = await supabase
      .from("pre_cadastros")
      .update({ convertido: true })
      .eq("id", preCadastro.id);
    if (convertidoError) {
      // Não bloqueia a resposta (o aluno já tem acesso), mas se isso falhar
      // silenciosamente, um reenvio do mesmo webhook pelo Asaas tentaria
      // criar o aluno de novo (inviteUserByEmail falharia com "already
      // registered", já que o e-mail já existe) — melhor deixar rastro.
      console.error("Erro ao marcar pré-cadastro como convertido:", convertidoError, "preCadastro.id:", preCadastro.id);
    }

    // 5. Contabiliza o uso do cupom — só aqui (primeira confirmação), nunca
    //    em reenvios de evento, para não contar o mesmo pagamento duas vezes.
    if (preCadastro.cupom_codigo) {
      const { data: cupomAtual } = await supabase
        .from("cupons")
        .select("usos")
        .eq("codigo", preCadastro.cupom_codigo)
        .single();
      if (cupomAtual) {
        await supabase
          .from("cupons")
          .update({ usos: cupomAtual.usos + 1 })
          .eq("codigo", preCadastro.cupom_codigo);
      }
    }
  }

  // 5. Registra o pagamento já vinculado à matrícula (idempotente por
  //    asaas_payment_id — reenvios do Asaas atualizam a mesma linha).
  const { error: pagamentoError } = await supabase.from("pagamentos").upsert(
    {
      asaas_payment_id: payment.id,
      pre_cadastro_id: preCadastro.id,
      matricula_id: matriculaId,
      valor_centavos: Math.round(payment.value * 100),
      forma_pagamento: mapBillingTypeToFormaPagamento(payment.billingType),
      status: payload.event === "PAYMENT_RECEIVED" ? "recebido" : "confirmado",
      data_pagamento: payment.paymentDate ?? new Date().toISOString(),
      payload,
      origem_pagamento: "asaas",
      cupom_codigo: preCadastro.cupom_codigo,
      parceiro_id: parceiroId,
      comissao_centavos: comissaoCentavos,
      comprador_nome: preCadastro.nome,
      comprador_email: preCadastro.email,
      plano_nome: preCadastro.planos?.nome ?? null,
      plano_id: preCadastro.plano_id
    },
    { onConflict: "asaas_payment_id" }
  );

  if (pagamentoError) {
    // Crítico: sem essa linha, a venda não aparece em /admin/vendas nem a
    // comissão do parceiro é gerada — mas o aluno já tem acesso (matrícula
    // criada acima), então isso não bloqueia o aluno. Retornar erro (em vez
    // de {received:true}) faz o Asaas reenviar este webhook automaticamente
    // depois, dando uma segunda chance de registrar o pagamento.
    console.error("Erro ao registrar pagamento no webhook:", pagamentoError, "payment.id:", payment.id);
    return NextResponse.json({ error: "Falha ao registrar pagamento." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
