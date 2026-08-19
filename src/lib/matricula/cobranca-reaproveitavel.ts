import { estaPago, type AsaasBillingType, type AsaasPagamento } from "@/lib/asaas/client";

// ============================================================================
// A MESMA PESSOA CLICANDO EM "CONFIRMAR MATRÍCULA" DE NOVO
//
// O botão do formulário se desabilita durante o envio, então o duplo clique
// imediato já era evitado. O que não era evitado é o reenvio alguns segundos
// depois: a pessoa volta, acha que não funcionou, preenche e confirma outra
// vez. Cada confirmação criava um `pre_cadastros` novo e uma COBRANÇA NOVA no
// Asaas.
//
// Isso aconteceu cinco vezes no banco de produção (intervalos de 9s a 36s), e
// em duas delas duas cobranças reais foram emitidas para a mesma pessoa e o
// mesmo plano. Duas cobranças em aberto significam que o cliente pode pagar
// as duas — e aí a plataforma precisa estornar.
//
// A regra: se existe uma cobrança recente da mesma pessoa, para o mesmo
// plano, ainda EM ABERTO e com exatamente os mesmos termos, devolvemos
// aquela em vez de emitir outra. Qualquer diferença nos termos (trocou de Pix
// para boleto, aplicou um cupom, mudou o número de parcelas) é uma compra
// diferente e merece cobrança nova.
// ============================================================================

/**
 * Status do Asaas em que a cobrança ainda pode ser paga.
 *
 * É uma lista fechada de propósito. Um status desconhecido — ou qualquer
 * coisa que o Asaas venha a inventar — cai fora e gera cobrança nova, que é o
 * comportamento seguro: no pior caso emitimos uma cobrança a mais, nunca
 * mandamos o cliente para um boleto cancelado.
 */
export const STATUS_EM_ABERTO = ["PENDING", "AWAITING_PAYMENT", "AWAITING_RISK_ANALYSIS"] as const;

export function estaEmAberto(status: string | null | undefined): boolean {
  return (STATUS_EM_ABERTO as readonly string[]).includes(String(status ?? ""));
}

/** Os termos da compra que o cliente está pedindo agora. */
export interface TermosDaCompra {
  billingType: AsaasBillingType;
  valorCentavos: number;
  parcelas: number;
}

/**
 * Dá para mandar o cliente de volta para esta cobrança?
 *
 * O valor é comparado em CENTAVOS. O Asaas devolve reais como número de ponto
 * flutuante, e comparar 437.0 com 437.00000000000006 por igualdade falharia
 * de vez em quando — o arredondamento para centavos elimina isso.
 */
export function podeReaproveitar(cobranca: AsaasPagamento | null | undefined, termos: TermosDaCompra): boolean {
  if (!cobranca) return false;
  if (estaPago(cobranca.status)) return false;
  if (!estaEmAberto(cobranca.status)) return false;
  if (cobranca.billingType !== termos.billingType) return false;
  if (Math.round(cobranca.value * 100) !== termos.valorCentavos) return false;

  // Sem parcelamento o Asaas não devolve `installmentCount`; tratamos ausente
  // como 1 para não recusar uma cobrança à vista perfeitamente válida.
  const parcelasDaCobranca = cobranca.installmentCount ?? 1;
  return parcelasDaCobranca === Math.max(1, termos.parcelas);
}
