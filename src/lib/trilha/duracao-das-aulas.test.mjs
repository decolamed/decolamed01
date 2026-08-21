// O risco desta mudança não é errar a duração de uma aula — é mudar o
// cronograma de quem não pediu. Estes testes fixam as duas coisas: a duração
// real entra quando é confiável, e NADA muda quando não é.

import test from "node:test";
import assert from "node:assert/strict";
import { comDuracaoReal, aulasReferenciadas } from "./duracao-das-aulas.ts";
import { minutosDoItem, duracaoRealDoItem } from "./progresso.ts";

const aula = (ref, extra = {}) => ({ tipo: "aula", titulo: "Aula", ref_id: ref, url: null, materia: null, ...extra });
const dia = (...itens) => ({ dia_numero: 1, titulo: "Dia", itens });

const confirmada = (min) => ({ duracaoMinutos: min, confirmada: true });
const naoConfirmada = (min) => ({ duracaoMinutos: min, confirmada: false });

// ═══════════════════════ O QUE NÃO PODE MUDAR ═══════════════════════════════
test("aula sem duração confirmada continua valendo a média de sempre", () => {
  // É o caso de 253 das 270 aulas do banco: `duracao_minutos` é um placeholder
  // de 30, não a duração do vídeo.
  const t = comDuracaoReal([dia(aula("a"))], new Map([["a", naoConfirmada(30)]]));
  assert.equal(minutosDoItem(t[0].itens[0]), 30, "deveria cair na média por tipo");
  assert.equal(duracaoRealDoItem(t[0].itens[0]), null);
});

test("aula que não está no mapa fica intacta", () => {
  const original = aula("desconhecida");
  const t = comDuracaoReal([dia(original)], new Map([["outra", confirmada(12)]]));
  assert.deepEqual(t[0].itens[0], original);
});

test("os outros tipos continuam com a média configurada", () => {
  // Questões, revisão e flashcards dependem de quem estuda, não do conteúdo.
  const outros = [
    { tipo: "questoes", titulo: "Questões", ref_id: null, url: null, materia: null, duracao_minutos: 5, duracao_real: true },
    { tipo: "flashcards", titulo: "Flashcards", ref_id: null, url: null, materia: null, duracao_minutos: 5, duracao_real: true },
    { tipo: "revisao", titulo: "Revisão", ref_id: null, url: null, materia: null, duracao_minutos: 5, duracao_real: true }
  ];
  assert.equal(minutosDoItem(outros[0]), 40, "questões");
  assert.equal(minutosDoItem(outros[1]), 20, "flashcards");
  assert.equal(minutosDoItem(outros[2]), 30, "revisão");
});

test("mapa vazio devolve o template original, sem cópia", () => {
  const t = [dia(aula("a"))];
  assert.equal(comDuracaoReal(t, new Map()), t);
});

test("o template original não é modificado", () => {
  // Ele é reaproveitado entre alunos: alterar no lugar contaminaria todo mundo.
  const original = [dia(aula("a"))];
  comDuracaoReal(original, new Map([["a", confirmada(7)]]));
  assert.equal(original[0].itens[0].duracao_minutos, undefined);
});

// ═══════════════════════ A DURAÇÃO REAL ENTRANDO ════════════════════════════
test("aula confirmada passa a ocupar o tempo que realmente ocupa", () => {
  const t = comDuracaoReal([dia(aula("a"))], new Map([["a", confirmada(10)]]));
  assert.equal(minutosDoItem(t[0].itens[0]), 10);
});

test("o exemplo do pedido: 10 + 50 num dia de 120 minutos", () => {
  const t = comDuracaoReal(
    [dia(aula("A"), aula("B"), { tipo: "questoes", titulo: "Questões", ref_id: null, url: null, materia: null })],
    new Map([
      ["A", confirmada(10)],
      ["B", confirmada(50)]
    ])
  );
  const minutos = t[0].itens.map(minutosDoItem);
  assert.deepEqual(minutos, [10, 50, 40]);
  assert.equal(
    minutos.reduce((s, m) => s + m, 0),
    100,
    "sobram 20 dos 120 — antes as duas aulas contariam 30 cada e o dia fecharia em 100 com aula errada"
  );
});

test("aulas de durações diferentes deixam de contar igual", () => {
  const t = comDuracaoReal(
    [dia(aula("curta"), aula("longa"))],
    new Map([
      ["curta", confirmada(5)],
      ["longa", confirmada(60)]
    ])
  );
  assert.notEqual(minutosDoItem(t[0].itens[0]), minutosDoItem(t[0].itens[1]));
});

test("duração confirmada mas inutilizável cai na média", () => {
  for (const ruim of [0, -5, NaN]) {
    const t = comDuracaoReal([dia(aula("a"))], new Map([["a", confirmada(ruim)]]));
    assert.equal(minutosDoItem(t[0].itens[0]), 30, `aceitou ${ruim}`);
  }
});

test("duração real é arredondada para minuto inteiro", () => {
  const t = comDuracaoReal([dia(aula("a"))], new Map([["a", confirmada(12.6)]]));
  assert.equal(minutosDoItem(t[0].itens[0]), 13);
});

// ═══════════════════════ QUAIS AULAS BUSCAR ═════════════════════════════════
test("só os ref_id de aula, sem repetição", () => {
  const template = [
    dia(aula("a"), aula("b"), { tipo: "questoes", titulo: "Q", ref_id: "q1", url: null, materia: null }),
    dia(aula("a"), aula(null))
  ];
  assert.deepEqual(aulasReferenciadas(template).sort(), ["a", "b"]);
});

test("template sem aula nenhuma não pede nada ao banco", () => {
  assert.deepEqual(aulasReferenciadas([dia({ tipo: "livre", titulo: "Descanso", ref_id: null, url: null, materia: null })]), []);
  assert.deepEqual(aulasReferenciadas([]), []);
});
