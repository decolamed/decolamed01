import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ASAAS_CONFIRMATION_EVENTS, type AsaasWebhookPayload } from "@/lib/asaas/client";
import { confirmarPagamento } from "@/lib/matricula/confirmar-pagamento";

// ============================================================================
// AVISO DE PAGAMENTO DO ASAAS
//
// Cadastre no painel do Asaas: Integrações > Webhooks.
//   URL:     <site>/api/asaas/webhook
//   Token:   o mesmo valor de ASAAS_WEBHOOK_TOKEN
//   Eventos: PAYMENT_CONFIRMED e PAYMENT_RECEIVED
//
// Este é o caminho OFICIAL de confirmação, mas não é o único: a tela do
// checkout também pergunta o status ao Asaas enquanto a cobrança está
// pendente (ver /api/matricula/status). Os dois terminam na MESMA função,
// `confirmarPagamento`, que é idempotente — quem chegar primeiro cria a
// conta, o segundo não repete nada.
//
// Essa redundância é deliberada. O webhook depende de estar cadastrado, com o
// token certo, e de a chamada chegar. Quando falha, falha em silêncio: o
// dinheiro entra e a plataforma não fica sabendo. Foi o que aconteceu no
// primeiro teste real de compra — Pix pago, conta nunca criada.
// ============================================================================

export async function POST(request: Request) {
  const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN;

  // Sem token configurado, qualquer um poderia liberar acesso de graça
  // mandando um POST aqui. Recusar tudo é a resposta certa — e o log diz o
  // que fazer, senão o sintoma seria "o webhook não funciona" sem motivo.
  if (!tokenEsperado) {
    console.error("Webhook do Asaas recebido, mas ASAAS_WEBHOOK_TOKEN não está configurada.");
    return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });
  }

  if (request.headers.get("asaas-access-token") !== tokenEsperado) {
    // Este 401 é a causa mais provável de "o webhook está cadastrado e mesmo
    // assim nada acontece": o token do painel do Asaas não bate com o da
    // variável de ambiente. Sem este log, não havia como saber.
    console.error("Webhook do Asaas recusado: token não confere com ASAAS_WEBHOOK_TOKEN.");
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const payload = (await request.json()) as AsaasWebhookPayload;

  if (!ASAAS_CONFIRMATION_EVENTS.includes(payload.event)) {
    // PAYMENT_OVERDUE, PAYMENT_DELETED e afins. Confirmamos o recebimento
    // para o Asaas não reenviar — não há o que fazer com eles hoje.
    return NextResponse.json({ received: true });
  }

  const { payment } = payload;
  if (!payment?.externalReference) {
    console.error("Webhook do Asaas sem externalReference:", payment?.id);
    return NextResponse.json({ received: true });
  }

  const resultado = await confirmarPagamento(createAdminClient(), {
    asaasPaymentId: payment.id,
    preCadastroId: payment.externalReference,
    // `payment.value` é o valor de UMA parcela quando a compra é parcelada; o
    // total da venda é decidido em lib/matricula/valor-da-venda.ts, com os
    // três campos abaixo e o que o checkout guardou no pré-cadastro.
    valor: payment.value,
    installmentId: payment.installment ?? null,
    installmentCount: payment.installmentCount ?? null,
    descricao: payment.description ?? null,
    billingType: payment.billingType,
    dataPagamento: payment.paymentDate ?? null,
    recebido: payload.event === "PAYMENT_RECEIVED",
    payload: payload as unknown as Record<string, unknown>
  });

  if (!resultado.ok) {
    // 500 faz o Asaas reenviar automaticamente — é o que queremos quando o
    // problema pode passar. Quando não pode (pré-cadastro inexistente),
    // confirmamos o recebimento para ele parar de insistir num evento que
    // nunca vai dar certo.
    if (resultado.repetir) return NextResponse.json({ error: resultado.motivo }, { status: 500 });
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
