// "Continuar de onde parou" precisa funcionar com o acervo mudando embaixo:
// questão nova cadastrada pelo admin, filtro trocado, item pulado. Por isso a
// rodada é montada a partir dos IDs do que o aluno já fez, e não de um índice.

import test from "node:test";
import assert from "node:assert/strict";
import { montarRodada, mensagemDeRetomada } from "./continuidade.ts";

/** Acervo de 82 questões, como o de Biologia no banco. */
const ACERVO = Array.from({ length: 82 }, (_, i) => ({ id: `q${i + 1}` }));

const ids = (r) => r.itens.map((i) => i.id);

// ─────────────────────────────────────────────────────────── O CASO CITADO ──
test("respondeu 1 a 5 e voltou: a rodada começa na 6", () => {
  const feitos = new Set(["q1", "q2", "q3", "q4", "q5"]);
  const r = montarRodada(ACERVO, feitos, 10);

  assert.equal(r.itens[0].id, "q6", "deveria abrir na primeira pendente");
  assert.equal(r.feitos, 5);
  assert.equal(r.pendentes, 77);
  assert.equal(r.total, 82);
  assert.ok(r.retomando);
  assert.equal(mensagemDeRetomada(r, "questão", "questões"), "Você já fez 5 de 82. Continuando de onde parou.");
});

test("primeira visita não mostra aviso nenhum e começa do começo", () => {
  const r = montarRodada(ACERVO, new Set(), 10);
  assert.equal(r.itens[0].id, "q1");
  assert.equal(r.feitos, 0);
  assert.equal(r.retomando, false);
  assert.equal(mensagemDeRetomada(r, "questão", "questões"), null);
});

// ─────────────────────────────────────────── O JÁ FEITO CONTINUA ACESSÍVEL ──
test("já respondida não é bloqueada: entra na fila, atrás das pendentes", () => {
  const feitos = new Set(["q1", "q2"]);
  const r = montarRodada(ACERVO, feitos, 82);
  // As 80 pendentes vêm primeiro, e as duas já feitas continuam na lista.
  assert.equal(r.itens[0].id, "q3");
  assert.ok(ids(r).includes("q1"), "a questão 1 sumiu da rodada");
  assert.ok(ids(r).includes("q2"), "a questão 2 sumiu da rodada");
  assert.equal(ids(r).indexOf("q1") > ids(r).indexOf("q82"), true, "a já feita deve vir depois das pendentes");
});

test("com tudo respondido, a rodada vira revisão em vez de tela vazia", () => {
  const feitos = new Set(ACERVO.map((q) => q.id));
  const r = montarRodada(ACERVO, feitos, 10);
  assert.equal(r.itens.length, 10, "precisa devolver conteúdo para revisar");
  assert.equal(r.pendentes, 0);
  assert.equal(r.soRevisao, true);
  assert.equal(r.retomando, false);
  assert.equal(
    mensagemDeRetomada(r, "questão", "questões"),
    "Você já passou por 82 questões. Esta rodada é de revisão."
  );
});

// ───────────────────────────────────────────── O ACERVO MUDA POR BAIXO ──────
test("questão nova cadastrada depois entra como pendente, no lugar certo", () => {
  const feitos = new Set(["q1", "q2", "q3"]);
  const comNova = [...ACERVO, { id: "q83" }];
  const r = montarRodada(comNova, feitos, 5);
  assert.equal(r.itens[0].id, "q4");
  assert.ok(ids(montarRodada(comNova, feitos, 83)).includes("q83"));
  assert.equal(r.total, 83);
});

test("histórico de questão que saiu do filtro não atrapalha a conta", () => {
  // O aluno respondeu questões de outra matéria; elas não estão neste acervo.
  const feitos = new Set(["outra-1", "outra-2", "q1"]);
  const r = montarRodada(ACERVO, feitos, 10);
  assert.equal(r.feitos, 1, "só conta o que pertence ao acervo filtrado");
  assert.equal(r.itens[0].id, "q2");
});

test("acervo vazio não quebra nem inventa mensagem", () => {
  const r = montarRodada([], new Set(["q1"]), 10);
  assert.deepEqual(r.itens, []);
  assert.equal(r.total, 0);
  assert.equal(mensagemDeRetomada(r, "questão", "questões"), null);
});

// ──────────────────────────────────────────────────────────── DETERMINISMO ──
test("a mesma entrada devolve sempre a mesma rodada, na mesma ordem", () => {
  const feitos = new Set(["q1", "q7", "q30"]);
  const a = ids(montarRodada(ACERVO, feitos, 10));
  const b = ids(montarRodada(ACERVO, feitos, 10));
  assert.deepEqual(a, b, "a rodada mudou entre duas aberturas da mesma tela");
});

test("a ordem do acervo é respeitada como veio — sem sorteio", () => {
  const r = montarRodada(ACERVO, new Set(), 5);
  assert.deepEqual(ids(r), ["q1", "q2", "q3", "q4", "q5"]);
});

// ───────────────────────────────────────────────────────────── FLASHCARDS ──
test("vale igual para flashcards, com o mesmo comportamento", () => {
  const cards = Array.from({ length: 20 }, (_, i) => ({ id: `f${i + 1}` }));
  const r = montarRodada(cards, new Set(["f1", "f2", "f3"]), 15);
  assert.equal(r.itens[0].id, "f4");
  assert.equal(mensagemDeRetomada(r, "card", "cards"), "Você já fez 3 de 20. Continuando de onde parou.");
});

test("o tamanho da rodada nunca é ultrapassado", () => {
  const r = montarRodada(ACERVO, new Set(), 10);
  assert.equal(r.itens.length, 10);
  assert.equal(montarRodada(ACERVO, new Set(), 0).itens.length, 0);
});
