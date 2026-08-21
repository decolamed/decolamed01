// Substituir por aula errada é pior do que não substituir: o aluno estuda a
// coisa errada achando que está em dia. Estes testes fixam as três exigências
// — mesmo conteúdo, funciona, e outro professor de preferência.

import test from "node:test";
import assert from "node:assert/strict";
import { escolherSubstituta, mesmoAssunto } from "./substituicao-de-aula.ts";

const quebrada = {
  id: "original",
  materia: "Biologia",
  assunto: "Citologia",
  canalId: "CANAL_A"
};

const cand = (id, extra = {}) => ({
  id,
  titulo: "Aula " + id,
  materia: "Biologia",
  assunto: "Citologia",
  url: "https://youtu.be/" + id,
  canalId: "CANAL_B",
  funciona: true,
  duracaoMinutos: 30,
  ...extra
});

// ═══════════════════════ 1. MESMO CONTEÚDO ══════════════════════════════════
test("aula de outro assunto NUNCA substitui", () => {
  // O cronograma pediu Citologia naquele dia porque o dia seguinte depende
  // dela. "É de Biologia" não é critério.
  assert.equal(escolherSubstituta(quebrada, [cand("x", { assunto: "Genética" })]), null);
});

test("aula de outra matéria não substitui", () => {
  assert.equal(escolherSubstituta(quebrada, [cand("x", { materia: "Química" })]), null);
});

test("sem assunto nos dois lados não autoriza a troca", () => {
  // Seria liberar qualquer aula da matéria.
  const semAssunto = { ...quebrada, assunto: null };
  assert.equal(escolherSubstituta(semAssunto, [cand("x", { assunto: null })]), null);
});

test("assunto compara sem acento, caixa ou espaço sobrando", () => {
  assert.ok(mesmoAssunto("Citologia", "citologia"));
  assert.ok(mesmoAssunto("Genética", "GENETICA"));
  assert.ok(mesmoAssunto("  Leis de Newton ", "leis de newton"));
  assert.equal(mesmoAssunto("Citologia", "Genética"), false);
  assert.equal(mesmoAssunto("", ""), false);
  assert.equal(mesmoAssunto(null, "Citologia"), false);
});

// ═══════════════════════ 2. PRECISA FUNCIONAR ═══════════════════════════════
test("candidata quebrada não entra", () => {
  // Trocar um vídeo indisponível por outro indisponível é o pior resultado
  // possível: gasta a troca e o aluno continua sem aula.
  assert.equal(escolherSubstituta(quebrada, [cand("x", { funciona: false })]), null);
});

test("candidata sem endereço não entra", () => {
  assert.equal(escolherSubstituta(quebrada, [cand("x", { url: null })]), null);
});

test("a própria aula quebrada não se substitui", () => {
  assert.equal(escolherSubstituta(quebrada, [cand("original")]), null);
});

// ═══════════════════════ 3. OUTRO PROFESSOR ═════════════════════════════════
test("prefere outro professor quando há escolha", () => {
  // Se o vídeo do canal A quebrou, o canal A é o suspeito.
  const escolhida = escolherSubstituta(quebrada, [
    cand("mesmoCanal", { canalId: "CANAL_A", duracaoMinutos: 60 }),
    cand("outroCanal", { canalId: "CANAL_B", duracaoMinutos: 20 })
  ]);
  assert.equal(escolhida.id, "outroCanal", "escolheu a do mesmo canal mesmo tendo alternativa");
});

test("aceita o mesmo professor quando é a única opção", () => {
  // Uma aula certa do mesmo professor é melhor do que nenhuma aula.
  const escolhida = escolherSubstituta(quebrada, [cand("unica", { canalId: "CANAL_A" })]);
  assert.equal(escolhida.id, "unica");
});

test("canal desconhecido conta como outro professor", () => {
  const escolhida = escolherSubstituta(quebrada, [cand("semCanal", { canalId: null })]);
  assert.equal(escolhida.id, "semCanal");
});

// ═══════════════════════ A ESCOLHA É ESTÁVEL ════════════════════════════════
test("entre as elegíveis, a aula mais completa", () => {
  const escolhida = escolherSubstituta(quebrada, [
    cand("curta", { duracaoMinutos: 3 }),
    cand("cheia", { duracaoMinutos: 45 })
  ]);
  assert.equal(escolhida.id, "cheia", "um corte de 3 minutos não substitui uma aula");
});

test("a mesma entrada dá sempre a mesma saída", () => {
  // Substituição que muda a cada execução deixaria o aluno com uma aula
  // diferente a cada vez que abre o cronograma.
  const lista = [cand("bbb"), cand("aaa"), cand("ccc")];
  const primeira = escolherSubstituta(quebrada, lista).id;
  for (let i = 0; i < 5; i++) {
    assert.equal(escolherSubstituta(quebrada, [...lista].reverse()).id, primeira);
  }
});

test("sem candidata nenhuma devolve null, e isso é um resultado válido", () => {
  assert.equal(escolherSubstituta(quebrada, []), null);
});
