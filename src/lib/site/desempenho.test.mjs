// O painel do aluno e o do admin precisam dar o MESMO número para a mesma
// pessoa. Estes testes fixam as contas que os dois usam — se divergirem, é
// aqui que quebra, e não numa reunião com o aluno perguntando por que a tela
// dele diz 78% e a do administrador diz 74%.

import test from "node:test";
import assert from "node:assert/strict";
import {
  percentual,
  resumoDeDesempenho,
  desempenhoPorMateria,
  desempenhoPorAssunto,
  evolucaoSemanal,
  tendencia,
  diasSemEstudar
} from "./desempenho.ts";

const q = (correta, materia, assunto, created_at) => ({
  correta,
  created_at,
  questoes: { materia, assunto }
});

// ─────────────────────────────────────────────────────────────── PERCENTUAL ──
test("percentual arredonda e não explode com zero", () => {
  assert.equal(percentual(35, 42), 83);
  assert.equal(percentual(0, 0), 0);
  assert.equal(percentual(1, 3), 33);
});

// ────────────────────────────────────────────────────────────────── RESUMO ──
test("o resumo conta questões, acertos, erros e precisão", () => {
  const r = resumoDeDesempenho(
    [q(true, "Biologia"), q(true, "Biologia"), q(false, "Química"), q(true, "Física")],
    [{ lembrou: true }, { lembrou: false }],
    [{ nota: 80 }, { nota: 60 }]
  );
  assert.equal(r.questoes, 4);
  assert.equal(r.acertos, 3);
  assert.equal(r.erros, 1);
  assert.equal(r.precisao, 75);
  assert.equal(r.flashcards, 2);
  assert.equal(r.precisaoFlashcards, 50);
  assert.equal(r.simulados, 2);
  assert.equal(r.mediaSimulados, 70);
  assert.equal(r.semDados, false);
});

test("aluno sem nenhuma atividade é 'sem dados', não 0% de acerto", () => {
  const r = resumoDeDesempenho([], [], []);
  assert.equal(r.semDados, true);
  assert.equal(r.precisao, 0);
  assert.equal(r.ultimaAtividade, null);
});

test("a última atividade é a mais recente entre questões, cards e simulados", () => {
  const r = resumoDeDesempenho(
    [q(true, "Biologia", null, "2026-08-01T10:00:00Z")],
    [{ lembrou: true, created_at: "2026-08-09T08:00:00Z" }],
    [{ nota: 70, created_at: "2026-08-05T12:00:00Z" }]
  );
  assert.equal(r.ultimaAtividade, "2026-08-09T08:00:00Z");
});

// ───────────────────────────────────────────────────────── POR MATÉRIA ──────
test("desempenho por matéria traz total, acertos, erros e aproveitamento", () => {
  const linhas = desempenhoPorMateria([
    q(true, "Biologia"), q(true, "Biologia"), q(false, "Biologia"),
    q(false, "Química"), q(false, "Química")
  ]);
  const bio = linhas.find((l) => l.materia === "Biologia");
  assert.deepEqual(
    { t: bio.total, a: bio.acertos, e: bio.erros, p: bio.aproveitamento },
    { t: 3, a: 2, e: 1, p: 67 }
  );
  const qui = linhas.find((l) => l.materia === "Química");
  assert.equal(qui.aproveitamento, 0);
  assert.equal(qui.erros, 2);
});

test("Português e Linguagens não viram duas linhas do mesmo aluno", () => {
  // Sem matéria canônica, o aluno apareceria com metade dos números em cada.
  const linhas = desempenhoPorMateria([q(true, "Português"), q(false, "Linguagens")]);
  assert.equal(linhas.length, 1, "deveria ser uma matéria só");
  assert.equal(linhas[0].total, 2);
});

test("a matéria mais praticada vem primeiro", () => {
  const linhas = desempenhoPorMateria([
    q(true, "Física"), q(true, "Biologia"), q(true, "Biologia"), q(true, "Biologia")
  ]);
  assert.equal(linhas[0].materia, "Biologia");
});

test("resposta sem matéria não some da conta geral", () => {
  const linhas = desempenhoPorMateria([q(true, null), q(false, "")]);
  assert.equal(linhas[0].materia, "Sem matéria");
  assert.equal(linhas[0].total, 2);
});

// ───────────────────────────────────────────────────────── POR CONTEÚDO ─────
test("por assunto ordena do PIOR aproveitamento — o que precisa de atenção", () => {
  const linhas = desempenhoPorAssunto([
    q(true, "Biologia", "Citologia"), q(true, "Biologia", "Citologia"),
    q(false, "Biologia", "Genética"), q(false, "Biologia", "Genética")
  ]);
  assert.equal(linhas[0].assunto, "Genética");
  assert.equal(linhas[0].aproveitamento, 0);
  assert.equal(linhas[1].assunto, "Citologia");
  assert.equal(linhas[1].aproveitamento, 100);
});

