// Testes do gerador de rota (node --test src/lib/trilha/rota.test.mjs).
//
// O gerador é uma função pura: entram template + parâmetros, sai a rota.
// Isso permite verificar de verdade os critérios de aceitação do pedido —
// numeração, datas, simulados, determinismo — sem precisar de banco.
//
// Os cenários abaixo são os TESTES A a F do documento de correção.

import test from "node:test";
import assert from "node:assert/strict";
import {
  gerarRota,
  diaAtualDaRota,
  datasDisponiveis,
  posicionarSimulados,
  parametrosDoBriefing,
  cronogramaDeTela,
  datasDaRota,
  diasDeEstudoDaRota,
  tituloDaProva,
  TITULO_VESPERA,
  DIAS_MINIMOS_APOS_SIMULADO_2
} from "./rota.ts";

/** Template de 40 dias parecido com o do banco. */
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

const TODOS_OS_DIAS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

const base = {
  inicio: "2026-08-12",
  dataProva: "2026-08-31",
  diasEstuda: TODOS_OS_DIAS,
  minutosPorDia: 180
};

// ---------------------------------------------------------------- TESTE A --
test("A — rota nova começa exatamente na data informada e numera a partir de 1", () => {
  const { dias } = gerarRota(template(), base);

  assert.ok(dias.length > 0, "a rota não pode sair vazia");
  assert.equal(dias[0].scheduledDate, "2026-08-12", "o dia 1 tem de cair na data de início");
  assert.equal(dias[0].routeDay, 1, "a numeração começa em 1");
  assert.equal(dias[1].routeDay, 2, "o segundo dia é o Dia 2, nunca o Dia 22");

  // Numeração contínua, sem buraco.
  dias.forEach((d, i) => assert.equal(d.routeDay, i + 1));

  // Nenhum dia de ESTUDO cai na prova ou depois — o único dia na data da
  // prova é o próprio evento.
  diasDeEstudoDaRota(dias).forEach((d) =>
    assert.ok(d.scheduledDate < base.dataProva, `dia ${d.routeDay} caiu em ${d.scheduledDate}`)
  );
});

// ---------------------------------------------------------------- TESTE E --
test("E — nenhuma data anterior ao início (o bug do 12/07 num cronograma de 12/08)", () => {
  const { dias } = gerarRota(template(), base);
  const anteriores = dias.filter((d) => d.scheduledDate < base.inicio);
  assert.equal(anteriores.length, 0, `datas antes do início: ${anteriores.map((d) => d.scheduledDate).join(", ")}`);
});

// ---------------------------------------------------------------- TESTE C --
test("C — janela de 19 dias produz exatamente 19 dias numerados de 1 a 19", () => {
  // 12/08 a 31/08, estudando todo dia = 19 dias (o dia da prova não conta).
  const disponiveis = datasDisponiveis(base);
  assert.equal(disponiveis.length, 19, `esperado 19 dias disponíveis, veio ${disponiveis.length}`);

  const { dias } = gerarRota(template(), base);
  const estudo = diasDeEstudoDaRota(dias);
  assert.equal(estudo.length, 19, "a rota tem de ter o mesmo tamanho da janela");
  assert.equal(estudo[estudo.length - 1].routeDay, 19);

  // Nenhum número do template vaza para a numeração da rota.
  assert.deepEqual(
    estudo.map((d) => d.routeDay),
    Array.from({ length: 19 }, (_, i) => i + 1)
  );

  // E nenhum título expõe o agrupamento interno ("Dia 38 + Dia 39 + Dia 40").
  dias.forEach((d) => assert.ok(!d.titulo.includes(" + Dia "), `título expõe compressão: ${d.titulo}`));
});

test("C2 — todo o conteúdo do template continua na rota, nada é descartado", () => {
  const t = template();
  const { dias } = gerarRota(t, base);

  const itensTemplate = t.flatMap((d) => d.itens).length;
  const itensNaRota = dias.filter((d) => d.tipo === "estudo").flatMap((d) => d.itens).length;
  assert.equal(itensNaRota, itensTemplate, "todo item do template precisa aparecer na rota");

  const templateDays = dias.flatMap((d) => d.templateDays).sort((a, b) => a - b);
  assert.deepEqual(templateDays, t.map((d) => d.dia_numero), "todo dia do template precisa ter destino");
});

