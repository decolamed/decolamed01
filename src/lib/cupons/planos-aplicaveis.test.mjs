// Um cupom restrito que passa é desconto dado onde não devia. Um cupom sem
// restrição que para de funcionar é venda perdida em todos os planos de uma
// vez. Estes testes guardam as duas pontas.

import test from "node:test";
import assert from "node:assert/strict";
import {
  cupomValeNoPlano,
  normalizarPlanos,
  valorParaGravar,
  descreverAplicacao
} from "./planos-aplicaveis.ts";

const VOO = "11111111-1111-1111-1111-111111111111";
const DECOLANDO = "22222222-2222-2222-2222-222222222222";

// ═════════════════ O COMPORTAMENTO DE ANTES NÃO PODE MUDAR ══════════════════
test("cupom sem restrição vale em qualquer plano", () => {
  // Todos os cupons que já existiam caem aqui: a coluna nasce nula.
  for (const semRestricao of [null, undefined, [], "não é lista", 42]) {
    assert.equal(cupomValeNoPlano(semRestricao, VOO), true, `recusou com ${JSON.stringify(semRestricao)}`);
    assert.equal(cupomValeNoPlano(semRestricao, DECOLANDO), true);
  }
});

test("cupom sem restrição vale mesmo sem saber o plano", () => {
  assert.equal(cupomValeNoPlano(null, null), true);
  assert.equal(cupomValeNoPlano([], ""), true);
});

// ══════════════════════════ O CUPOM RESTRITO ════════════════════════════════
test("o exemplo do pedido: LANÇAMENTO só no Voo Guiado", () => {
  assert.equal(cupomValeNoPlano([VOO], VOO), true);
  assert.equal(cupomValeNoPlano([VOO], DECOLANDO), false);
});

test("restrição a mais de um plano", () => {
  assert.equal(cupomValeNoPlano([VOO, DECOLANDO], VOO), true);
  assert.equal(cupomValeNoPlano([VOO, DECOLANDO], DECOLANDO), true);
  assert.equal(cupomValeNoPlano([VOO, DECOLANDO], "33333333-3333-3333-3333-333333333333"), false);
});

test("cupom restrito sem plano informado é recusado", () => {
  // Conceder desconto sem saber onde ele cai é o erro caro: o dinheiro já
  // saiu quando alguém percebe.
  for (const semPlano of [null, undefined, "", "   "]) {
    assert.equal(cupomValeNoPlano([VOO], semPlano), false, `aceitou com ${JSON.stringify(semPlano)}`);
  }
});

test("espaço em volta não faz o cupom deixar de valer", () => {
  assert.equal(cupomValeNoPlano([VOO], `  ${VOO}  `), true);
  assert.equal(cupomValeNoPlano([` ${VOO} `], VOO), true);
});

// ═══════════════════════ O QUE VEM DO FORMULÁRIO ════════════════════════════
test("a lista é limpa de vazios e repetições", () => {
  assert.deepEqual(normalizarPlanos([VOO, "", VOO, "  ", DECOLANDO]), [VOO, DECOLANDO]);
  assert.deepEqual(normalizarPlanos([null, 7, {}]), []);
  assert.deepEqual(normalizarPlanos("nada disso"), []);
});

test("lista vazia é gravada como nulo, não como array vazio", () => {
  // Dois jeitos de dizer "todos os planos" acabam gerando consulta com
  // resultado diferente dependendo de qual foi gravado.
  assert.equal(valorParaGravar([]), null);
  assert.equal(valorParaGravar(null), null);
  assert.equal(valorParaGravar(["  "]), null);
  assert.deepEqual(valorParaGravar([VOO]), [VOO]);
});

// ═══════════════════════════ O TEXTO DO PAINEL ══════════════════════════════
test("a restrição é descrita pelo nome do plano", () => {
  const nomes = new Map([
    [VOO, "VOO GUIADO"],
    [DECOLANDO, "DECOLANDO"]
  ]);
  assert.equal(descreverAplicacao(null, nomes), "Todos os planos");
  assert.equal(descreverAplicacao([VOO], nomes), "VOO GUIADO");
  assert.equal(descreverAplicacao([VOO, DECOLANDO], nomes), "VOO GUIADO, DECOLANDO");
});

test("plano apagado depois não quebra a listagem", () => {
  assert.equal(descreverAplicacao([VOO], new Map()), "Plano removido");
});
