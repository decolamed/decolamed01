// A rota como decisão de mentor: o que cabe na capacidade real do aluno.
//
// O gerador antigo repartia o template inteiro pelos dias disponíveis, sem
// nunca perguntar se aquilo cabia. Com 10 dias de 3h ele produzia uma rota de
// 154 passos — 167 horas de conteúdo empurradas para dentro de 30. Estes
// testes cobrem a regra que passou a valer: a capacidade é restrição, e o que
// não cabe fica de fora por decisão, não por acidente.

import test from "node:test";
import assert from "node:assert/strict";
import { gerarRota, capacidadeDaData, diasDeEstudoDaRota, fracaoDeReserva } from "./rota.ts";
import { validarRota } from "./validador-rota.ts";
import { contextoVazio, ordenarPorPrioridade, candidatosDoTemplate } from "./prioridade.ts";
import { minutosDoItem } from "./progresso.ts";

const MATERIAS = ["Biologia", "Química", "Física", "Matemática", "Linguagens", "História", "Geografia"];
const TODOS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

/** Template com o mesmo formato do banco: 40 dias, ~7 itens por dia. */
function template(dias = 40, porDia = 7) {
  return Array.from({ length: dias }, (_, i) => ({
    dia_numero: i + 1,
    titulo: `Dia ${i + 1} do template`,
    itens: Array.from({ length: porDia }, (_, j) => ({
      tipo: j % 2 === 0 ? "aula" : "questoes",
      titulo: `Item ${i + 1}.${j + 1}`,
      materia: MATERIAS[(i + j) % MATERIAS.length],
      ref_id: null,
      url: j % 2 === 0 ? `https://youtu.be/vid${i}_${j}` : null
    }))
  }));
}