// ---------------------------------------------------------------- TESTE D --
test("D — toda rota tem 2 simulados, e o segundo respeita a folga até a prova", () => {
  const { dias } = gerarRota(template(), base);
  const simulados = dias.filter((d) => d.tipo === "simulado");

  assert.equal(simulados.length, 2, "toda rota precisa de exatamente 2 simulados");

  const [s1, s2] = simulados;
  assert.ok(s1.scheduledDate < s2.scheduledDate, "o simulado 1 vem antes do 2");

  const limite = "2026-08-24"; // 31/08 menos 7 dias
  assert.ok(s2.scheduledDate <= limite, `simulado 2 em ${s2.scheduledDate}, depois do limite ${limite}`);

  // Sobra tempo de revisão depois do segundo simulado.
  const revisoes = dias.filter((d) => d.tipo === "revisao" && d.scheduledDate > s2.scheduledDate);
  assert.ok(revisoes.length >= 1, "precisa sobrar pelo menos um dia de revisão após o simulado 2");
});

test("D2 — os 2 simulados existem também em rotas curtas e longas", () => {
  for (const [inicio, prova, rotulo] of [
    ["2026-08-12", "2026-08-22", "rota curta (10 dias)"],
    ["2026-08-12", "2026-09-30", "rota longa (49 dias)"],
    ["2026-08-12", "2026-08-18", "rota muito curta (6 dias)"]
  ]) {
    const p = { ...base, inicio, dataProva: prova };
    const { dias } = gerarRota(template(), p);
    const simulados = dias.filter((d) => d.tipo === "simulado");
    assert.equal(simulados.length, 2, `${rotulo}: esperado 2 simulados, veio ${simulados.length}`);
    assert.notEqual(
      simulados[0].scheduledDate,
      simulados[1].scheduledDate,
      `${rotulo}: os dois simulados caíram no mesmo dia`
    );
  }
});

test("D3 — na rota longa o simulado 2 fica no último dia que respeita a folga", () => {
  const p = { ...base, inicio: "2026-08-12", dataProva: "2026-09-30" };
  const { dias } = gerarRota(template(), p);
  const s2 = dias.filter((d) => d.tipo === "simulado")[1];
  const limite = "2026-09-23"; // 30/09 menos 7
  assert.ok(s2.scheduledDate <= limite);
  // Não pode estar muito longe do limite: perderia o sentido de diagnóstico.
  assert.ok(s2.scheduledDate >= "2026-09-20", `simulado 2 cedo demais: ${s2.scheduledDate}`);
});

// ------------------------------------------------------------- DIAS DA SEMANA
test("respeita os dias da semana escolhidos", () => {
  const p = { ...base, diasEstuda: ["seg", "qua", "sex"] };
  const { dias } = gerarRota(template(), p);

  const nomes = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  dias.forEach((d) => {
    const idx = new Date(d.scheduledDate + "T12:00:00Z").getUTCDay();
    assert.ok(["seg", "qua", "sex"].includes(nomes[idx]), `${d.scheduledDate} caiu numa ${nomes[idx]}`);
  });

  // Datas estritamente crescentes, sem repetição.
  for (let i = 1; i < dias.length; i++) {
    assert.ok(dias[i].scheduledDate > dias[i - 1].scheduledDate, "as datas têm de ser crescentes e únicas");
  }
});

// ------------------------------------------------------------- DETERMINISMO --
test("10 — mesmos parâmetros produzem exatamente a mesma rota", () => {
  const a = gerarRota(template(), base);
  const b = gerarRota(template(), base);
  assert.deepEqual(b.dias, a.dias, "o gerador precisa ser determinístico");
  assert.equal(b.assinatura, a.assinatura);
});

test("10b — mudar qualquer parâmetro muda a assinatura", () => {
  const original = gerarRota(template(), base).assinatura;
  assert.notEqual(gerarRota(template(), { ...base, inicio: "2026-08-13" }).assinatura, original);
  assert.notEqual(gerarRota(template(), { ...base, dataProva: "2026-09-01" }).assinatura, original);
  assert.notEqual(gerarRota(template(), { ...base, minutosPorDia: 240 }).assinatura, original);
  assert.notEqual(gerarRota(template(), { ...base, diasEstuda: ["seg", "ter"] }).assinatura, original);
});

// ------------------------------------------------------------- TESTE B / F --
test("F — o dia atual da rota acompanha o calendário, sem missão fixa", () => {
  const { dias } = gerarRota(template(), base);

  assert.equal(diaAtualDaRota(dias, "2026-08-12").routeDay, 1, "no dia do início, é o Dia 1");
  assert.equal(diaAtualDaRota(dias, "2026-08-13").routeDay, 2, "no dia seguinte, é o Dia 2");
  assert.equal(diaAtualDaRota(dias, "2026-08-20").routeDay, 9);

  // Antes de começar, aponta para o primeiro dia — não para um dia passado.
  assert.equal(diaAtualDaRota(dias, "2026-08-01").routeDay, 1);

  // Depois do fim, o último — nunca null nem um dia inexistente.
  assert.equal(diaAtualDaRota(dias, "2026-09-15").routeDay, dias.length);
});

