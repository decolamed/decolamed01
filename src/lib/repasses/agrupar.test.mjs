// "Quanto preciso pagar para cada professor e parceiro neste mês?"
//
// Os testes fixam as três coisas que uma folha de repasse não pode errar:
// não somar o que não é devido, não perder ninguém, e não contar duas vezes.

import test from "node:test";
import assert from "node:assert/strict";
import { resumirRepasses, ehDevida, descreverPeriodoDeRepasse } from "./agrupar.ts";

let sequencia = 0;

/**
 * Uma linha do razão, com os padrões do caso normal.
 *
 * `??` não serve aqui: passar `pagamento: null` é justamente um dos casos a
 * testar, e cairia no padrão em vez de valer null.
 */
function comissao(campos = {}) {
  sequencia += 1;
  const ou = (chave, padrao) => (chave in campos ? campos[chave] : padrao);
  return {
    id: ou("id", `c${sequencia}`),
    beneficiario_id: ou("beneficiario_id", "parceira"),
    tipo: ou("tipo", "cupom"),
    valor_centavos: ou("valor_centavos", 4290),
    status: ou("status", "pendente"),
    data_pagamento: ou("data_pagamento", null),
    beneficiario: ou("beneficiario", { nome: "Além da Teoria", role: "parceiro" }),
    pagamento: ou("pagamento", {
      comprador_nome: "karinne ribeiro",
      plano_nome: "VOO GUIADO",
      data_pagamento: "2026-08-25T15:00:00Z",
      status: "confirmado"
    })
  };
}

// ══════════════════════════════════════ O QUE ENTRA NA CONTA ════════════════

test("o total a pagar é a soma das comissões pendentes de vendas recebidas", () => {
  const resumo = resumirRepasses([comissao(), comissao({ valor_centavos: 8000, tipo: "redacao" })]);
  assert.equal(resumo.aPagarCentavos, 12290);
  assert.equal(resumo.quantidade, 2);
});

test("comissão de venda estornada não é dívida", () => {
  // A trigger marca como cancelada; a linha continua visível, fora dos totais.
  const resumo = resumirRepasses([comissao(), comissao({ status: "cancelada", valor_centavos: 9999 })]);
  assert.equal(resumo.aPagarCentavos, 4290, "a cancelada não podia entrar");
  assert.equal(resumo.quantidade, 1);
});

test("comissão de venda ainda PENDENTE não é dívida", () => {
  // Cobrança emitida e não paga. Pagar comissão sobre ela seria adiantar
  // dinheiro de uma venda que pode nunca acontecer.
  const resumo = resumirRepasses([comissao({ pagamento: { status: "pendente", comprador_nome: null, plano_nome: null, data_pagamento: null } })]);
  assert.equal(resumo.aPagarCentavos, 0);
  assert.equal(ehDevida(comissao({ pagamento: { status: "pendente" } })), false);
});

test("comissão sem a venda carregada não vira dívida por omissão", () => {
  assert.equal(ehDevida(comissao({ pagamento: null })), false);
});

test("comissão já paga sai do a pagar e entra no pago", () => {
  const resumo = resumirRepasses([comissao({ status: "paga", valor_centavos: 8000 }), comissao()]);
  assert.equal(resumo.aPagarCentavos, 4290);
  assert.equal(resumo.pagoCentavos, 8000);
  assert.equal(resumo.quantidade, 2, "a paga continua contando como linha do período");
});

test("venda com status 'recebido' também gera dívida", () => {
  const resumo = resumirRepasses([comissao({ pagamento: { status: "recebido" } })]);
  assert.equal(resumo.aPagarCentavos, 4290);
});

test("a mesma linha repetida é contada uma vez só", () => {
  const uma = comissao({ id: "mesma" });
  const resumo = resumirRepasses([uma, { ...uma }]);
  assert.equal(resumo.aPagarCentavos, 4290);
  assert.equal(resumo.quantidade, 1);
});

// ═══════════════════════════════════════ POR PESSOA E POR TIPO ══════════════

