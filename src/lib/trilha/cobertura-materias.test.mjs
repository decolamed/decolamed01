// O desempenho do aluno deve PRIORIZAR, nunca EXCLUIR.
//
// Caso relatado: aluno com dificuldade em Exatas e bom desempenho em
// Biologia, janela de 10 dias. O algoritmo priorizava Exatas corretamente —
// e apagava Biologia do cronograma. Com os pesos reais desta prova, Biologia
// é a matéria de MAIOR potencial (peso 3 × 10 questões); zerá-la porque o
// aluno vai bem nela é o oposto de estratégico.
//
// Medido antes da correção, com o mesmo template e os mesmos pesos:
//
//   10 dias, 3h/dia → 3 itens de Biologia, em 3 dos 10 dias
//   10 dias, 2h/dia → 2 itens, em 2 dos 10 dias
//   10 dias, 1h/dia → NENHUM item de Biologia
//
// Estes testes fixam o piso que passou a existir e, tão importante quanto,
// fixam que ele NÃO virou divisão igual: a matéria difícil continua levando
// a maior parte do cronograma.

import test from "node:test";
import assert from "node:assert/strict";
import { gerarRota } from "./rota.ts";
import { contextoVazio } from "./prioridade.ts";

const TODOS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

/** `materias_peso` como está no banco: Biologia é a de maior potencial. */
const PESOS = new Map([
  ["biologia", { peso: 3, qtdQuestoes: 10 }],
  ["linguagens", { peso: 2, qtdQuestoes: 10 }],
  ["quimica", { peso: 2, qtdQuestoes: 5 }],
  ["fisica", { peso: 2, qtdQuestoes: 5 }],
  ["matematica", { peso: 1, qtdQuestoes: 5 }],
  ["historia", { peso: 1, qtdQuestoes: 5 }],
  ["geografia", { peso: 1, qtdQuestoes: 5 }]
]);

/** Proporção real de itens por matéria no template (297 itens em 40 dias). */
const DISTRIBUICAO = [
  ["Biologia", 116], ["Física", 50], ["Matemática", 41], ["Química", 37],
  ["Linguagens", 17], ["História", 16], ["Geografia", 10], ["Literatura", 4], ["Inglês", 2]
];

function template() {
  const baldes = DISTRIBUICAO.map(([m, n]) => ({ m, n, usado: 0 }));
  const total = DISTRIBUICAO.reduce((s, [, n]) => s + n, 0);
  const fila = [];
  for (let k = 0; k < total; k++) {
    let alvo = null;
    for (const b of baldes) {
      if (b.usado >= b.n) continue;
      if (alvo === null || b.usado / b.n < alvo.usado / alvo.n) alvo = b;
    }
    if (!alvo) break;
    fila.push(alvo.m);
    alvo.usado++;
  }

  const dias = [];
  let k = 0;
  for (let d = 1; d <= 40; d++) {
    const itens = [];
    // 7 itens nos primeiros dias e 8 nos últimos — as mesmas 297 posições do
    // template real. A silhueta importa: com 280 itens distribuídos de outro
    // jeito o desequilíbrio não se manifesta, e o teste não fixaria nada.
    const quantos = d <= 17 ? 7 : 8;
    for (let j = 0; j < quantos && k < fila.length; j++, k++) {
      itens.push({
        tipo: j % 4 === 3 ? "questoes" : "aula",
        titulo: `${fila[k]} ${d}.${j + 1}`,
        materia: fila[k],
        ref_id: null,
        url: "https://youtu.be/x"
      });
    }
    if ([8, 16, 24, 32].includes(d)) itens.push({ tipo: "leitura", titulo: "Livro", materia: null, ref_id: null, url: null });
    if ([12, 28].includes(d)) itens.push({ tipo: "redacao", titulo: "Redação", materia: null, ref_id: null, url: null });
    if ([20, 36].includes(d)) itens.push({ tipo: "simulado", titulo: "Simulado", materia: null, ref_id: null, url: null });
    dias.push({ dia_numero: d, titulo: `Dia ${d}`, itens });
  }
  return dias;
}

