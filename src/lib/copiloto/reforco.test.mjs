// O Copiloto criou 11 missões para um aluno e todas eram "Questões · <matéria>",
// com 160 flashcards e 108 aulas de Biologia paradas no acervo. Estes testes
// fixam a decisão que substituiu aquele desvio universal: o formato do reforço
// sai do ERRO, não do modo do motor.

import test from "node:test";
import assert from "node:assert/strict";
import {
  ordemDeReforco,
  escolherReforco,
  atingiuLimiteDeReforco,
  MAX_REFORCOS_PENDENTES_POR_MATERIA
} from "./reforco.ts";

const TUDO = { questoes: 80, flashcards: 160, aulas: 100 };
const SO_QUESTOES = { questoes: 80, flashcards: 0, aulas: 0 };
const NADA = { questoes: 0, flashcards: 0, aulas: 0 };

// ─────────────────────────────────────────────── A ORDEM SAI DO ERRO ────────
test("precisão muito baixa pede AULA antes de mais questões", () => {
  // Mandar mais questões para quem acerta 20% é pedir que ele repita o erro.
  const ordem = ordemDeReforco({ erros: 8, precisao: 20, respostas: 10 });
  assert.equal(ordem[0], "aula");
  assert.deepEqual(ordem, ["aula", "flashcards", "questoes"]);
});

test("precisão intermediária pede FLASHCARDS — é lacuna de memória", () => {
  const ordem = ordemDeReforco({ erros: 2, precisao: 55, respostas: 9 });
  assert.equal(ordem[0], "flashcards");
});

test("erro em volume com base consolidada pede QUESTÕES — é aplicação", () => {
  const ordem = ordemDeReforco({ erros: 4, precisao: 72, respostas: 14 });
  assert.equal(ordem[0], "questoes");
});

test("um erro isolado não vira sessão de 40 min de questões", () => {
  const ordem = ordemDeReforco({ erros: 1, precisao: 90, respostas: 10 });
  assert.equal(ordem[0], "flashcards");
});

test("precisão baixa com amostra minúscula não decide nada sozinha", () => {
  // 1 de 2 é 50%, mas duas respostas não sustentam um diagnóstico de base.
  const ordem = ordemDeReforco({ erros: 1, precisao: 50, respostas: 2 });
  assert.equal(ordem[0], "flashcards");
  assert.notEqual(ordem[0], "aula");
});

// ────────────────────────────────────── NÃO REPETIR O QUE JÁ ESTÁ LÁ ────────
test("o tipo já pendente na matéria vai para o fim da fila", () => {
  const sinal = { erros: 4, precisao: 72, respostas: 14 };
  assert.equal(ordemDeReforco(sinal)[0], "questoes");
  // Com uma missão de questões de Biologia já pendente, a próxima muda de
  // formato — era exatamente isto que faltava quando o aluno recebeu oito
  // "Questões · Biologia · 40 min" em dias consecutivos.
  const comPendente = ordemDeReforco({ ...sinal, jaPendentes: ["questoes"] });
  assert.notEqual(comPendente[0], "questoes");
  assert.equal(comPendente[comPendente.length - 1], "questoes");
});

test("com dois formatos pendentes, sobra o terceiro", () => {
  const ordem = ordemDeReforco({
    erros: 4, precisao: 72, respostas: 14,
    jaPendentes: ["questoes", "flashcards"]
  });
  assert.equal(ordem[0], "aula");
});

test("todos pendentes: a ordem original é preservada, sem perder nenhum tipo", () => {
  const ordem = ordemDeReforco({
    erros: 4, precisao: 72, respostas: 14,
    jaPendentes: ["questoes", "flashcards", "aula"]
  });
  assert.deepEqual([...ordem].sort(), ["aula", "flashcards", "questoes"]);
});

// ──────────────────────────────── SÓ ESCOLHE O QUE EXISTE DE VERDADE ────────
test("escolhe o melhor formato que tem material", () => {
  assert.equal(escolherReforco({ erros: 8, precisao: 20, respostas: 10 }, TUDO), "aula");
});

