// O peso oficial da prova é o MAIOR fator da nota de prioridade
// (PESO_RETORNO = 0.4). Se a matéria de um conteúdo não encontra o peso dela,
// o item cai no valor de "matéria desconhecida" e o peso deixa de valer para
// ele — sem erro, sem aviso, só um cronograma pior.
//
// Era o caso de Literatura: o cronograma tem itens dessa matéria, mas
// `materias_peso` não tem linha "Literatura" (ela faz parte de Linguagens).

import test from "node:test";
import assert from "node:assert/strict";
import {
  contextoVazio,
  retornoDaMateria,
  carenciaDaMateria,
  PESO_RETORNO,
  PESO_CARENCIA,
  PESO_DIFICULDADE
} from "./prioridade.ts";
import { chaveCanonica } from "../site/materia-canonica.ts";

/** Os pesos reais da FACAPE, como estão no banco de produção. */
function contextoFacape() {
  const ctx = contextoVazio();
  const oficiais = [
    ["Biologia", 3, 10],
    ["Linguagens", 2, 10],
    ["Física", 2, 5],
    ["Química", 2, 5],
    ["Matemática", 1, 5],
    ["História", 1, 5],
    ["Geografia", 1, 5],
    ["Inglês", 1, 5],
    ["Espanhol", 1, 5]
  ];
  for (const [materia, peso, qtdQuestoes] of oficiais) {
    ctx.pesos.set(chaveCanonica(materia), { peso, qtdQuestoes });
  }
  return ctx;
}

// ══════════════════ OS PESOS OFICIAIS ESTÃO SENDO USADOS ════════════════════
test("Biologia lidera — é o maior potencial da prova", () => {
  // peso 3 × 10 questões = 30, o teto. Nenhuma outra matéria chega perto.
  const ctx = contextoFacape();
  assert.equal(retornoDaMateria("Biologia", ctx), 1);
});

test("o retorno é proporcional ao potencial de cada matéria", () => {
  const ctx = contextoFacape();
  assert.equal(retornoDaMateria("Linguagens", ctx), 20 / 30);
  assert.equal(retornoDaMateria("Física", ctx), 10 / 30);
  assert.equal(retornoDaMateria("Matemática", ctx), 5 / 30);
});

test("matéria de peso alto rende mais que matéria de peso baixo", () => {
  const ctx = contextoFacape();
  assert.ok(retornoDaMateria("Biologia", ctx) > retornoDaMateria("Química", ctx));
  assert.ok(retornoDaMateria("Química", ctx) > retornoDaMateria("História", ctx));
});

// ════════════════ A LACUNA QUE ESTA CORREÇÃO FECHOU ═════════════════════════
test("Literatura encontra o peso de Linguagens", () => {
  // Antes: `chaveMateria("Literatura")` = "literatura", que não existe em
  // materias_peso → caía em 0.35 (matéria desconhecida) e o peso oficial não
  // valia para os itens de Literatura do cronograma.
  const ctx = contextoFacape();
  assert.equal(retornoDaMateria("Literatura", ctx), retornoDaMateria("Linguagens", ctx));
  assert.notEqual(retornoDaMateria("Literatura", ctx), 0.35, "voltou a cair no valor de matéria sem peso");
});

test("as outras grafias de Linguagens também encontram o peso", () => {
  const ctx = contextoFacape();
  const alvo = retornoDaMateria("Linguagens", ctx);
  for (const nome of ["Português", "portugues", "Língua Portuguesa", "Português e Literatura", "LINGUAGENS E CÓDIGOS"]) {
    assert.equal(retornoDaMateria(nome, ctx), alvo, `${nome} não achou o peso`);
  }
});

test("o desempenho de Literatura conta em Linguagens", () => {
  // Mesma raiz: respostas gravadas como "Literatura" precisam somar no
  // histórico de Linguagens, senão o aluno aparece sem histórico numa matéria
  // em que já respondeu.
  const ctx = contextoFacape();
  ctx.desempenho.set(chaveCanonica("Linguagens"), { acertos: 2, erros: 8 });
  assert.equal(carenciaDaMateria("Literatura", ctx), carenciaDaMateria("Linguagens", ctx));
  assert.ok(carenciaDaMateria("Literatura", ctx) > 0.5, "deveria refletir os 8 erros");
});

test("Inglês e Espanhol continuam separados", () => {
  // A correção junta sinônimos, não matérias diferentes. Os dois idiomas têm
  // peso próprio na prova e não podem virar a mesma coisa.
  const ctx = contextoFacape();
  assert.notEqual(chaveCanonica("Inglês"), chaveCanonica("Espanhol"));
  assert.ok(retornoDaMateria("Inglês", ctx) > 0);
  assert.ok(retornoDaMateria("Espanhol", ctx) > 0);
});

// ══════════════════ O QUE NÃO PODE TER MUDADO ═══════════════════════════════
test("os pesos dos fatores continuam os mesmos", () => {
  // A correção é sobre ENCONTRAR o peso, não sobre mudar quanto ele vale.
  assert.equal(PESO_RETORNO, 0.4);
  assert.equal(PESO_CARENCIA, 0.25);
  assert.equal(PESO_DIFICULDADE, 0.2);
  assert.ok(PESO_RETORNO > PESO_CARENCIA, "o peso da prova segue sendo o maior fator");
  assert.ok(
    PESO_CARENCIA + PESO_DIFICULDADE > PESO_RETORNO,
    "mas carência e dificuldade somadas ainda superam o retorno — matéria difícil de peso médio passa à frente de matéria fácil de peso alto"
  );
});

test("sem pesos cadastrados ninguém leva vantagem", () => {
  assert.equal(retornoDaMateria("Biologia", contextoVazio()), 0.5);
});

test("matéria realmente desconhecida não some, mas não lidera", () => {
  const ctx = contextoFacape();
  const r = retornoDaMateria("Filosofia", ctx);
  assert.equal(r, 0.35);
  assert.ok(r > 0 && r < retornoDaMateria("Biologia", ctx));
});
