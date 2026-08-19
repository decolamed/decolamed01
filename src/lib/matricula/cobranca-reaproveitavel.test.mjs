// Reaproveitar cobrança errada é pior do que emitir uma a mais: mandaria o
// cliente pagar um boleto cancelado, ou pagar o valor de uma compra que não é
// a que ele acabou de montar. Por isso a regra recusa em toda dúvida.

import test from "node:test";
import assert from "node:assert/strict";
import { STATUS_EM_ABERTO, estaEmAberto, podeReaproveitar } from "./cobranca-reaproveitavel.ts";

const TERMOS = { billingType: "PIX", valorCentavos: 43700, parcelas: 1 };

const cobranca = (extra = {}) => ({
  id: "pay_x",
  status: "PENDING",
  value: 437,
  billingType: "PIX",
  externalReference: null,
  ...extra
});

// ═══════════════════════════ O CASO QUE MOTIVOU ═════════════════════════════
test("mesma pessoa, mesmo plano, mesmos termos: reaproveita", () => {
  assert.equal(podeReaproveitar(cobranca(), TERMOS), true);
});

test("sem cobrança anterior, não há o que reaproveitar", () => {
  assert.equal(podeReaproveitar(null, TERMOS), false);
  assert.equal(podeReaproveitar(undefined, TERMOS), false);
});

// ═══════════════════════════ STATUS DA COBRANÇA ═════════════════════════════
test("só status em aberto valem", () => {
  assert.deepEqual([...STATUS_EM_ABERTO], ["PENDING", "AWAITING_PAYMENT", "AWAITING_RISK_ANALYSIS"]);
  for (const s of STATUS_EM_ABERTO) assert.ok(estaEmAberto(s), s);
});

test("cobrança já paga nunca é reaproveitada", () => {
  // Seria mandar o cliente pagar de novo o que ele já pagou.
  for (const status of ["RECEIVED", "CONFIRMED"]) {
    assert.equal(podeReaproveitar(cobranca({ status }), TERMOS), false, status);
  }
});

test("cobrança morta gera cobrança nova", () => {
  for (const status of ["DELETED", "REFUNDED", "CHARGEBACK_REQUESTED", "OVERDUE", "RECEIVED_IN_CASH"]) {
    assert.equal(podeReaproveitar(cobranca({ status }), TERMOS), false, status);
  }
});

test("status desconhecido é recusado, não adivinhado", () => {
  for (const status of ["", null, undefined, "STATUS_NOVO_DO_ASAAS"]) {
    assert.equal(podeReaproveitar(cobranca({ status }), TERMOS), false);
  }
});

// ═══════════════════════ OS TERMOS PRECISAM BATER ═══════════════════════════
test("trocar a forma de pagamento é outra compra", () => {
  assert.equal(podeReaproveitar(cobranca({ billingType: "BOLETO" }), TERMOS), false);
  assert.equal(podeReaproveitar(cobranca({ billingType: "CREDIT_CARD" }), TERMOS), false);
});

test("valor diferente é outra compra — um cupom aplicado depois, por exemplo", () => {
  assert.equal(podeReaproveitar(cobranca({ value: 400 }), TERMOS), false);
  assert.equal(podeReaproveitar(cobranca({ value: 437.01 }), TERMOS), false);
});

test("a comparação de valor é em centavos, imune a ponto flutuante", () => {
  // 4.37 * 100 dá 436.99999999999994 em ponto flutuante; comparar reais por
  // igualdade recusaria uma cobrança idêntica de vez em quando.
  assert.equal(podeReaproveitar(cobranca({ value: 0.1 + 0.2 }), { ...TERMOS, valorCentavos: 30 }), true);
});

test("número de parcelas diferente é outra compra", () => {
  const termos3x = { billingType: "CREDIT_CARD", valorCentavos: 43700, parcelas: 3 };
  const cartao = (n) => cobranca({ billingType: "CREDIT_CARD", installmentCount: n });
  assert.equal(podeReaproveitar(cartao(3), termos3x), true);
  assert.equal(podeReaproveitar(cartao(6), termos3x), false);
  assert.equal(podeReaproveitar(cartao(null), termos3x), false, "à vista não serve para 3x");
});

test("cobrança à vista não traz installmentCount, e isso vale como 1", () => {
  assert.equal(podeReaproveitar(cobranca({ installmentCount: undefined }), TERMOS), true);
  assert.equal(podeReaproveitar(cobranca({ installmentCount: null }), TERMOS), true);
});
