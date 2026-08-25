// ============================================================================
// QUANTO VALEU A VENDA
//
// O Asaas, num parcelamento, devolve em `payment.value` o valor de UMA
// PARCELA. Foi assim que uma compra de R$ 453,69 em 3x entrou no painel
// financeiro como R$ 151,23 — e a comissão do parceiro, como 10% de um terço
// da venda.
//
// Este módulo decide o total. É puro e sem acesso a banco de propósito:
// dinheiro é o tipo de conta que precisa de teste barato, e a mesma resposta
// tem de sair para os dois caminhos de confirmação (o webhook e a consulta de
// status), senão a venda vale um número ou outro dependendo de quem chegou
// primeiro.
//
// A ORDEM DAS FONTES
// ------------------
// 1. O CHECKOUT. `pre_cadastros.valor_total_centavos` é o número que a
//    plataforma fechou, mostrou ao cliente e mandou para o gateway. É exato e
//    não depende de arredondamento nenhum do outro lado.
// 2. A CONTAGEM DE PARCELAS do Asaas, quando ele a informa: parcela × n.
// 3. A DESCRIÇÃO ("Parcela 1 de 3. …"), último recurso para uma venda antiga
//    feita antes de o checkout guardar o total.
// 4. O valor da cobrança, que é o certo para toda venda à vista.
//
// Nenhum passo inventa: quando não há sinal de parcelamento, o resultado é o
// mesmo de sempre — uma parcela, o valor cobrado.
// ============================================================================

/** O que o Asaas devolveu sobre a cobrança confirmada. */
export interface CobrancaConfirmada {
  /** `payment.value`, em reais. Num parcelamento, é o valor de UMA parcela. */
  valorDaCobranca: number;
  /**
   * `payment.netValue`, em reais: o que o Asaas CREDITA depois da taxa dele.
   *
   * Num parcelamento é o líquido de UMA parcela, pela mesma razão que `value`.
   * É a base da comissão do parceiro — o percentual não pode incidir sobre uma
   * taxa que a plataforma nunca chegou a ver.
   */
  valorLiquidoDaCobranca?: number | null;
  /** `payment.installment`: o id do grupo de parcelas, quando há. */
  installmentId?: string | null;
  /** `payment.installmentCount`, quando o Asaas o inclui. */
  installmentCount?: number | null;
  /** `payment.description` — "Parcela 1 de 3. Matrícula Decola Med — …". */
  descricao?: string | null;
}

/** O que o checkout fechou e guardou no pré-cadastro. */
export interface TotaisDoCheckout {
  valorTotalCentavos?: number | null;
  parcelas?: number | null;
}

export interface VendaValorada {
  /** O total da COMPRA, em centavos. É o que vai para `valor_centavos`. */
  totalCentavos: number;
  /**
   * O que o gateway CREDITOU, em centavos — já sem a taxa dele.
   *
   * Null quando o Asaas não informou o líquido; nesse caso o financeiro trata
   * o recebido como o próprio total, que é o comportamento certo para venda
   * manual e cortesia (nenhuma taxa envolvida).
   */
  recebidoCentavos: number | null;
  /** Em quantas vezes foi paga. 1 para toda venda à vista. */
  parcelas: number;
  /** O valor de cada parcela, ou null quando a venda é à vista. */
  valorDaParcelaCentavos: number | null;
}

/** "Parcela 1 de 3. …" → 3. Só isso; qualquer outro texto devolve null. */
export function parcelasNaDescricao(descricao: string | null | undefined): number | null {
  const achado = /parcela\s+\d+\s+de\s+(\d+)/i.exec(descricao ?? "");
  if (!achado) return null;
  const total = Number(achado[1]);
  return Number.isInteger(total) && total > 1 ? total : null;
}

/** Um inteiro de parcelas utilizável, ou null. */
function parcelasValidas(valor: unknown): number | null {
  const n = Number(valor);
  return Number.isInteger(n) && n > 1 ? n : null;
}