function janela(dias, horas) {
  const inicio = "2026-08-12";
  const d = new Date(`${inicio}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return { inicio, dataProva: d.toISOString().slice(0, 10), diasEstuda: TODOS, minutosPorDia: horas * 60 };
}

/** O aluno do relato: Exatas em Turbulência (e errando), Biologia em Domínio (e acertando). */
function alunoDoRelato() {
  const ctx = contextoVazio();
  ctx.pesos = PESOS;
  ctx.sentimentos = {
    "Matemática": "Turbulência",
    "Física": "Turbulência",
    "Química": "Turbulência",
    Biologia: "Domínio",
    Linguagens: "Atenção",
    "História": "Atenção",
    Geografia: "Atenção"
  };
  ctx.desempenho = new Map([
    ["biologia", { acertos: 18, erros: 2 }],
    ["fisica", { acertos: 3, erros: 15 }],
    ["matematica", { acertos: 2, erros: 14 }],
    ["quimica", { acertos: 3, erros: 13 }]
  ]);
  return ctx;
}

function contar(rota) {
  const porMateria = new Map();
  const diasCom = new Map();
  rota.dias.forEach((d) => {
    const vistas = new Set();
    (d.itens ?? []).forEach((it) => {
      if (!it.materia) return;
      porMateria.set(it.materia, (porMateria.get(it.materia) ?? 0) + 1);
      vistas.add(it.materia);
    });
    vistas.forEach((m) => diasCom.set(m, (diasCom.get(m) ?? 0) + 1));
  });
  return {
    itens: (m) => porMateria.get(m) ?? 0,
    dias: (m) => diasCom.get(m) ?? 0,
    exatas: ["Física", "Matemática", "Química"].reduce((s, m) => s + (porMateria.get(m) ?? 0), 0)
  };
}

const T = template();

// ══════════════════════════════════════════════ O CASO RELATADO ═════════════
test("10 dias, dificuldade em Exatas: Biologia não some do cronograma", () => {
  const c = contar(gerarRota(T, janela(10, 3), { contexto: alunoDoRelato() }));
  assert.ok(c.itens("Biologia") >= 2, `Biologia ficou com ${c.itens("Biologia")} itens em 10 dias`);
  assert.ok(c.dias("Biologia") >= 2, `Biologia apareceu em ${c.dias("Biologia")} dias`);
});

test("a prioridade continua sendo de Exatas — não virou divisão igual", () => {
  const c = contar(gerarRota(T, janela(10, 3), { contexto: alunoDoRelato() }));
  assert.ok(
    c.exatas > c.itens("Biologia") * 2,
    `Exatas ${c.exatas} × Biologia ${c.itens("Biologia")}: a dificuldade do aluno tem de dominar`
  );
});

test("com capacidade mínima (1h/dia), a matéria de maior peso ainda entra", () => {
  // Era aqui que Biologia desaparecia por completo: sobrava quase nada depois
  // dos requisitos do plano, e o pouco que sobrava ia todo para Exatas.
  const c = contar(gerarRota(T, janela(10, 1), { contexto: alunoDoRelato() }));
  assert.ok(c.itens("Biologia") >= 1, "a matéria que mais vale nota não pode ficar em zero");
});

test("2h/dia: Biologia presente em vários dias, sem tomar o lugar de Exatas", () => {
  // É aqui que o piso morde. Sem a reserva de cobertura esta janela entregava
  // 2 itens de Biologia em 2 dias; com ela, 3 em 3. Exatas continua na frente.
  const c = contar(gerarRota(T, janela(10, 2), { contexto: alunoDoRelato() }));
  assert.ok(c.itens("Biologia") >= 3, `Biologia ficou com ${c.itens("Biologia")} itens`);
  assert.ok(c.dias("Biologia") >= 3, `Biologia apareceu em ${c.dias("Biologia")} dias`);
  assert.ok(c.exatas > c.itens("Biologia"), "a dificuldade do aluno continua mandando");
});

// ═══════════════════════════════════ A RESERVA SEGUE A PROVA, NÃO O NOME ════
test("o piso é proporcional à relevância — matéria de peso baixo não ganha o mesmo", () => {
  // Biologia (potencial 30) tem de receber piso maior que Geografia
  // (potencial 5). Se os dois recebessem igual, seria rateio, não estratégia.
  const c = contar(gerarRota(T, janela(10, 2), { contexto: alunoDoRelato() }));
  assert.ok(
    c.itens("Biologia") > c.itens("Geografia"),
    `Biologia ${c.itens("Biologia")} × Geografia ${c.itens("Geografia")}`
  );
});

test("o preenchimento de dia vazio não vira rodízio entre as matérias", () => {
  // A primeira tentativa de corrigir isto fazia o preenchimento escolher
  // sempre a matéria MENOS presente. O efeito foi achatar a rota: Geografia
  // empatava com Biologia e Exatas caía de 16 para 12 itens. A regra passou a
  // ser mais estreita — só quebra a fila por matéria AUSENTE.
  const c = contar(gerarRota(T, janela(10, 3), { contexto: alunoDoRelato() }));
  assert.ok(
    c.itens("Física") > c.itens("Geografia") * 2,
    `Física ${c.itens("Física")} × Geografia ${c.itens("Geografia")}: a prioridade não pode achatar`
  );
  assert.ok(c.exatas >= 14, `Exatas ficou com ${c.exatas} itens — a dificuldade perdeu força`);
});

test("sem pesos cadastrados, a rota continua válida e nada explode", () => {
  const ctx = contextoVazio();
  ctx.sentimentos = alunoDoRelato().sentimentos;
  const rota = gerarRota(T, janela(10, 3), { contexto: ctx });
  assert.ok(rota.dias.length > 0);
  assert.ok(contar(rota).itens("Biologia") + contar(rota).exatas > 0);
});

// ═══════════════════════════════════════════ NADA MUDOU PARA QUEM ESTAVA OK ═
test("aluno sem preferência declarada mantém a distribuição de antes", () => {
  // O piso só age quando a matéria cairia abaixo dele. Quem já recebia
  // Biologia de sobra continua recebendo a mesma coisa.
  const ctx = contextoVazio();
  ctx.pesos = PESOS;
  const c = contar(gerarRota(T, janela(10, 3), { contexto: ctx }));
  assert.ok(c.itens("Biologia") >= 5, `esperava Biologia farta, veio ${c.itens("Biologia")}`);
});

test("janela longa não é afetada: o piso é pequeno perto do que cabe em 30 dias", () => {
  const c = contar(gerarRota(T, janela(30, 3), { contexto: alunoDoRelato() }));
  assert.ok(c.exatas > c.itens("Biologia"), "a dificuldade continua mandando na janela longa");
  assert.ok(c.itens("Biologia") >= 3);
});

test("a geração continua determinística", () => {
  const a = gerarRota(T, janela(10, 3), { contexto: alunoDoRelato() });
  const b = gerarRota(T, janela(10, 3), { contexto: alunoDoRelato() });
  assert.deepEqual(
    a.dias.map((d) => (d.itens ?? []).map((i) => i.titulo)),
    b.dias.map((d) => (d.itens ?? []).map((i) => i.titulo))
  );
});
