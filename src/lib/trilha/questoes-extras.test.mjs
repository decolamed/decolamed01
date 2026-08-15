// A camada de questões extras existe porque o cronograma principal quase não
// entregava questões em janelas curtas: os itens de questões vindos do
// template DISPUTAM a capacidade do dia com aulas e leituras, e numa rota de
// 10 dias sobravam um ou dois dias com questões na rota inteira.
//
// Estes testes fixam as regras que o pedido separa, em ordem:
//   • rota curta recebe bloco com frequência alta; rota longa se espaça;
//   • a matéria sai da priorização do aluno, não de um rodízio fixo;
//   • prioridade preservada, mas com variedade — nada de 5 seguidos;
//   • nunca promete bloco sem questões suficientes no banco;
//   • bloco já aberto pelo aluno não muda de matéria.

import test from "node:test";
import assert from "node:assert/strict";
import {
  planejarQuestoesExtras,
  cadenciaDosBlocos,
  prioridadeDaMateria,
  QUESTOES_POR_BLOCO,
  MAXIMO_DE_BLOCOS,
  MAXIMO_EM_SEQUENCIA
} from "./questoes-extras.ts";
import { contextoVazio } from "./prioridade.ts";

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

/** Banco real: quantidades por matéria em `questoes`. */
const BANCO = [
  { materia: "Biologia", ineditas: 82 },
  { materia: "Linguagens", ineditas: 81 },
  { materia: "Matemática", ineditas: 41 },
  { materia: "Geografia", ineditas: 37 },
  { materia: "História", ineditas: 33 },
  { materia: "Física", ineditas: 25 },
  { materia: "Química", ineditas: 19 }
];

/** Uma rota só de dias de estudo, do tamanho pedido. */
function diasDeEstudo(n, tipo = "estudo") {
  return Array.from({ length: n }, (_, i) => ({
    routeDay: i + 1,
    tipo,
    scheduledDate: `2026-08-${String(12 + i).padStart(2, "0")}`
  }));
}

/** O aluno do relato: dificuldade em Exatas, domínio em Biologia. */
function alunoComPerfil() {
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
  return ctx;
}

const materias = (blocos) => blocos.map((b) => b.materia);
const maiorSequencia = (lista) => {
  let maior = 0;
  let atual = 0;
  let anterior = null;
  for (const m of lista) {
    atual = m === anterior ? atual + 1 : 1;
    anterior = m;
    if (atual > maior) maior = atual;
  }
  return maior;
};

// ══════════════════════════════════════════════ FREQUÊNCIA ══════════════════
test("rota curta recebe bloco todo dia — era o problema relatado", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(10),
    contexto: alunoComPerfil(),
    disponiveis: BANCO
  });
  assert.equal(blocos.length, 10, `esperava 10 blocos em 10 dias, vieram ${blocos.length}`);
  blocos.forEach((b) => assert.equal(b.quantidade, QUESTOES_POR_BLOCO));
});

test("rota longa NÃO vira 5 questões por dia", () => {
  // 50 × 5 = 250 questões esvaziaria o banco antes da prova.
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(50),
    contexto: alunoComPerfil(),
    disponiveis: BANCO
  });
  assert.ok(blocos.length <= MAXIMO_DE_BLOCOS, `${blocos.length} blocos em 50 dias é demais`);
  assert.ok(blocos.length >= 15, `${blocos.length} blocos em 50 dias é pouco para acompanhar`);
  // E eles ficam espalhados, não amontoados no começo.
  const dias = blocos.map((b) => b.routeDay);
  assert.ok(dias[dias.length - 1] >= 40, "os blocos precisam alcançar o fim da rota");
});

test("a cadência acompanha o tamanho da rota", () => {
  assert.equal(cadenciaDosBlocos(10), 1, "rota curta: todo dia");
  assert.equal(cadenciaDosBlocos(20), 1);
  assert.equal(cadenciaDosBlocos(30), 2, "rota média: dia sim, dia não");
  assert.equal(cadenciaDosBlocos(50), 3);
});

test("o consumo do banco fica sustentável na rota longa", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(50),
    contexto: alunoComPerfil(),
    disponiveis: BANCO
  });
  const gastas = blocos.length * QUESTOES_POR_BLOCO;
  const total = BANCO.reduce((s, m) => s + m.ineditas, 0);
  assert.ok(gastas <= total * 0.35, `${gastas} de ${total} questões é consumo demais`);
});