/** Janela: `dias` dias de estudo antes da prova, começando em 12/08/2026. */
function janela(dias, horas, diasEstuda = TODOS) {
  const inicio = "2026-08-12";
  const d = new Date(`${inicio}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return {
    inicio,
    dataProva: d.toISOString().slice(0, 10),
    diasEstuda,
    minutosPorDia: horas * 60
  };
}

function cargaPorDia(rota) {
  return rota.dias.filter((d) => d.tipo !== "prova").map((d) => d.minutos);
}

// ═══════════════════════════════════════════════ O CASO QUE FALHOU (item 31)
test("31 — 10 dias, 3h/dia: nenhum dia impossível e nada de 154 passos", () => {
  const p = janela(10, 3);
  const rota = gerarRota(template(), p);

  const estudo = diasDeEstudoDaRota(rota.dias);
  assert.equal(estudo.length, 10, "a janela tem 10 dias de estudo");

  // Nenhum dia passa das 3 horas declaradas.
  rota.dias.forEach((d) => {
    if (d.tipo === "prova" || d.tipo === "descanso") return;
    assert.ok(d.minutos <= 180, `dia ${d.routeDay} com ${d.minutos} min para uma capacidade de 180`);
  });

  // A rota inteira cabe nas ~30 horas que o aluno tem.
  const total = rota.dias.reduce((s, d) => s + d.minutos, 0);
  assert.ok(total <= 10 * 180, `rota pede ${total} min e o aluno tem ${10 * 180}`);

  // E o número de atividades é executável — longe dos 154 passos.
  const passos = rota.dias.flatMap((d) => d.itens).length;
  assert.ok(passos < 60, `a rota ainda tem ${passos} passos`);
  assert.ok(validarRota(rota).ok, "a rota precisa passar no validador");
});

test("31b — o template inteiro NÃO cabe, e é isso que o algoritmo reconhece", () => {
  const t = template();
  const minutosDoTemplate = t.flatMap((d) => d.itens).reduce((s, i) => s + minutosDoItem(i), 0);
  assert.ok(minutosDoTemplate > 10 * 180, "premissa do teste: o template excede a janela de 10 dias");

  const rota = gerarRota(t, janela(10, 3));
  const naRota = rota.dias.flatMap((d) => d.itens).length;
  assert.ok(naRota < t.flatMap((d) => d.itens).length, "parte do conteúdo precisa ficar de fora");
});

// ═══════════════════════════════════════════════════ JANELAS (item 32, A–G)
const CENARIOS = [
  { nome: "A — 40 dias, 3h/dia", dias: 40, horas: 3, diasEstuda: TODOS },
  { nome: "B — 20 dias, 3h/dia", dias: 20, horas: 3, diasEstuda: TODOS },
  { nome: "C — 10 dias, 3h/dia", dias: 10, horas: 3, diasEstuda: TODOS },
  { nome: "D — 5 dias, 3h/dia", dias: 5, horas: 3, diasEstuda: TODOS },
  { nome: "E — 10 dias, 5h/dia", dias: 10, horas: 5, diasEstuda: TODOS },
  { nome: "F — 10 dias, 8h/dia", dias: 10, horas: 8, diasEstuda: TODOS },
  { nome: "G — 30 dias, só seg/qua/sex", dias: 30, horas: 3, diasEstuda: ["seg", "qua", "sex"] }
];

CENARIOS.forEach((c) => {
  test(`32 ${c.nome} — respeita a capacidade e passa no validador`, () => {
    const p = janela(c.dias, c.horas, c.diasEstuda);
    const rota = gerarRota(template(), p);

    rota.dias.forEach((d) => {
      if (d.tipo === "prova" || d.tipo === "descanso") return;
      const teto = capacidadeDaData(d.scheduledDate, p);
      assert.ok(d.minutos <= teto, `${c.nome}: dia ${d.routeDay} com ${d.minutos} min > ${teto}`);
      assert.ok(d.itens.length > 0, `${c.nome}: dia ${d.routeDay} chegaria vazio ao aluno`);
    });

    const r = validarRota(rota);
    assert.ok(r.ok, `${c.nome}: ${r.violacoes.map((x) => x.detalhe).join(" | ")}`);
  });
});

test("32 — mais horas por dia rendem mais conteúdo na mesma janela", () => {
  const conteudo = (horas) => gerarRota(template(), janela(10, horas)).dias.flatMap((d) => d.itens).length;
  const tres = conteudo(3);
  const cinco = conteudo(5);
  const oito = conteudo(8);
  assert.ok(cinco > tres, `5h/dia (${cinco}) deveria render mais que 3h/dia (${tres})`);
  assert.ok(oito > cinco, `8h/dia (${oito}) deveria render mais que 5h/dia (${cinco})`);
});

test("32 — mais dias rendem mais conteúdo com as mesmas horas", () => {
  const conteudo = (dias) => gerarRota(template(), janela(dias, 3)).dias.flatMap((d) => d.itens).length;
  assert.ok(conteudo(20) > conteudo(10), "20 dias deveriam render mais que 10");
  assert.ok(conteudo(10) > conteudo(5), "10 dias deveriam render mais que 5");
});

test("32 G — dias da semana não marcados não viram dia de rota", () => {
  const p = janela(30, 3, ["seg", "qua", "sex"]);
  const rota = gerarRota(template(), p);
  const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  diasDeEstudoDaRota(rota.dias).forEach((d) => {
    const sigla = SEMANA[new Date(`${d.scheduledDate}T00:00:00Z`).getUTCDay()];
    assert.ok(["seg", "qua", "sex"].includes(sigla), `dia ${d.routeDay} caiu numa ${sigla}`);
  });
});

// ═════════════════════════════════════════ O ALUNO MUDA A ROTA (item 32 H–J)
function contextoCom({ pesos = {}, sentimentos = {}, desempenho = {} } = {}) {
  const ctx = contextoVazio();
  Object.entries(pesos).forEach(([m, v]) => ctx.pesos.set(m.toLowerCase(), v));
  ctx.sentimentos = sentimentos;
  Object.entries(desempenho).forEach(([m, v]) => ctx.desempenho.set(m.toLowerCase(), v));
  return ctx;
}

function minutosPorMateria(rota) {
  const mapa = new Map();
  rota.dias.forEach((d) =>
    d.itens.forEach((it) => {
      const m = it.materia;
      if (m) mapa.set(m, (mapa.get(m) ?? 0) + minutosDoItem(it));
    })
  );
  return mapa;
}

test("32 H — dificuldade declarada em Biologia puxa Biologia para a rota", () => {
  const p = janela(10, 3);
  const neutro = gerarRota(template(), p, { contexto: contextoCom({}) });
  const comDificuldade = gerarRota(template(), p, {
    contexto: contextoCom({ sentimentos: { Biologia: "Turbulência", Geografia: "Domínio" } })
  });

  const antes = minutosPorMateria(neutro).get("Biologia") ?? 0;
  const depois = minutosPorMateria(comDificuldade).get("Biologia") ?? 0;
  assert.ok(depois > antes, `Biologia saiu de ${antes} para ${depois} min — deveria crescer`);
});

test("32 I — quem vai bem em Linguagens e mal em Biologia recebe mais Biologia", () => {
  const p = janela(10, 3);
  const rota = gerarRota(template(), p, {
    contexto: contextoCom({
      desempenho: { biologia: { acertos: 2, erros: 18 }, linguagens: { acertos: 19, erros: 1 } }
    })
  });

  const m = minutosPorMateria(rota);
  assert.ok(
    (m.get("Biologia") ?? 0) > (m.get("Linguagens") ?? 0),
    `Biologia ${m.get("Biologia") ?? 0} min vs Linguagens ${m.get("Linguagens") ?? 0} min`
  );
});

test("32 — peso da prova influencia, mas não sozinho", () => {
  const p = janela(10, 3);
  const soPeso = gerarRota(template(), p, {
    contexto: contextoCom({ pesos: { biologia: { peso: 5, qtdQuestoes: 20 }, geografia: { peso: 1, qtdQuestoes: 4 } } })
  });
  const m1 = minutosPorMateria(soPeso);
  assert.ok((m1.get("Biologia") ?? 0) > (m1.get("Geografia") ?? 0), "peso alto deveria render mais tempo");

  // Mas o domínio do aluno reverte parte disso: mesma prova, aluno que já
  // domina Biologia recebe menos Biologia do que o que não domina.
  const dominando = gerarRota(template(), p, {
    contexto: contextoCom({
      pesos: { biologia: { peso: 5, qtdQuestoes: 20 }, geografia: { peso: 1, qtdQuestoes: 4 } },
      sentimentos: { Biologia: "Domínio" },
      desempenho: { biologia: { acertos: 19, erros: 1 } }
    })
  });
  const m2 = minutosPorMateria(dominando);
  assert.ok(
    (m2.get("Biologia") ?? 0) < (m1.get("Biologia") ?? 0),
    "domínio comprovado deveria reduzir o tempo de uma matéria de peso alto"
  );
});

test("32 J — conteúdo já concluído perde prioridade para o que falta", () => {
  const t = template(10);
  const ctx = contextoVazio();
  // Marca como concluídas as aulas dos 3 primeiros dias do template.
  t.slice(0, 3).forEach((dia) =>
    dia.itens.forEach((it) => {
      if (it.url) ctx.concluidos.add(`aula-yt:${it.url.split("/").pop()}`);
    })
  );

  const fila = ordenarPorPrioridade(candidatosDoTemplate(t), ctx);
  const posicaoConcluida = fila.findIndex((c) => c.templateDay <= 3 && c.item.url);
  const posicaoInedita = fila.findIndex((c) => c.templateDay > 3 && c.item.url);
  assert.ok(
    posicaoInedita < posicaoConcluida,
    `item inédito ficou em ${posicaoInedita} e o já concluído em ${posicaoConcluida}`
  );
});

// ═══════════════════════════════════════════════════════ REGRAS ESTRUTURAIS
test("a reserva existe, mas nunca vira dia vazio para o aluno", () => {
  assert.ok(fracaoDeReserva(10) > 0, "sempre sobra folga para o Copiloto encaixar revisão");
  assert.ok(fracaoDeReserva(40) > fracaoDeReserva(5), "janela longa reserva proporcionalmente mais");

  [5, 10, 20, 40].forEach((dias) => {
    const rota = gerarRota(template(), janela(dias, 3));
    rota.dias.forEach((d) => {
      if (d.tipo === "prova" || d.tipo === "descanso") return;
      assert.ok(d.itens.length > 0, `${dias} dias: dia ${d.routeDay} (${d.tipo}) chegaria vazio`);
    });
  });
});

test("a reserva de fato deixa capacidade livre para adaptação", () => {
  const p = janela(10, 3);
  const rota = gerarRota(template(), p);
  const capacidade = diasDeEstudoDaRota(rota.dias).reduce((s, d) => s + capacidadeDaData(d.scheduledDate, p), 0);
  const carga = rota.dias.reduce((s, d) => s + d.minutos, 0);
  assert.ok(carga < capacidade, `carga ${carga} deveria deixar folga dentro de ${capacidade}`);
});

test("o dia da prova fecha a rota e nunca tem atividade", () => {
  const p = janela(10, 3);
  const rota = gerarRota(template(), p);
  const prova = rota.dias[rota.dias.length - 1];
  assert.equal(prova.tipo, "prova");
  assert.equal(prova.scheduledDate, p.dataProva);
  assert.deepEqual(prova.itens, []);
  assert.equal(prova.minutos, 0);
});

test("a numeração é a da rota do aluno, nunca a do template", () => {
  const rota = gerarRota(template(), janela(10, 3));
  rota.dias.forEach((d, i) => assert.equal(d.routeDay, i + 1));
  // O dia 22 do template pode aparecer no dia 2 da rota — como referência.
  const comOrigem = rota.dias.filter((d) => d.templateDays.length > 0);
  assert.ok(comOrigem.length > 0);
  comOrigem.forEach((d) => assert.ok(d.routeDay <= 11, "routeDay não pode carregar número de template"));
});

test("a mesma entrada gera exatamente a mesma rota", () => {
  const p = janela(10, 3);
  const ctx = contextoCom({ sentimentos: { Biologia: "Turbulência" } });
  const a = gerarRota(template(), p, { contexto: ctx });
  const b = gerarRota(template(), p, { contexto: ctx });
  assert.deepEqual(cargaPorDia(a), cargaPorDia(b));
  assert.deepEqual(
    a.dias.flatMap((d) => d.itens.map((i) => i.titulo)),
    b.dias.flatMap((d) => d.itens.map((i) => i.titulo))
  );
});

// ═══════════════════════════════════════════════════════════════ VALIDADOR
test("o validador reprova uma rota que estoura a capacidade do dia", () => {
  const p = janela(10, 3);
  const rota = gerarRota(template(), p);
  rota.dias[0].minutos = 1400; // o dia de 23 horas que chegou a existir
  const r = validarRota(rota);
  assert.equal(r.ok, false);
  assert.ok(r.violacoes.some((x) => x.regra === "capacidade-do-dia"));
});

test("o validador reprova conteúdo antes do início e no dia da prova", () => {
  const p = janela(10, 3);
  const rota = gerarRota(template(), p);
  rota.dias[0].scheduledDate = "2026-07-12"; // o bug do 12/07
  const r = validarRota(rota);
  assert.ok(r.violacoes.some((x) => x.regra === "data-antes-do-inicio"));

  const outra = gerarRota(template(), p);
  outra.dias[outra.dias.length - 1].itens = [{ tipo: "aula", titulo: "x" }];
  assert.ok(validarRota(outra).violacoes.some((x) => x.regra === "dia-da-prova-com-conteudo"));
});

test("o validador reprova numeração fora de 1..N e dia de estudo vazio", () => {
  const p = janela(10, 3);
  const rota = gerarRota(template(), p);
  rota.dias[1].routeDay = 22; // o "Dia 22" como segundo dia
  assert.ok(validarRota(rota).violacoes.some((x) => x.regra === "numeracao"));

  const outra = gerarRota(template(), p);
  outra.dias[1].itens = [];
  assert.ok(validarRota(outra).violacoes.some((x) => x.regra === "dia-de-estudo-vazio"));
});

test("o validador reprova o 2º simulado no último dia antes da prova", () => {
  const p = janela(10, 3);
  const rota = gerarRota(template(), p);
  const simulados = rota.dias.filter((d) => d.tipo === "simulado");
  assert.equal(simulados.length, 2, "premissa: a rota tem os dois simulados");

  const estudo = diasDeEstudoDaRota(rota.dias);
  const ultimo = estudo[estudo.length - 1];
  ultimo.tipo = "simulado";
  simulados[1].tipo = "estudo";
  assert.ok(validarRota(rota).violacoes.some((x) => x.regra === "simulado-2-no-ultimo-dia"));
});

test("toda rota gerada nos cenários do pedido passa no validador", () => {
  CENARIOS.forEach((c) => {
    const rota = gerarRota(template(), janela(c.dias, c.horas, c.diasEstuda));
    const r = validarRota(rota);
    assert.ok(r.ok, `${c.nome}: ${r.violacoes.map((x) => `[${x.regra}] ${x.detalhe}`).join(" | ")}`);
  });
});