test("sem aula na matéria, cai para o PRÓXIMO da ordem, não para questões", () => {
  // O defeito antigo: `tipoComConteudo` conferia o preferido e, falhando,
  // devolvia "questoes" antes de olhar os flashcards.
  const inv = { questoes: 80, flashcards: 160, aulas: 0 };
  assert.equal(escolherReforco({ erros: 8, precisao: 20, respostas: 10 }, inv), "flashcards");
});

test("matéria que só tem questões continua recebendo questões", () => {
  assert.equal(escolherReforco({ erros: 2, precisao: 55, respostas: 9 }, SO_QUESTOES), "questoes");
});

test("matéria sem material nenhum não vira missão", () => {
  assert.equal(escolherReforco({ erros: 5, precisao: 30, respostas: 12 }, NADA), null);
});

test("com todos os formatos DISPONÍVEIS já pendentes, não há reforço novo", () => {
  // Inglês e Espanhol não têm aula cadastrada. Com questões e flashcards já
  // pendentes, o terceiro pedido devolvia "flashcards" outra vez — o mesmo
  // defeito de repetição, em escala menor.
  const semAula = { questoes: 38, flashcards: 8, aulas: 0 };
  const sinal = { erros: 5, precisao: 32, respostas: 16 };
  assert.equal(escolherReforco({ ...sinal, jaPendentes: ["flashcards"] }, semAula), "questoes");
  assert.equal(escolherReforco({ ...sinal, jaPendentes: ["flashcards", "questoes"] }, semAula), null);
});

test("formato concluído volta a ficar disponível — jaPendentes conta só o pendente", () => {
  // A lista que chega aqui é a das missões PENDENTES. Depois que o aluno
  // conclui a rodada de flashcards, ela sai da lista e o formato pode voltar.
  const inv = { questoes: 82, flashcards: 160, aulas: 108 };
  const sinal = { erros: 2, precisao: 55, respostas: 9 };
  assert.equal(escolherReforco({ ...sinal, jaPendentes: ["flashcards"] }, inv), "questoes");
  assert.equal(escolherReforco({ ...sinal, jaPendentes: [] }, inv), "flashcards");
});

// ───────────────────────────────────────────── TETO POR MATÉRIA ─────────────
test("o teto por matéria existe e vale 3 — um de cada formato", () => {
  assert.equal(MAX_REFORCOS_PENDENTES_POR_MATERIA, 3);
  assert.equal(atingiuLimiteDeReforco(0), false);
  assert.equal(atingiuLimiteDeReforco(2), false);
  assert.equal(atingiuLimiteDeReforco(3), true);
  assert.equal(atingiuLimiteDeReforco(8), true);
});

// ──────────────────────────── O CENÁRIO REAL QUE MOTIVOU A CORREÇÃO ─────────
test("erros repetidos de Biologia não produzem oito missões iguais", () => {
  const inv = { questoes: 82, flashcards: 160, aulas: 108 };
  const pendentes = [];
  const criadas = [];

  // Simula o motor pedindo reforço de Biologia repetidamente.
  for (let i = 0; i < 8; i++) {
    if (atingiuLimiteDeReforco(pendentes.length)) break;
    const tipo = escolherReforco(
      { erros: 6, precisao: 35, respostas: 17, jaPendentes: [...pendentes] },
      inv
    );
    if (!tipo) break;
    criadas.push(tipo);
    pendentes.push(tipo);
  }

  assert.equal(criadas.length, 3, "o teto por matéria precisa interromper a série");
  assert.equal(new Set(criadas).size, 3, "os três reforços têm de ser de formatos diferentes");
  assert.ok(criadas.includes("aula"), "com 108 aulas disponíveis, uma delas tem de entrar");
  assert.ok(criadas.includes("flashcards"), "com 160 flashcards disponíveis, um deles tem de entrar");
});
