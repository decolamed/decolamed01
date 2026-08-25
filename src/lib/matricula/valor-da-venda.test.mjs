// O caso real que originou este módulo, e as bordas ao redor dele.
//
// Venda de 25/08: VOO GUIADO por R$ 454,00, cupom ALEMDATEORIA (5%) → R$ 431,30,
// pago em 3x com juros de 1,7% a.m. → 3 parcelas de R$ 151,23, total R$ 453,69.
// O Asaas devolveu `value: 151.23` e o painel registrou R$ 151,23 como a venda.

import test from "node:test";
import assert from "node:assert/strict";
import { valorDaVenda, chaveDaVenda, parcelasNaDescricao } from "./valor-da-venda.ts";
import { montarOpcao } from "@/lib/planos/parcelamento.ts";

const COBRANCA_DA_KARINNE = {
  valorDaCobranca: 151.23,
  installmentId: "93f2a485-e0f3-4048-9eb9-e71a7cf53449",
  descricao: "Parcela 1 de 3. Matrícula Decola Med — VOO GUIADO"
};

// ══════════════════════════════════════════════════ O TOTAL DA COMPRA ═══════

test("com o total do checkout, a venda vale a compra inteira", () => {
  const venda = valorDaVenda(COBRANCA_DA_KARINNE, { valorTotalCentavos: 45369, parcelas: 3 });
  assert.equal(venda.totalCentavos, 45369, "R$ 453,69, não R$ 151,23");
  assert.equal(venda.parcelas, 3);
  assert.equal(venda.valorDaParcelaCentavos, 15123);
});

test("sem o total do checkout, multiplica a parcela pela contagem do Asaas", () => {
  const venda = valorDaVenda({ ...COBRANCA_DA_KARINNE, installmentCount: 3 });
  assert.equal(venda.totalCentavos, 45369);
  assert.equal(venda.parcelas, 3);
});

test("sem contagem em campo nenhum, a descrição do Asaas resolve", () => {
  // É o caso de uma venda feita ANTES de o checkout passar a guardar o total:
  // "Parcela 1 de 3" é o único sinal que sobra na cobrança.
  const venda = valorDaVenda(COBRANCA_DA_KARINNE);
  assert.equal(venda.totalCentavos, 45369);
  assert.equal(venda.parcelas, 3);
});

test("venda à vista continua valendo exatamente o que foi cobrado", () => {
  const venda = valorDaVenda({ valorDaCobranca: 170.0 });
  assert.equal(venda.totalCentavos, 17000);
  assert.equal(venda.parcelas, 1);
  assert.equal(venda.valorDaParcelaCentavos, null, "à vista não tem parcela a mostrar");
});

test("parcelamento sem nenhuma contagem registra o que foi cobrado", () => {
  // Preferimos um valor baixo e visível a um valor alto e inventado: quem lê o
  // painel estranha o primeiro e vai atrás; o segundo ninguém questiona.
  const venda = valorDaVenda({ valorDaCobranca: 151.23, installmentId: "grupo-sem-contagem" });
  assert.equal(venda.totalCentavos, 15123);
  assert.equal(venda.parcelas, 1);
});

test("o total do checkout tem precedência sobre a multiplicação", () => {
  // Um centavo de diferença do gateway não pode mudar o que foi vendido.
  const venda = valorDaVenda(
    { ...COBRANCA_DA_KARINNE, valorDaCobranca: 151.24, installmentCount: 3 },
    { valorTotalCentavos: 45369, parcelas: 3 }
  );
  assert.equal(venda.totalCentavos, 45369);
  assert.equal(venda.valorDaParcelaCentavos, 15123);
});

test("o total bate com o que o checkout mostrou ao cliente", () => {
  // A mesma função que monta a opção na tela e manda o valor ao Asaas.
  const opcao = montarOpcao(43130, 3, {
    parcelamentoAtivo: true,
    parcelasMaximas: 10,
    jurosAtivo: true,
    jurosPercentual: 1.7
  });
  assert.equal(opcao.valorDaParcelaCentavos, 15123, "a parcela real da venda de 25/08");

  const venda = valorDaVenda(
    { valorDaCobranca: opcao.valorDaParcelaCentavos / 100, installmentId: "g", installmentCount: 3 },
    { valorTotalCentavos: opcao.totalCentavos, parcelas: opcao.parcelas }
  );
  assert.equal(venda.totalCentavos, opcao.totalCentavos);
});

test("valores absurdos no checkout não passam na frente", () => {
  for (const invalido of [null, undefined, 0, -1, 45369.5, "muito"]) {
    const venda = valorDaVenda({ ...COBRANCA_DA_KARINNE, installmentCount: 3 }, { valorTotalCentavos: invalido });
    assert.equal(venda.totalCentavos, 45369, `total do checkout inválido (${invalido}) devia ser ignorado`);
  }
});

// ═════════════════════════════════════════ A IDENTIDADE DA VENDA ════════════

test("venda parcelada é identificada pelo GRUPO de parcelas", () => {
  // Sem isto, a parcela 2 (id de cobrança diferente, mesmo pré-cadastro)
  // viraria uma segunda venda de R$ 453,69 no painel.
  const chave = chaveDaVenda(COBRANCA_DA_KARINNE, "pay_jkzmgxuqq1662g20");
  assert.deepEqual(chave, {
    coluna: "asaas_installment_id",
    valor: "93f2a485-e0f3-4048-9eb9-e71a7cf53449"
  });
});

test("venda à vista continua identificada pela cobrança", () => {
  const chave = chaveDaVenda({ valorDaCobranca: 170 }, "pay_93dgqcu2os2bpor4");
  assert.deepEqual(chave, { coluna: "asaas_payment_id", valor: "pay_93dgqcu2os2bpor4" });
});

test("grupo vazio ou em branco não vira chave", () => {
  for (const vazio of [null, undefined, "", "   "]) {
    const chave = chaveDaVenda({ valorDaCobranca: 10, installmentId: vazio }, "pay_x");
    assert.equal(chave.coluna, "asaas_payment_id");
  }
});

// ════════════════════════════════════════════════ A DESCRIÇÃO ══════════════

test("a descrição só conta quando diz de fato quantas parcelas são", () => {
  assert.equal(parcelasNaDescricao("Parcela 1 de 3. Matrícula Decola Med — VOO GUIADO"), 3);
  assert.equal(parcelasNaDescricao("Parcela 12 de 12. Matrícula"), 12);
  assert.equal(parcelasNaDescricao("Matrícula Decola Med — VOO GUIADO"), null);
  assert.equal(parcelasNaDescricao("Parcela 1 de 1. Matrícula"), null, "1 de 1 não é parcelamento");
  assert.equal(parcelasNaDescricao(null), null);
  assert.equal(parcelasNaDescricao(""), null);
});