test("F2 — num dia não marcado, aponta para o próximo dia de estudo", () => {
  const p = { ...base, diasEstuda: ["seg", "qua", "sex"] };
  const { dias } = gerarRota(template(), p);
  // 2026-08-12 é uma quarta; 13 é quinta (não estuda) → deve apontar pra sexta 14.
  const atual = diaAtualDaRota(dias, "2026-08-13");
  assert.equal(atual.scheduledDate, "2026-08-14");
});

test("B — rota regerada com os mesmos parâmetros volta ao Dia 1 no início", () => {
  // Simula o reset: gera de novo, do zero, sem qualquer estado anterior.
  const nova = gerarRota(template(), base);
  assert.equal(nova.dias[0].routeDay, 1);
  assert.equal(nova.dias[0].scheduledDate, base.inicio);
  assert.equal(diaAtualDaRota(nova.dias, base.inicio).routeDay, 1);
});

// ------------------------------------------------- PARÂMETROS DO BRIEFING --
test("4 — a âncora é o início informado pelo aluno, não a data de matrícula", () => {
  const p = parametrosDoBriefing(
    {
      data_prova: "2026-08-31",
      inicio_estudos: "2026-08-12",
      dias_estuda: TODOS_OS_DIAS,
      horas_por_dia_semana: 3
    },
    "2026-08-09" // hoje é ANTES do início informado
  );
  assert.equal(p.inicio, "2026-08-12", "tem de respeitar a data que o aluno informou");
  assert.equal(p.minutosPorDia, 180);

  const { dias } = gerarRota(template(), p);
  assert.equal(dias[0].scheduledDate, "2026-08-12");
  assert.equal(dias.filter((d) => d.scheduledDate < "2026-08-12").length, 0);
});

test("4b — início já passado usa hoje, não ressuscita dias vencidos", () => {
  const p = parametrosDoBriefing(
    { data_prova: "2026-08-31", inicio_estudos: "2026-07-12", dias_estuda: TODOS_OS_DIAS, horas_por_dia_semana: 2 },
    "2026-08-09"
  );
  assert.equal(p.inicio, "2026-08-09", "o que passou não volta");
  const { dias } = gerarRota(template(), p);
  assert.equal(dias.filter((d) => d.scheduledDate < "2026-08-09").length, 0);
});

test("sem data de prova não há rota — melhor nada do que uma rota chutada", () => {
  assert.equal(parametrosDoBriefing({ data_prova: null }, "2026-08-09"), null);
  assert.equal(parametrosDoBriefing(null, "2026-08-09"), null);
});

test("prova já passada ou no mesmo dia não gera rota", () => {
  assert.equal(
    parametrosDoBriefing({ data_prova: "2026-08-09", inicio_estudos: "2026-08-09" }, "2026-08-09"),
    null
  );
});

// ------------------------------------------------------------ POSICIONAMENTO
test("posicionarSimulados respeita a folga de 7 dias", () => {
  const datas = datasDisponiveis(base);
  const { indiceSim1, indiceSim2 } = posicionarSimulados(datas, base.dataProva);
  assert.ok(indiceSim1 >= 0 && indiceSim2 > indiceSim1, "os dois simulados precisam existir e estar separados");

  const dataSim2 = datas[indiceSim2];
  const diff = Math.round(
    (new Date(base.dataProva + "T12:00:00Z") - new Date(dataSim2 + "T12:00:00Z")) / 86400000
  );
  assert.ok(diff >= DIAS_MINIMOS_APOS_SIMULADO_2, `folga de ${diff} dias, mínimo ${DIAS_MINIMOS_APOS_SIMULADO_2}`);
});

// ------------------------------------------------------------ SIMULADOS REAIS
test("os dias de simulado apontam para simulados reais da plataforma", () => {
  const simulados = [
    { id: "sim-1", titulo: "Simulado Geral I" },
    { id: "sim-2", titulo: "Simulado Geral II" }
  ];
  const { dias } = gerarRota(template(), base, { simulados });
  const doDia = dias.filter((d) => d.tipo === "simulado");

  assert.equal(doDia.length, 2);
  // Sem ref_id o aluno cairia na lista genérica de simulados em vez do
  // simulado que a rota reservou para aquele dia.
  assert.equal(doDia[0].itens[0].ref_id, "sim-1");
  assert.equal(doDia[1].itens[0].ref_id, "sim-2");
  assert.equal(doDia[0].itens[0].titulo, "Simulado Geral I");
});

test("sem simulado cadastrado o dia continua existindo (a rota promete dois)", () => {
  const { dias } = gerarRota(template(), base, { simulados: [] });
  const doDia = dias.filter((d) => d.tipo === "simulado");
  assert.equal(doDia.length, 2);
  assert.equal(doDia[0].itens[0].ref_id, null);
});