// ══════════════════════════════════ DIAS QUE NÃO RECEBEM BLOCO ══════════════
test("dia de simulado, descanso e prova não recebem bloco", () => {
  const dias = [
    { routeDay: 1, tipo: "estudo", scheduledDate: "2026-08-12" },
    { routeDay: 2, tipo: "simulado", scheduledDate: "2026-08-13" },
    { routeDay: 3, tipo: "descanso", scheduledDate: "2026-08-14" },
    { routeDay: 4, tipo: "prova", scheduledDate: "2026-08-15" }
  ];
  const blocos = planejarQuestoesExtras({ dias, contexto: alunoComPerfil(), disponiveis: BANCO });
  assert.deepEqual(blocos.map((b) => b.routeDay), [1], "só o dia de estudo podia receber");
});

test("dia de revisão recebe bloco — é dia de corrigir, questões ajudam", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(3, "revisao"),
    contexto: alunoComPerfil(),
    disponiveis: BANCO
  });
  assert.equal(blocos.length, 3);
});

// ══════════════════════════════════════ A MATÉRIA VEM DO PERFIL ═════════════
test("não é rodízio fixo: a matéria sai da priorização do aluno", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(10),
    contexto: alunoComPerfil(),
    disponiveis: BANCO
  });
  const contagem = new Map();
  materias(blocos).forEach((m) => contagem.set(m, (contagem.get(m) ?? 0) + 1));
  // Um rodízio de 7 matérias em 10 blocos daria 1 ou 2 para cada uma.
  const maior = Math.max(...contagem.values());
  assert.ok(maior >= 3, `a matéria mais priorizada só apareceu ${maior} vez(es) — virou rodízio`);
});

test("matéria em Turbulência aparece mais que matéria em Domínio de peso igual", () => {
  const ctx = contextoVazio();
  ctx.pesos = new Map([
    ["fisica", { peso: 2, qtdQuestoes: 10 }],
    ["quimica", { peso: 2, qtdQuestoes: 10 }]
  ]);
  ctx.sentimentos = { "Física": "Turbulência", "Química": "Domínio" };
  assert.ok(
    prioridadeDaMateria("Física", ctx) > prioridadeDaMateria("Química", ctx),
    "a dificuldade declarada precisa pesar"
  );
});

test("o desempenho real muda a prioridade — é o item 11 do pedido", () => {
  const base = alunoComPerfil();
  const errando = alunoComPerfil();
  errando.desempenho = new Map([["biologia", { acertos: 2, erros: 18 }]]);
  assert.ok(
    prioridadeDaMateria("Biologia", errando) > prioridadeDaMateria("Biologia", base),
    "errar muito Biologia tem de aumentar a prioridade dela"
  );

  const acertando = alunoComPerfil();
  acertando.desempenho = new Map([["matematica", { acertos: 19, erros: 1 }]]);
  assert.ok(
    prioridadeDaMateria("Matemática", acertando) < prioridadeDaMateria("Matemática", base),
    "acertar consistentemente tem de reduzir a prioridade relativa"
  );
});

// ═══════════════════════════════════════════ PRIORIDADE COM VARIEDADE ═══════
test("nenhuma matéria aparece mais de duas vezes seguidas", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(20),
    contexto: alunoComPerfil(),
    disponiveis: BANCO
  });
  assert.ok(
    maiorSequencia(materias(blocos)) <= MAXIMO_EM_SEQUENCIA,
    `sequência de ${maiorSequencia(materias(blocos))} blocos da mesma matéria: ${materias(blocos).join(", ")}`
  );
});

test("uma matéria dominante não monopoliza a rota", () => {
  // Contexto extremo: Biologia muito à frente de todas.
  const ctx = contextoVazio();
  ctx.pesos = new Map([
    ["biologia", { peso: 5, qtdQuestoes: 20 }],
    ["fisica", { peso: 1, qtdQuestoes: 2 }],
    ["quimica", { peso: 1, qtdQuestoes: 2 }]
  ]);
  ctx.sentimentos = { Biologia: "Turbulência" };
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(10),
    contexto: ctx,
    disponiveis: [
      { materia: "Biologia", ineditas: 82 },
      { materia: "Física", ineditas: 25 },
      { materia: "Química", ineditas: 19 }
    ]
  });
  const lista = materias(blocos);
  assert.ok(maiorSequencia(lista) <= MAXIMO_EM_SEQUENCIA, `sequência longa: ${lista.join(", ")}`);
  assert.ok(new Set(lista).size >= 2, "outra matéria precisa aparecer");
  // Mas a prioridade continua: Biologia é a que mais aparece.
  const bio = lista.filter((m) => m === "Biologia").length;
  assert.ok(bio > lista.length / 3, `Biologia só apareceu ${bio}/${lista.length} — a prioridade se perdeu`);
});

