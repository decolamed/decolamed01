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

test("C2 — cabendo tudo, tudo entra: nada é descartado sem necessidade", () => {
  // Este teste dizia o contrário até esta rodada: exigia que TODO o template
  // entrasse na rota, sempre. Era a regra errada — com 10 dias de 3h e 167h
  // de template, cumpri-la só era possível ignorando a capacidade do aluno,
  // que é justamente o que produzia os dias impossíveis. Deixar conteúdo de
  // fora quando não cabe é a decisão certa; o que o teste garante agora é que
  // isso só acontece por falta de espaço.
  const t = template(6); // 12 itens, folgados numa janela de 19 dias
  const { dias } = gerarRota(t, base);

  const itensTemplate = t.flatMap((d) => d.itens).length;
  const itensNaRota = dias.filter((d) => d.tipo === "estudo").flatMap((d) => d.itens).length;
  assert.equal(itensNaRota, itensTemplate, "com espaço de sobra, nenhum item pode ficar de fora");

  const templateDays = [...new Set(dias.flatMap((d) => d.templateDays))].sort((a, b) => a - b);
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

test("4b — a rota é ancorada no início do aluno, mesmo que ele já tenha passado", () => {
  // Este teste já afirmou o CONTRÁRIO: que um início passado virava "hoje",
  // para não ressuscitar dias vencidos. A intenção era boa e o efeito era
  // ruim — remontar a rota a partir de hoje, todo dia, congelava o aluno no
  // dia 1 para sempre (ver o teste seguinte) e fazia os ajustes do mentor,
  // que são gravados por NÚMERO do dia, caírem numa data diferente a cada dia.
  const p = parametrosDoBriefing(
    { data_prova: "2026-08-31", inicio_estudos: "2026-07-12", dias_estuda: TODOS_OS_DIAS, horas_por_dia_semana: 2 },
    "2026-08-09"
  );
  assert.equal(p.inicio, "2026-07-12", "a régua é a jornada do aluno, não o dia de hoje");
});

test("4c — o dia de hoje AVANÇA de um dia para o outro", () => {
  // O defeito relatado por uma aluna: o cartão dizia "DIA 1 DE 44" na terça,
  // "DIA 1 DE 43" na quarta, "DIA 1 DE 42" na quinta. O total encolhia com o
  // calendário e o contador nunca saía do 1 — ela não via progresso nenhum
  // porque não havia progresso a ver.
  const briefing = {
    data_prova: "2026-08-31",
    inicio_estudos: "2026-08-01",
    dias_estuda: TODOS_OS_DIAS,
    horas_por_dia_semana: 2
  };

  const lido = (hoje) => {
    const rota = gerarRota(template(), parametrosDoBriefing(briefing, hoje));
    return {
      dia: diaAtualDaRota(rota.dias, hoje)?.routeDay,
      total: rota.dias.filter((d) => d.tipo !== "prova").length
    };
  };

  const terca = lido("2026-08-11");
  const quarta = lido("2026-08-12");
  const quinta = lido("2026-08-13");

  assert.equal(quarta.dia, terca.dia + 1, "o dia de amanhã é o de hoje mais um");
  assert.equal(quinta.dia, terca.dia + 2);
  assert.equal(quarta.total, terca.total, "e o total para de encolher");
  assert.equal(quinta.total, terca.total);
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

test("cada posição usa o SEU simulado — a lista chega já decidida", () => {
  const { dias } = gerarRota(template(), base, {
    simulados: [
      { id: "sim-1", titulo: "Simulado ENEM 01" },
      { id: "sim-2", titulo: "Simulado ENEM 02" }
    ]
  });
  const doDia = dias.filter((d) => d.tipo === "simulado");
  assert.deepEqual(
    doDia.map((d) => d.itens[0].ref_id),
    ["sim-1", "sim-2"]
  );
});

test("só um simulado: a 2ª posição fica sem ref_id em vez de repetir a 1ª", () => {
  // Era o `?? simulados[0]`: com um único simulado cadastrado os DOIS dias
  // abriam a mesma prova, sem nada na tela indicando isso. Agora a posição
  // vazia leva à lista de simulados — e quem decide o conteúdo da lista é
  // simulados-da-rota.ts, não este módulo.
  const { dias } = gerarRota(template(), base, {
    simulados: [{ id: "sim-1", titulo: "Simulado ENEM 01" }, null]
  });
  const refs = dias.filter((d) => d.tipo === "simulado").map((d) => d.itens[0].ref_id);
  assert.deepEqual(refs, ["sim-1", null]);
  assert.notEqual(refs[0], refs[1], "a duplicação silenciosa não pode voltar");
});

test("posição 1 vazia e posição 2 preenchida não desloca o simulado", () => {
  const { dias } = gerarRota(template(), base, {
    simulados: [null, { id: "sim-2", titulo: "Simulado ENEM 02" }]
  });
  assert.deepEqual(
    dias.filter((d) => d.tipo === "simulado").map((d) => d.itens[0].ref_id),
    [null, "sim-2"]
  );
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

// ============================================================================
// CENÁRIO OBRIGATÓRIO DA AUDITORIA — 12/08/2026 → 31/08/2026
//
// Um único teste que verifica de uma vez tudo que o pedido lista: datas,
// número de dias, Dia 1, Dia 2, missão atual, simulados e revisão. Se
// qualquer um dos conceitos voltar a se misturar, este teste cai.
// ============================================================================
test("AUDITORIA — rota de 12/08/2026 a 31/08/2026, ponto a ponto", () => {
  const p = parametrosDoBriefing(
    {
      data_prova: "2026-08-31",
      inicio_estudos: "2026-08-12",
      dias_estuda: TODOS_OS_DIAS,
      horas_por_dia_semana: 3
    },
    "2026-08-12"
  );
  const rota = gerarRota(template(40), p, { nomeVestibular: "FACAPE" });
  const { dias } = rota;
  const estudo = diasDeEstudoDaRota(dias);

  // --- datas ---------------------------------------------------------
  assert.equal(dias[0].scheduledDate, "2026-08-12", "a rota começa na data informada");
  assert.equal(
    dias.filter((d) => d.scheduledDate < "2026-08-12").length,
    0,
    "nenhuma data anterior ao início (o bug das atividades em julho)"
  );
  // Datas estritamente crescentes, sem repetição.
  dias.forEach((d, i) => {
    if (i === 0) return;
    assert.ok(d.scheduledDate > dias[i - 1].scheduledDate, `data fora de ordem no dia ${d.routeDay}`);
  });

  // --- número de dias ------------------------------------------------
  assert.equal(estudo.length, 19, "19 dias de estudo");
  assert.equal(dias.length, 20, "19 de estudo + o dia da prova");

  // --- Dia 1 e Dia 2 -------------------------------------------------
  assert.equal(dias[0].routeDay, 1);
  assert.equal(dias[1].routeDay, 2, "o segundo dia é o Dia 2 — nunca o Dia 22");
  estudo.forEach((d, i) => assert.equal(d.routeDay, i + 1, "numeração 1..19 sem buraco"));

  // Nenhum número do template escapa para o que o aluno lê.
  dias.forEach((d) => {
    assert.ok(!/Dia \d+ do template/.test(d.titulo), `título expõe o template: ${d.titulo}`);
    assert.ok(!d.titulo.includes(" + Dia "), `título expõe o agrupamento: ${d.titulo}`);
  });

  // --- missão atual --------------------------------------------------
  assert.equal(diaAtualDaRota(dias, "2026-08-12").routeDay, 1, "em 12/08 o aluno está no Dia 1");
  assert.equal(diaAtualDaRota(dias, "2026-08-13").routeDay, 2, "em 13/08 avança para o Dia 2");
  assert.equal(diaAtualDaRota(dias, "2026-08-31").tipo, "prova", "no dia da prova, o evento");
  // Nada de dia anterior no primeiro dia: o "21 dias anteriores" nascia daqui.
  assert.equal(estudo.filter((d) => d.scheduledDate < "2026-08-12").length, 0);

  // --- simulados -----------------------------------------------------
  const sims = dias.filter((d) => d.tipo === "simulado");
  assert.equal(sims.length, 2, "exatamente 2 simulados");
  assert.ok(sims[1].scheduledDate <= "2026-08-24", `simulado 2 em ${sims[1].scheduledDate}, limite 24/08`);
  assert.ok(sims[0].scheduledDate < sims[1].scheduledDate, "os dois em dias diferentes");

  // --- revisão e fechamento ------------------------------------------
  assert.ok(
    dias.some((d) => d.tipo === "revisao"),
    "sobra tempo de revisão depois do simulado 2"
  );
  const ultimo = dias[dias.length - 1];
  assert.equal(ultimo.tipo, "prova");
  assert.equal(ultimo.scheduledDate, "2026-08-31");
  assert.equal(ultimo.itens.length, 0, "o dia da prova não recebe conteúdo");
  assert.equal(ultimo.titulo, "DIA DA PROVA — VESTIBULAR FACAPE");
});

test("AUDITORIA — regerar com os mesmos parâmetros não muda nada", () => {
  // Uma rota antiga não pode contaminar a nova: a geração é determinística,
  // então duas gerações seguidas têm de ser idênticas dia a dia.
  const p = parametrosDoBriefing(
    { data_prova: "2026-08-31", inicio_estudos: "2026-08-12", dias_estuda: TODOS_OS_DIAS, horas_por_dia_semana: 3 },
    "2026-08-12"
  );
  const a = gerarRota(template(40), p, { nomeVestibular: "FACAPE" });
  const b = gerarRota(template(40), p, { nomeVestibular: "FACAPE" });

  assert.equal(a.assinatura, b.assinatura);
  assert.deepEqual(
    a.dias.map((d) => [d.routeDay, d.scheduledDate, d.tipo, d.titulo]),
    b.dias.map((d) => [d.routeDay, d.scheduledDate, d.tipo, d.titulo])
  );
});

test("AUDITORIA — mudar a data de início joga a rota inteira para frente", () => {
  const base12 = parametrosDoBriefing(
    { data_prova: "2026-08-31", inicio_estudos: "2026-08-12", dias_estuda: TODOS_OS_DIAS, horas_por_dia_semana: 3 },
    "2026-08-10"
  );
  const base20 = parametrosDoBriefing(
    { data_prova: "2026-08-31", inicio_estudos: "2026-08-20", dias_estuda: TODOS_OS_DIAS, horas_por_dia_semana: 3 },
    "2026-08-10"
  );
  const r12 = gerarRota(template(40), base12);
  const r20 = gerarRota(template(40), base20);

  assert.notEqual(r12.assinatura, r20.assinatura, "a assinatura muda — a rota antiga é descartada");
  assert.equal(r20.dias[0].scheduledDate, "2026-08-20");
  assert.equal(r20.dias.filter((d) => d.scheduledDate < "2026-08-20").length, 0);
  assert.ok(diasDeEstudoDaRota(r20.dias).length < diasDeEstudoDaRota(r12.dias).length);
});

test("REGRESSÃO — janela apertada distribui o excesso, não despeja num dia só", () => {
  // 40 dias de template em 19 dias de janela a 3h/dia: o conteúdo não cabe,
  // e isso é inerente. O que não pode acontecer é a sobra inteira cair no
  // último dia de conteúdo — a versão sequencial produzia um dia com 1400
  // minutos (23 horas) e 20 matérias empilhadas.
  const { dias } = gerarRota(template(40), base);
  const comConteudo = dias.filter((d) => d.tipo === "estudo");

  const maior = Math.max(...comConteudo.map((d) => d.minutos));
  const menor = Math.min(...comConteudo.map((d) => d.minutos));

  assert.ok(maior <= base.minutosPorDia * 2, `dia com ${maior} min — desproporcional`);
  assert.ok(
    maior - menor <= base.minutosPorDia,
    `carga desequilibrada: de ${menor} a ${maior} min entre os dias`
  );
  // E nenhum dia concentra uma fatia absurda do template.
  const maiorGrupo = Math.max(...comConteudo.map((d) => d.templateDays.length));
  assert.ok(maiorGrupo <= 5, `um dia recebeu ${maiorGrupo} dias do template`);
});

test("REGRESSÃO — janela folgada continua com um dia do template por dia de rota", () => {
  // O ajuste da distribuição não pode estragar o caso normal.
  const { dias } = gerarRota(template(6), base);
  const comConteudo = dias.filter((d) => d.tipo === "estudo");
  comConteudo.forEach((d) =>
    assert.ok(d.templateDays.length <= 1, `dia ${d.routeDay} agrupou ${d.templateDays.length} dias sem necessidade`)
  );
});