// ----------------------------------------------------------- FORMATO DE TELA
test("o que chega na tela usa o routeDay, nunca o dia do template", () => {
  const rota = gerarRota(template(), base);
  const tela = cronogramaDeTela(rota);

  assert.equal(tela.length, rota.dias.length);
  tela.forEach((d, i) => assert.equal(d.dia_numero, i + 1));
  // O dia 2 da tela pode ter vindo dos dias 3..4 do template — e o número do
  // template não pode vazar para lugar nenhum além de `template_days`.
  assert.ok(tela.some((d) => d.template_days.length > 1), "este cenário precisa ter dias agrupados");
  assert.equal(
    tela.filter((d) => /Dia \d+ do template/.test(d.titulo)).length,
    tela.filter((d) => d.template_days.length === 1).length,
    "só um dia alimentado por um único dia do template mantém o título de origem"
  );
});

test("as datas da rota vêm prontas, não são extrapoladas a partir de hoje", () => {
  const rota = gerarRota(template(), base);
  const mapa = datasDaRota(rota);

  assert.equal(mapa[1], "2026-08-12");
  assert.equal(Object.keys(mapa).length, rota.dias.length);
  rota.dias.forEach((d) => assert.equal(mapa[d.routeDay], d.scheduledDate));
});

// --------------------------------------------------------- DIA DA PROVA ----
test("o dia da prova sempre entra na rota, sempre sem conteúdo", () => {
  const { dias } = gerarRota(template(), base, { nomeVestibular: "FACAPE" });
  const prova = dias.filter((d) => d.tipo === "prova");

  assert.equal(prova.length, 1, "um e apenas um dia de prova");
  assert.equal(prova[0].scheduledDate, base.dataProva);
  assert.equal(prova[0], dias[dias.length - 1], "é o último dia da rota");
  assert.equal(prova[0].itens.length, 0, "o dia da prova não recebe conteúdo nenhum");
  assert.equal(prova[0].minutos, 0);
  assert.equal(prova[0].titulo, "DIA DA PROVA — VESTIBULAR FACAPE");
});

test("sem instituição configurada o dia da prova não vira 'VESTIBULAR VESTIBULAR'", () => {
  assert.equal(tituloDaProva(null), "DIA DA PROVA");
  assert.equal(tituloDaProva("vestibular"), "DIA DA PROVA");
  assert.equal(tituloDaProva("  facape "), "DIA DA PROVA — VESTIBULAR FACAPE");
});

test("mesmo numa janela mínima o dia da prova aparece", () => {
  // 3 dias de estudo — a rota mais apertada que ainda existe.
  const curta = { ...base, inicio: "2026-08-28", dataProva: "2026-08-31" };
  const { dias } = gerarRota(template(), curta);
  const prova = dias[dias.length - 1];
  assert.equal(prova.tipo, "prova");
  assert.equal(prova.scheduledDate, "2026-08-31");
});

// ------------------------------------------------------------- VÉSPERA ----
test("com folga, a véspera vira descanso e não recebe conteúdo novo", () => {
  // Template pequeno numa janela larga: sobra tempo de sobra.
  const { dias } = gerarRota(template(6), base);
  const vespera = dias.find((d) => d.scheduledDate === "2026-08-30");

  assert.equal(vespera.tipo, "descanso");
  assert.equal(vespera.titulo, TITULO_VESPERA);
  assert.equal(vespera.itens.length, 0, "descanso é descanso: nada de revisão nem questões");
});

test("na janela curta a véspera é usada normalmente — descanso é a última prioridade", () => {
  // 3 dias até a prova: não há folga para abrir mão de um dia inteiro, e a
  // véspera continua servindo à preparação (aqui, ao simulado).
  const curta = { ...base, inicio: "2026-08-28", dataProva: "2026-08-31" };
  const { dias } = gerarRota(template(), curta);
  const vespera = dias.find((d) => d.scheduledDate === "2026-08-30");

  assert.notEqual(vespera.tipo, "descanso");
  // Mas o dia da prova continua lá, intocado — é a prioridade número 1.
  assert.equal(dias[dias.length - 1].tipo, "prova");
});

test("quando a véspera já era dia de revisão, virar descanso não custa conteúdo", () => {
  const { dias } = gerarRota(template(), base);
  const vespera = dias.find((d) => d.scheduledDate === "2026-08-30");
  assert.equal(vespera.tipo, "descanso");
  assert.equal(vespera.itens.length, 0);
});

test("todo o conteúdo continua na rota mesmo com prova e véspera reservadas", () => {
  const t = template(6);
  const { dias } = gerarRota(t, base);

  const titulosNaRota = dias.flatMap((d) => d.itens.map((i) => i.titulo));
  t.forEach((dia) =>
    dia.itens.forEach((item) =>
      assert.ok(titulosNaRota.includes(item.titulo), `item perdido: ${item.titulo}`)
    )
  );
});
