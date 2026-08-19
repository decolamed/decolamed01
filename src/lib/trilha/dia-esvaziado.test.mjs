// Duas regras que o mentor pediu, e que o gerador precisa respeitar mesmo
// sendo REGERADO a cada leitura da tela do aluno:
//
//   1. um dia esvaziado pelo mentor continua existindo — mesma data, mesmo
//      número, sem conteúdo. Esvaziar não encurta o cronograma;
//   2. o dia de simulado não obedece ao limite diário de estudo. Simulado é
//      prova: tem duração própria e se faz de uma sentada.

import test from "node:test";
import assert from "node:assert/strict";
import { gerarRota, TITULO_DIA_LIVRE, MINUTOS_PADRAO_DO_SIMULADO } from "./rota.ts";

function template(n = 40) {
  const materias = ["Biologia", "Química", "Física", "Matemática", "Linguagens", "História", "Geografia"];
  return Array.from({ length: n }, (_, i) => ({
    dia_numero: i + 1,
    titulo: `Dia ${i + 1} do template`,
    itens: [
      { tipo: "aula", titulo: `Aula ${i + 1}`, materia: materias[i % materias.length], ref_id: null, url: "x" },
      { tipo: "questoes", titulo: `Questões ${i + 1}`, materia: materias[i % materias.length], ref_id: null, url: null }
    ]
  }));
}

const base = {
  inicio: "2026-08-12",
  dataProva: "2026-08-31",
  diasEstuda: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
  minutosPorDia: 180
};

const rota = (opcoes = {}) => gerarRota(template(), base, opcoes);
const dia = (r, n) => r.dias.find((d) => d.routeDay === n);

// ═══════════════════════════════ DIA ESVAZIADO ══════════════════════════════
test("o dia esvaziado continua na rota, com a mesma data", () => {
  const cheia = rota();
  const comVazio = rota({ diasLimpos: [8] });

  assert.equal(comVazio.dias.length, cheia.dias.length, "esvaziar não pode encurtar a rota");
  assert.equal(dia(comVazio, 8).scheduledDate, dia(cheia, 8).scheduledDate, "a data do dia 8 não muda");
});

test("o dia esvaziado fica sem conteúdo e sem minutos", () => {
  const r = rota({ diasLimpos: [8] });
  assert.deepEqual(dia(r, 8).itens, []);
  assert.equal(dia(r, 8).minutos, 0);
  assert.equal(dia(r, 8).titulo, TITULO_DIA_LIVRE);
});

test("continua sendo dia de estudo — não vira descanso", () => {
  // A diferença importa: descanso é folga planejada; este é um espaço que o
  // mentor abriu para colocar outra coisa.
  assert.equal(dia(rota({ diasLimpos: [8] }), 8).tipo, "estudo");
});

test("os outros dias não são reorganizados para tapar o buraco", () => {
  // O mentor abriu aquele espaço de propósito. Redistribuir o conteúdo do
  // dia 8 encheria de novo justamente o dia que ele quis deixar livre — e
  // mudaria dias que ele não pediu para mudar.
  const cheia = rota();
  const comVazio = rota({ diasLimpos: [8] });
  for (const n of [1, 2, 3, 4, 5, 6, 7]) {
    assert.deepEqual(
      dia(comVazio, n).itens.map((i) => i.titulo),
      dia(cheia, n).itens.map((i) => i.titulo),
      `o dia ${n} mudou`
    );
  }
});

test("vários dias esvaziados de uma vez", () => {
  const r = rota({ diasLimpos: [5, 8, 11] });
  for (const n of [5, 8, 11]) assert.deepEqual(dia(r, n).itens, [], `dia ${n} deveria estar vazio`);
  assert.equal(r.dias.length, rota().dias.length);
});

test("lista vazia ou dia inexistente não altera nada", () => {
  const cheia = JSON.stringify(rota().dias);
  assert.equal(JSON.stringify(rota({ diasLimpos: [] }).dias), cheia);
  assert.equal(JSON.stringify(rota({ diasLimpos: [999] }).dias), cheia);
  assert.equal(JSON.stringify(rota({ diasLimpos: [0, -3] }).dias), cheia);
});