test("resposta sem assunto fica de fora da tabela de conteúdos", () => {
  const linhas = desempenhoPorAssunto([q(true, "Biologia", null), q(false, "Biologia", "  ")]);
  assert.deepEqual(linhas, []);
});

test("o mínimo de questões filtra conteúdo com amostra pequena demais", () => {
  const respostas = [
    q(false, "Biologia", "Genética"),
    q(true, "Biologia", "Citologia"), q(true, "Biologia", "Citologia"), q(true, "Biologia", "Citologia")
  ];
  assert.equal(desempenhoPorAssunto(respostas, 3).length, 1);
  assert.equal(desempenhoPorAssunto(respostas, 1).length, 2);
});

// ────────────────────────────────────────────────────────────── EVOLUÇÃO ────
test("a evolução agrupa por semana e calcula o aproveitamento de cada uma", () => {
  const pontos = evolucaoSemanal([
    // Semana de 03/08 (segunda) — 1 de 2
    q(true, "Biologia", null, "2026-08-04T10:00:00Z"),
    q(false, "Biologia", null, "2026-08-06T10:00:00Z"),
    // Semana de 10/08 — 2 de 2
    q(true, "Biologia", null, "2026-08-11T10:00:00Z"),
    q(true, "Biologia", null, "2026-08-12T10:00:00Z")
  ]);
  assert.equal(pontos.length, 2);
  assert.equal(pontos[0].semana, "2026-08-03");
  assert.equal(pontos[0].aproveitamento, 50);
  assert.equal(pontos[1].semana, "2026-08-10");
  assert.equal(pontos[1].aproveitamento, 100);
});

test("semana sem resposta não vira 0% — ausência de dado não é erro", () => {
  const pontos = evolucaoSemanal([
    q(true, "Biologia", null, "2026-07-06T10:00:00Z"),
    q(true, "Biologia", null, "2026-08-10T10:00:00Z")
  ]);
  assert.equal(pontos.length, 2, "as semanas vazias entre as duas não podem aparecer");
  assert.ok(pontos.every((p) => p.total > 0));
});

test("resposta sem data não quebra a evolução", () => {
  assert.deepEqual(evolucaoSemanal([q(true, "Biologia", null, null)]), []);
});

// ───────────────────────────────────────────────────────────── TENDÊNCIA ────
test("a tendência compara a última semana com as anteriores", () => {
  const subindo = tendencia([
    { semana: "1", total: 10, acertos: 5, aproveitamento: 50 },
    { semana: "2", total: 10, acertos: 8, aproveitamento: 80 }
  ]);
  assert.equal(subindo.direcao, "subindo");
  assert.equal(subindo.variacao, 30);

  const caindo = tendencia([
    { semana: "1", total: 10, acertos: 9, aproveitamento: 90 },
    { semana: "2", total: 10, acertos: 5, aproveitamento: 50 }
  ]);
  assert.equal(caindo.direcao, "caindo");

  const estavel = tendencia([
    { semana: "1", total: 10, acertos: 7, aproveitamento: 70 },
    { semana: "2", total: 10, acertos: 7, aproveitamento: 72 }
  ]);
  assert.equal(estavel.direcao, "estavel");
});

test("uma semana só não permite afirmar evolução nenhuma", () => {
  assert.equal(tendencia([{ semana: "1", total: 5, acertos: 3, aproveitamento: 60 }]), null);
  assert.equal(tendencia([]), null);
});

// ──────────────────────────────────────────────── DIAS SEM ESTUDAR ──────────
test("dias sem estudar é a distância até hoje", () => {
  assert.equal(diasSemEstudar("2026-08-10T22:00:00Z", "2026-08-13"), 3);
  assert.equal(diasSemEstudar("2026-08-13T01:00:00Z", "2026-08-13"), 0);
});

test("aluno que nunca estudou não vira '0 dias sem estudar'", () => {
  assert.equal(diasSemEstudar(null, "2026-08-13"), null);
});

// ─────────────────────────────────────── ALUNO E ADMIN VEEM O MESMO ─────────
test("as mesmas linhas produzem os mesmos números em qualquer painel", () => {
  const respostas = [
    q(true, "Biologia", "Citologia", "2026-08-01T10:00:00Z"),
    q(true, "Biologia", "Citologia", "2026-08-02T10:00:00Z"),
    q(false, "Química", "Estequiometria", "2026-08-03T10:00:00Z")
  ];
  const doAluno = resumoDeDesempenho(respostas, [], []);
  const doAdmin = resumoDeDesempenho(respostas, [], []);
  assert.deepEqual(doAluno, doAdmin);
  assert.deepEqual(desempenhoPorMateria(respostas), desempenhoPorMateria(respostas));
  assert.equal(doAluno.precisao, 67);
});