/**
 * O valor da venda a partir do que o gateway devolveu e do que o checkout
 * guardou.
 *
 * O total do checkout tem precedência sobre a multiplicação porque ele é o
 * número exato: a parcela já vem arredondada para cima em centavos (ver
 * `montarOpcao`), e reconstituir o total pela parcela devolve o mesmo número
 * só porque a plataforma fecha o total assim — o dia em que o Asaas ajustar um
 * centavo em alguma parcela, o registro continua batendo com o que o cliente
 * viu na tela.
 */
export function valorDaVenda(cobranca: CobrancaConfirmada, checkout: TotaisDoCheckout = {}): VendaValorada {
  const valorCobradoCentavos = Math.round(cobranca.valorDaCobranca * 100);

  const parcelas =
    parcelasValidas(checkout.parcelas) ??
    parcelasValidas(cobranca.installmentCount) ??
    parcelasNaDescricao(cobranca.descricao) ??
    // Grupo de parcelas sem contagem em lugar nenhum: sabemos que foi
    // parcelado, mas não em quantas vezes. Multiplicar por um número
    // inventado seria pior do que registrar o que foi cobrado — quem lê o
    // painel vê um valor baixo e vai atrás; um valor alto e errado ninguém
    // questiona.
    1;

  const totalDoCheckout = Number(checkout.valorTotalCentavos);
  const totalCentavos =
    Number.isInteger(totalDoCheckout) && totalDoCheckout > 0
      ? totalDoCheckout
      : valorCobradoCentavos * parcelas;

  // O líquido do gateway segue a MESMA regra do valor: no parcelamento ele vem
  // por parcela, então o que entrou na conta é ele multiplicado pelas parcelas.
  // Aqui não há total do checkout a que recorrer — a taxa é do Asaas e só ele
  // a conhece — então quando o campo não vem, o recebido fica indefinido e o
  // financeiro trata a venda como sem taxa.
  const liquidoDaCobranca = Number(cobranca.valorLiquidoDaCobranca);
  const recebidoCentavos = Number.isFinite(liquidoDaCobranca) && liquidoDaCobranca > 0
    ? Math.round(liquidoDaCobranca * 100) * parcelas
    : null;

  return {
    totalCentavos,
    recebidoCentavos,
    parcelas,
    // A parcela sai do total quando ele veio do checkout, para os dois números
    // fecharem na tela mesmo quando o gateway cobrou um centavo diferente.
    valorDaParcelaCentavos: parcelas > 1 ? Math.round(totalCentavos / parcelas) : null
  };
}

/**
 * A comissão percentual de um parceiro, em centavos.
 *
 * Incide sobre o que a plataforma RECEBEU, não sobre o que o aluno pagou. A
 * diferença é a taxa do gateway: numa venda de R$ 453,69 o Asaas credita
 * R$ 428,97, e cobrar 10% dos R$ 453,69 seria pagar comissão sobre R$ 24,72
 * que nunca entraram na conta.
 */
export function comissaoSobreRecebido(recebidoCentavos: number, percentual: number | null | undefined): number {
  const taxa = Number(percentual);
  if (!Number.isFinite(taxa) || taxa <= 0) return 0;
  return Math.round((recebidoCentavos * taxa) / 100);
}

/**
 * A chave de idempotência da venda.
 *
 * Numa compra parcelada, as 3 parcelas são 3 cobranças com ids diferentes e o
 * MESMO pré-cadastro. Como a linha de venda é única por `asaas_payment_id`, a
 * parcela que confirmar no mês que vem criaria uma venda NOVA de R$ 453,69, e
 * o painel passaria a contar a mesma compra três vezes. O grupo de parcelas é
 * a identidade certa da venda; o id da cobrança só serve quando não há grupo.
 */
export function chaveDaVenda(cobranca: CobrancaConfirmada, asaasPaymentId: string): {
  coluna: "asaas_installment_id" | "asaas_payment_id";
  valor: string;
} {
  const grupo = (cobranca.installmentId ?? "").trim();
  return grupo
    ? { coluna: "asaas_installment_id", valor: grupo }
    : { coluna: "asaas_payment_id", valor: asaasPaymentId };
}
