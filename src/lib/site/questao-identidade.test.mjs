// A identidade da questão é o que liga o aluno ao suporte: ele informa um
// código, o admin digita esse código na busca e encontra a questão. Se as
// duas pontas discordarem, o fluxo inteiro de reporte de erro quebra em
// silêncio — e ninguém percebe até um aluno reclamar duas vezes.

import test from "node:test";
import assert from "node:assert/strict";
import { codigoDaQuestao, provaDaQuestao, referenciaDaQuestao } from "./questao-identidade.ts";

/** Uma questão real do banco, com a origem preenchida. */
const COMPLETA = {
  id: "3f9a2c14-8b7d-4e21-9c05-1a2b3c4d5e6f",
  materia: "Biologia",
  prova_nome: "FACAPE",
  modalidade: "peba",
  ano: 2025,
  numero_questao: 12,
  fonte: null,
  anulada: false
};

// ────────────────────────────────────────────────────────────────── CÓDIGO ──
test("o código é derivado do id e é sempre o mesmo", () => {
  assert.equal(codigoDaQuestao(COMPLETA.id), "Q3F9A2C");
  assert.equal(codigoDaQuestao(COMPLETA.id), codigoDaQuestao(COMPLETA.id));
});

test("ids diferentes produzem códigos diferentes", () => {
  const a = codigoDaQuestao("11111111-aaaa-4444-8888-000000000000");
  const b = codigoDaQuestao("22222222-bbbb-4444-8888-000000000000");
  assert.notEqual(a, b);
});

test("o código sobrevive a um id vazio sem quebrar a tela", () => {
  assert.equal(codigoDaQuestao(""), "Q");
});

test("o que o aluno lê é o que o admin encontra na busca", () => {
  // A busca do painel monta o alvo com o código, o id e os metadados, e
  // compara em minúsculas. Se o aluno informa o código exibido, tem de casar.
  const exibidoAoAluno = codigoDaQuestao(COMPLETA.id);
  const alvoDaBusca = [
    codigoDaQuestao(COMPLETA.id),
    COMPLETA.id,
    "enunciado qualquer",
    COMPLETA.materia,
    COMPLETA.prova_nome,
    String(COMPLETA.ano),
    String(COMPLETA.numero_questao)
  ]
    .join(" ")
    .toLowerCase();

  assert.ok(alvoDaBusca.includes(exibidoAoAluno.toLowerCase()), "o código exibido não seria encontrado na busca");
  // E o admin não precisa acertar a caixa.
  assert.ok(alvoDaBusca.includes(exibidoAoAluno.toUpperCase().toLowerCase()));
});

// ─────────────────────────────────────────────────────────────────── PROVA ──
test("a prova de origem sai em uma linha só, com a modalidade traduzida", () => {
  assert.equal(provaDaQuestao(COMPLETA), "FACAPE 2025 — Rede PEBA");
});

test("sem modalidade, a linha não fica com separador solto", () => {
  assert.equal(provaDaQuestao({ ...COMPLETA, modalidade: null }), "FACAPE 2025");
});

test("sem prova cadastrada, cai na fonte antiga — e nunca nas duas", () => {
  assert.equal(
    provaDaQuestao({ id: "x", prova_nome: null, ano: null, modalidade: null, fonte: "Apostila interna" }),
    "Apostila interna"
  );
  // Com prova cadastrada, a fonte não repete a mesma informação.
  assert.equal(provaDaQuestao({ ...COMPLETA, fonte: "FACAPE 2025" }), "FACAPE 2025 — Rede PEBA");
});

test("questão sem origem nenhuma devolve vazio, para a tela omitir a linha", () => {
  assert.equal(provaDaQuestao({ id: "x" }), "");
});

// ───────────────────────────────────────────────────────────── REFERÊNCIA ──
test("a referência traz o número da PROVA e a matéria", () => {
  assert.equal(referenciaDaQuestao(COMPLETA), "Questão 12 · Biologia");
});

test("sem número de prova, usa a posição na lista atual", () => {
  assert.equal(referenciaDaQuestao({ ...COMPLETA, numero_questao: null }, 3), "Questão 3 · Biologia");
});

test("o número da prova tem precedência sobre a posição na lista", () => {
  // A questão 12 da prova pode ser a 3ª da atividade — quem identifica a
  // questão no caderno original é o 12.
  assert.equal(referenciaDaQuestao(COMPLETA, 3), "Questão 12 · Biologia");
});

test("sem matéria, a referência não fica com separador solto", () => {
  assert.equal(referenciaDaQuestao({ id: "x", numero_questao: 7 }), "Questão 7");
});

test("quem já mostra a matéria em destaque pede a referência sem ela", () => {
  // A faixa de identificação do cartão de questão põe a matéria em destaque,
  // no eyebrow verde. Sem esta opção a linha saía com a matéria duas vezes:
  // "BIOLOGIA · Questão 12 · Biologia".
  assert.equal(referenciaDaQuestao(COMPLETA, 3, { incluirMateria: false }), "Questão 12");
  // O padrão continua sendo incluir — nenhuma chamada existente muda.
  assert.equal(referenciaDaQuestao(COMPLETA, 3), "Questão 12 · Biologia");
  assert.equal(referenciaDaQuestao(COMPLETA, 3, {}), "Questão 12 · Biologia");
});

test("questão anulada continua identificável", () => {
  const anulada = { ...COMPLETA, anulada: true };
  assert.equal(codigoDaQuestao(anulada.id), "Q3F9A2C");
  assert.equal(provaDaQuestao(anulada), "FACAPE 2025 — Rede PEBA");
});