test("a matéria difícil não pode ficar de fora do acompanhamento", () => {
  // Medido antes do impulso de cobertura, com os pesos reais desta prova:
  // uma rota de 10 dias entregava blocos de só 4 matérias, e Matemática —
  // declarada em Turbulência pelo aluno — não aparecia nenhuma vez. A camada
  // existe para MEDIR o aluno nas diferentes matérias, e não mede o que
  // nunca pergunta.
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(10),
    contexto: alunoComPerfil(),
    disponiveis: BANCO
  });
  const lista = materias(blocos);
  assert.ok(lista.includes("Matemática"), `Matemática ficou de fora: ${lista.join(", ")}`);
  assert.ok(new Set(lista).size >= 5, `só ${new Set(lista).size} matérias em 10 blocos`);
});

test("o impulso de cobertura não vira rateio: a prioridade continua mandando", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(20),
    contexto: alunoComPerfil(),
    disponiveis: BANCO
  });
  const contagem = new Map();
  materias(blocos).forEach((m) => contagem.set(m, (contagem.get(m) ?? 0) + 1));
  const ordenado = [...contagem.entries()].sort((a, b) => b[1] - a[1]);
  const [, maisFrequente] = ordenado[0];
  const [, menosFrequente] = ordenado[ordenado.length - 1];
  assert.ok(
    maisFrequente >= menosFrequente * 2,
    `distribuição achatada (${ordenado.map(([m, n]) => `${m} ${n}`).join(", ")}): virou divisão igual`
  );
});

test("com uma matéria só no banco, repetir é melhor que ficar sem bloco", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(4),
    contexto: alunoComPerfil(),
    disponiveis: [{ materia: "Biologia", ineditas: 82 }]
  });
  assert.equal(blocos.length, 4);
  assert.deepEqual(new Set(materias(blocos)), new Set(["Biologia"]));
});

// ════════════════════════════════════════════ RESPEITAR O BANCO ═════════════
test("nunca promete mais blocos do que o banco aguenta", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(10),
    contexto: alunoComPerfil(),
    disponiveis: [{ materia: "Química", ineditas: 12 }]
  });
  // 12 inéditas dão 2 blocos de 5; o terceiro deixaria a sessão vazia.
  assert.equal(blocos.length, 2);
});

test("banco vazio não gera bloco nenhum", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(10),
    contexto: alunoComPerfil(),
    disponiveis: []
  });
  assert.deepEqual(blocos, []);
});

test("matéria com menos de um bloco inteiro não é escolhida", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(3),
    contexto: alunoComPerfil(),
    disponiveis: [
      { materia: "Química", ineditas: 3 },
      { materia: "Biologia", ineditas: 40 }
    ]
  });
  assert.ok(!materias(blocos).includes("Química"), "Química só tinha 3 questões");
});

// ═════════════════════════════════ BLOCO JÁ ABERTO NÃO MUDA ═════════════════
test("bloco que o aluno já abriu mantém a matéria gravada", () => {
  // A rota é regerada a cada leitura de tela. Sem esta regra, o bloco que o
  // aluno respondeu ontem trocaria de nome hoje, assim que o desempenho dele
  // mudasse a prioridade das matérias.
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(5),
    contexto: alunoComPerfil(),
    disponiveis: BANCO,
    congelados: { 1: "Geografia", 2: "História" }
  });
  assert.equal(blocos[0].materia, "Geografia");
  assert.equal(blocos[1].materia, "História");
  assert.equal(blocos[0].congelado, true);
  assert.equal(blocos[2].congelado, false);
});

test("o bloco congelado conta como histórico para a variedade", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(4),
    contexto: alunoComPerfil(),
    disponiveis: BANCO,
    congelados: { 1: "Biologia", 2: "Biologia" }
  });
  assert.notEqual(blocos[2].materia, "Biologia", "já eram duas de Biologia seguidas");
});

// ════════════════════════════════════════════════ ESTABILIDADE ══════════════
test("o plano é determinístico", () => {
  const entrada = { dias: diasDeEstudo(15), contexto: alunoComPerfil(), disponiveis: BANCO };
  assert.deepEqual(
    planejarQuestoesExtras(entrada).map((b) => `${b.routeDay}:${b.materia}`),
    planejarQuestoesExtras(entrada).map((b) => `${b.routeDay}:${b.materia}`)
  );
});

test("rota vazia não explode", () => {
  assert.deepEqual(planejarQuestoesExtras({ dias: [], contexto: contextoVazio(), disponiveis: BANCO }), []);
});

test("sem pesos nem sentimentos, ainda distribui", () => {
  const blocos = planejarQuestoesExtras({
    dias: diasDeEstudo(6),
    contexto: contextoVazio(),
    disponiveis: BANCO
  });
  assert.equal(blocos.length, 6);
  assert.ok(maiorSequencia(materias(blocos)) <= MAXIMO_EM_SEQUENCIA);
});