test("cada pessoa aparece uma vez, com o seu total", () => {
  const resumo = resumirRepasses([
    comissao({ beneficiario_id: "parceira", valor_centavos: 4290 }),
    comissao({ beneficiario_id: "parceira", valor_centavos: 1000 }),
    comissao({
      beneficiario_id: "professora",
      tipo: "redacao",
      valor_centavos: 8000,
      beneficiario: { nome: "Ana", role: "professor" }
    })
  ]);

  assert.equal(resumo.porBeneficiario.length, 2);
  const [primeira, segunda] = resumo.porBeneficiario;
  assert.equal(primeira.nome, "Ana", "quem tem mais a receber vem primeiro");
  assert.equal(primeira.aPagarCentavos, 8000);
  assert.equal(segunda.aPagarCentavos, 5290);
  assert.equal(segunda.quantidade, 2);
});

test("quem recebe pelos dois tipos vê a separação", () => {
  const resumo = resumirRepasses([
    comissao({ beneficiario_id: "ana", tipo: "cupom", valor_centavos: 4290 }),
    comissao({ beneficiario_id: "ana", tipo: "redacao", valor_centavos: 8000 })
  ]);

  const ana = resumo.porBeneficiario[0];
  assert.equal(ana.aPagarCentavos, 12290);
  assert.equal(ana.porTipo.length, 2);
  assert.equal(ana.porTipo.find((t) => t.tipo === "redacao").aPagarCentavos, 8000);
  assert.equal(ana.porTipo.find((t) => t.tipo === "cupom").aPagarCentavos, 4290);
});

test("o consolidado por tipo separa afiliados de professores", () => {
  const resumo = resumirRepasses([
    comissao({ tipo: "cupom", valor_centavos: 4290 }),
    comissao({ tipo: "cupom", valor_centavos: 1000 }),
    comissao({ tipo: "redacao", valor_centavos: 8000, beneficiario_id: "ana" })
  ]);

  assert.equal(resumo.porTipo.find((t) => t.tipo === "cupom").aPagarCentavos, 5290);
  assert.equal(resumo.porTipo.find((t) => t.tipo === "redacao").aPagarCentavos, 8000);
  assert.equal(resumo.aPagarCentavos, 13290, "o total geral fecha com a soma dos tipos");
});

test("a soma por pessoa fecha com o total geral", () => {
  const linhas = [
    comissao({ beneficiario_id: "a", valor_centavos: 111 }),
    comissao({ beneficiario_id: "b", valor_centavos: 222, tipo: "redacao" }),
    comissao({ beneficiario_id: "c", valor_centavos: 333 }),
    comissao({ beneficiario_id: "a", valor_centavos: 444, status: "cancelada" })
  ];
  const resumo = resumirRepasses(linhas);
  const somaDasPessoas = resumo.porBeneficiario.reduce((s, p) => s + p.aPagarCentavos, 0);
  assert.equal(somaDasPessoas, resumo.aPagarCentavos);
  assert.equal(resumo.aPagarCentavos, 666);
});

test("beneficiário sem perfil carregado ainda aparece", () => {
  // Perder alguém da folha é pior do que mostrar um nome feio.
  const resumo = resumirRepasses([comissao({ beneficiario: null, beneficiario_id: "orfa" })]);
  assert.equal(resumo.porBeneficiario.length, 1);
  assert.equal(resumo.porBeneficiario[0].nome, "Sem nome");
  assert.equal(resumo.porBeneficiario[0].aPagarCentavos, 4290);
});

test("sem comissão nenhuma, tudo é zero e nada quebra", () => {
  const resumo = resumirRepasses([]);
  assert.deepEqual(resumo, {
    aPagarCentavos: 0,
    pagoCentavos: 0,
    quantidade: 0,
    porBeneficiario: [],
    porTipo: []
  });
});

// ══════════════════════════════════════════════════ O PERÍODO ══════════════

test("o período é escrito por extenso, na ordem que o brasileiro lê", () => {
  assert.equal(
    descreverPeriodoDeRepasse("2026-08-01", "2026-08-31"),
    "Comissões de vendas entre 01/08/2026 e 31/08/2026"
  );
  assert.match(descreverPeriodoDeRepasse("2026-08-01", null), /a partir de 01\/08\/2026/);
  assert.match(descreverPeriodoDeRepasse(null, "2026-08-31"), /até 31\/08\/2026/);
  assert.match(descreverPeriodoDeRepasse(null, null), /todo o período/);
});