test("é determinístico: esvaziar duas vezes dá a mesma rota", () => {
  assert.equal(
    JSON.stringify(rota({ diasLimpos: [8] }).dias),
    JSON.stringify(rota({ diasLimpos: [8] }).dias)
  );
});

// ═══════════════════════════════ SIMULADO ═══════════════════════════════════
const diasDeSimulado = (r) => r.dias.filter((d) => d.tipo === "simulado");

test("o simulado usa a duração real dele, não um valor fixo", () => {
  const r = rota({ simulados: [{ id: "s1", titulo: "Simulado FACAPE", duracaoMinutos: 240 }, null] });
  const [primeiro] = diasDeSimulado(r);
  assert.equal(primeiro.minutos, 240);
  assert.equal(primeiro.itens[0].duracao_minutos, 240);
});

test("o simulado PASSA do limite diário — e é para passar", () => {
  // 2h por dia declaradas no briefing, simulado de 4h. O limite vale para o
  // estudo, que o algoritmo distribui; a prova não se divide pela metade.
  const r = gerarRota(template(), { ...base, minutosPorDia: 120 }, {
    simulados: [{ id: "s1", titulo: "Simulado", duracaoMinutos: 240 }, null]
  });
  const [primeiro] = diasDeSimulado(r);
  assert.equal(primeiro.minutos, 240, "o dia de simulado foi cortado pelo limite diário");
  assert.ok(primeiro.minutos > 120, "o simulado precisa poder exceder o limite");
});

test("os dias de ESTUDO continuam respeitando o limite", () => {
  // A exceção é só do simulado. Se ela vazasse para o resto, o limite que o
  // aluno declarou deixaria de valer para o cronograma inteiro.
  const r = gerarRota(template(), { ...base, minutosPorDia: 120 }, {
    simulados: [{ id: "s1", titulo: "Simulado", duracaoMinutos: 240 }, null]
  });
  r.dias.filter((d) => d.tipo === "estudo").forEach((d) => {
    assert.ok(d.minutos <= 120, `dia ${d.routeDay} com ${d.minutos} min passou do limite de 120`);
  });
});

test("simulado sem duração cadastrada cai no padrão", () => {
  for (const duracao of [null, undefined, 0, -30]) {
    const r = rota({ simulados: [{ id: "s1", titulo: "Simulado", duracaoMinutos: duracao }, null] });
    assert.equal(diasDeSimulado(r)[0].minutos, MINUTOS_PADRAO_DO_SIMULADO, `duração ${duracao}`);
  }
});

test("posição sem simulado cadastrado também usa o padrão", () => {
  const r = rota({ simulados: [null, null] });
  diasDeSimulado(r).forEach((d) => assert.equal(d.minutos, MINUTOS_PADRAO_DO_SIMULADO));
});

// ═══════════════════════════════ AS DUAS JUNTAS ═════════════════════════════
test("esvaziar um dia não desloca os simulados", () => {
  const simulados = [{ id: "s1", titulo: "S1", duracaoMinutos: 240 }, { id: "s2", titulo: "S2", duracaoMinutos: 240 }];
  const antes = diasDeSimulado(rota({ simulados })).map((d) => d.routeDay);
  const depois = diasDeSimulado(rota({ simulados, diasLimpos: [8] })).map((d) => d.routeDay);
  assert.deepEqual(depois, antes);
});

test("esvaziar o dia de um simulado não tira o simulado", () => {
  // O simulado é a espinha da rota — o painel nem oferece "Esvaziar" nele,
  // mas o motor não pode depender disso para se manter íntegro.
  const simulados = [{ id: "s1", titulo: "S1", duracaoMinutos: 240 }, { id: "s2", titulo: "S2", duracaoMinutos: 240 }];
  const diaDoSimulado = diasDeSimulado(rota({ simulados }))[0].routeDay;
  const r = rota({ simulados, diasLimpos: [diaDoSimulado] });
  assert.equal(dia(r, diaDoSimulado).tipo, "simulado");
  assert.equal(dia(r, diaDoSimulado).itens.length, 1);
});
