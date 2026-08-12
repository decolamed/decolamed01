// Testes do orçamento diário do Copiloto.
//
// Cobrem os cenários 1, 2 e 3 exigidos no pedido: o limite de horas do aluno
// não pode ser ultrapassado, a adaptação do cronograma respeita o mesmo teto,
// e um dia cheio redistribui em vez de crescer.

import test from "node:test";
import assert from "node:assert/strict";
import { montarAgenda } from "./agenda.ts";

function agenda({ horas = 3, cronograma = {}, missoes = [], bloqueadas = [] } = {}) {
  return montarAgenda({
    minutosPorDia: horas * 60,
    cargaDoCronograma: new Map(Object.entries(cronograma)),
    missoes,
    bloqueadas: new Set(bloqueadas)
  });
}

// ------------------------------------------------------------- CENÁRIO 1 --
test("CENÁRIO 1 — aluno com 2h/dia não recebe mais de 2h de atividades", () => {
  const a = agenda({ horas: 2 });

  assert.equal(a.minutosPorDia, 120);
  assert.ok(a.cabe("2026-08-12", 90));
  a.reservar("2026-08-12", 90);

  assert.equal(a.livreEm("2026-08-12"), 30);
  assert.ok(a.cabe("2026-08-12", 30), "os 30 min que sobram continuam utilizáveis");
  assert.ok(!a.cabe("2026-08-12", 40), "40 min estourariam as 2 horas");
});

test("a conta soma TODAS as durações do dia, não a quantidade de atividades", () => {
  // 1h de aula + 1h de questões + 30 min de revisão + 30 min de outra = 3h.
  const a = agenda({ horas: 3 });
  [60, 60, 30, 30].forEach((min) => {
    assert.ok(a.cabe("2026-08-12", min), `${min} min deveriam caber`);
    a.reservar("2026-08-12", min);
  });

  assert.equal(a.ocupadoEm("2026-08-12"), 180);
  assert.equal(a.livreEm("2026-08-12"), 0);
  assert.ok(!a.cabe("2026-08-12", 5), "o dia fechou exatamente no limite");
});

// ------------------------------------------------------------- CENÁRIO 2 --
test("CENÁRIO 2 — a adaptação conta o conteúdo do cronograma, não só as missões", () => {
  // Este é o defeito real: o dia já tem 3h de rota, o aluno estuda 4h/dia e
  // havia 1h de missão. A conta antiga (só missões) enxergava 3h livres.
  const a = agenda({
    horas: 4,
    cronograma: { "2026-08-12": 180 },
    missoes: [{ data: "2026-08-12", minutos: 60 }]
  });

  assert.equal(a.ocupadoEm("2026-08-12"), 240);
  assert.equal(a.livreEm("2026-08-12"), 0);
  assert.ok(!a.cabe("2026-08-12", 40), "o dia já está nas 4h declaradas");
});

test("o cronograma sozinho já pode fechar o dia", () => {
  const a = agenda({ horas: 2, cronograma: { "2026-08-12": 120 } });
  assert.ok(!a.cabe("2026-08-12", 10));
  assert.equal(a.livreEm("2026-08-12"), 0);
});

// ------------------------------------------------------------- CENÁRIO 3 --
test("CENÁRIO 3 — dia cheio empurra a atividade para o próximo com espaço", () => {
  const a = agenda({
    horas: 3,
    cronograma: { "2026-08-12": 180, "2026-08-13": 150 },
    missoes: []
  });
  const janela = ["2026-08-12", "2026-08-13", "2026-08-14"];

  // 40 min não cabem no dia 12 (cheio) nem no 13 (só 30 livres) → vai pro 14.
  assert.equal(a.primeiraDataComEspaco(janela, 40), "2026-08-14");
  // 30 min ainda cabem no dia 13.
  assert.equal(a.primeiraDataComEspaco(janela, 30), "2026-08-13");
});

test("sem nenhum dia com espaço, devolve null em vez de estourar algum dia", () => {
  const a = agenda({ horas: 1, cronograma: { "2026-08-12": 60, "2026-08-13": 60 } });
  assert.equal(a.primeiraDataComEspaco(["2026-08-12", "2026-08-13"], 30), null);
});

test("reservas se acumulam dentro da mesma execução", () => {
  // Dois trechos do motor enchendo o mesmo dia sem se ver era um dos jeitos
  // de estourar o limite.
  const a = agenda({ horas: 2 });
  a.reservar("2026-08-12", 60);
  a.reservar("2026-08-12", 40);
  assert.equal(a.ocupadoEm("2026-08-12"), 100);
  assert.ok(!a.cabe("2026-08-12", 30));
});

test("liberar devolve o tempo de uma missão removida", () => {
  const a = agenda({ horas: 2, missoes: [{ data: "2026-08-12", minutos: 90 }] });
  assert.ok(!a.cabe("2026-08-12", 60));
  a.liberar("2026-08-12", 90);
  assert.ok(a.cabe("2026-08-12", 60), "o espaço da missão removida volta a existir");
});

// ------------------------------------------------------- DATAS BLOQUEADAS --
test("CENÁRIO 4 — o dia da prova não aceita nenhuma atividade", () => {
  const a = agenda({ horas: 4, bloqueadas: ["2026-08-31"] });
  assert.ok(a.bloqueada("2026-08-31"));
  assert.equal(a.livreEm("2026-08-31"), 0);
  assert.ok(!a.cabe("2026-08-31", 5), "nem 5 minutos entram no dia da prova");
  assert.equal(a.primeiraDataComEspaco(["2026-08-31"], 5), null);
});

test("a véspera reservada para descanso também é intocável", () => {
  const a = agenda({ horas: 4, bloqueadas: ["2026-08-30", "2026-08-31"] });
  assert.equal(a.primeiraDataComEspaco(["2026-08-30", "2026-08-31", "2026-09-01"], 40), "2026-09-01");
});

// ------------------------------------------------------------------ BORDA --
test("briefing com 0 horas não trava o Copiloto — cai no piso de 30 min", () => {
  const a = agenda({ horas: 0 });
  assert.equal(a.minutosPorDia, 30);
  assert.ok(a.cabe("2026-08-12", 30));
});
