import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { estaPago, getPayment } from "@/lib/asaas/client";
import { confirmarPagamento } from "@/lib/matricula/confirmar-pagamento";

// ============================================================================
// "JÁ PAGOU?" — A PERGUNTA QUE A TELA DO CHECKOUT FAZ
//
// Enquanto a cobrança está pendente, a tela consulta este endpoint de tempos
// em tempos. Ele responde com base em duas fontes, nesta ordem:
//
//   1. O BANCO. Se o webhook já converteu a compra, a resposta sai daqui —
//      barato e imediato.
//   2. O ASAAS. Se o banco ainda diz pendente, perguntamos ao Asaas o status
//      REAL da cobrança. Se ele disser que foi pago, liberamos o acesso pela
//      mesma função do webhook.
//
// O passo 2 é o que conserta o defeito relatado: o Pix foi pago, o dinheiro
// entrou, e a tela continuou mostrando o QR Code para sempre porque o webhook
// nunca chegou. Com ele, o webhook vira otimização — não ponto único de falha.
//
// O front NUNCA decide que algo foi pago. Ele pergunta; quem responde é o
// Asaas, e quem grava é o servidor. Nenhum parâmetro desta requisição afirma
// pagamento: `chargeId` é só o identificador de quem queremos consultar, e o
// valor, o método e o status vêm todos da resposta do Asaas.
// ============================================================================

/** Não cacheia: o ponto do endpoint é justamente ver a mudança de estado. */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const chargeId = new URL(request.url).searchParams.get("chargeId");
  if (!chargeId) {
    return NextResponse.json({ error: "Informe a cobrança." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // ---- 1. O que o banco já sabe -------------------------------------------
  const { data: preCadastro } = await supabase
    .from("pre_cadastros")
    .select("id, email, convertido")
    .eq("asaas_charge_id", chargeId)
    .maybeSingle();

  if (!preCadastro) {
    // Cobrança que não é desta plataforma, ou id digitado à mão. Não é erro
    // do aluno nem do servidor — é uma pergunta sobre algo que não existe.
    return NextResponse.json({ status: "desconhecido" }, { status: 404 });
  }

  if (preCadastro.convertido) {
    return NextResponse.json({ status: "confirmado", email: preCadastro.email });
  }

  // ---- 2. O que o Asaas diz -----------------------------------------------
  let pagamento;
  try {
    pagamento = await getPayment(chargeId);
  } catch (e) {
    // Indisponibilidade do Asaas não pode virar "não pago" na tela: a tela
    // continua perguntando, e a próxima resposta corrige. Responder pendente
    // aqui é o comportamento seguro — nunca o contrário.
    console.error("Falha ao consultar o status da cobrança:", chargeId, e instanceof Error ? e.message : e);
    return NextResponse.json({ status: "pendente" });
  }

  if (!estaPago(pagamento.status)) {
    return NextResponse.json({ status: "pendente" });
  }

  // ---- 3. Pago: libera, pela MESMA função do webhook -----------------------
  const resultado = await confirmarPagamento(supabase, {
    asaasPaymentId: pagamento.id,
    preCadastroId: pagamento.externalReference ?? preCadastro.id,
    // Parcelado, `value` é o valor de UMA parcela — o total da venda sai de
    // lib/matricula/valor-da-venda.ts. Este caminho é justamente o que
    // registrou a venda de 25/08 (o webhook não chegou), então ele precisa
    // mandar exatamente os mesmos campos que o webhook.
    valor: pagamento.value,
    valorLiquido: pagamento.netValue ?? null,
    installmentId: pagamento.installment ?? null,
    installmentCount: pagamento.installmentCount ?? null,
    descricao: pagamento.description ?? null,
    billingType: pagamento.billingType,
    dataPagamento: pagamento.paymentDate ?? pagamento.confirmedDate ?? null,
    recebido: pagamento.status === "RECEIVED",
    payload: { origem: "consulta-de-status", pagamento } as unknown as Record<string, unknown>
  });

  if (!resultado.ok) {
    // O pagamento existe e está pago, mas a liberação falhou. Dizer
    // "confirmado" mandaria o aluno para a tela de sucesso sem conta criada e
    // sem e-mail — pior do que continuar aguardando, porque some o sinal de
    // que algo está errado. A próxima consulta tenta de novo.
    console.error("Pagamento pago, mas a liberação falhou:", chargeId, resultado.motivo);
    return NextResponse.json({ status: "pendente" });
  }

  return NextResponse.json({ status: "confirmado", email: preCadastro.email });
}
