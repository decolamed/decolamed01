// Os requisitos fixos do Voo Guiado — 2 simulados, 4 redações no total e as
// 4 leituras dos livros — não competem com o conteúdo acadêmico. O aluno os
// contratou; nenhuma janela curta, nenhuma prioridade e nenhuma recalibragem
// pode fazê-los sumir.
//
// Estes testes existem porque a seleção por prioridade os DERRUBAVA: em 10
// dias a rota entregava 2 dos 4 livros e 1 das 2 redações; em 5 dias, 1 livro
// e nenhuma redação.

import test from "node:test";
import assert from "node:assert/strict";
import { gerarRota, diasDeEstudoDaRota } from "./rota.ts";
import { validarRota, requisitosDoTemplate, totalDeRedacoes } from "./validador-rota.ts";
import { contextoVazio } from "./prioridade.ts";

const MATERIAS = ["Biologia", "Química", "Física", "Matemática", "Linguagens", "História", "Geografia"];
const TODOS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

/**
 * O template REAL do banco: 40 dias, ~253 aulas e 36 questões, mais os itens
 * fixos do plano — 4 leituras dos livros, 2 redações e 2 simulados.
 */
function template() {
  const dias = Array.from({ length: 40 }, (_, i) => ({ dia_numero: i + 1, titulo: `Dia ${i + 1}`, itens: [] }));
  for (let i = 0; i < 40; i++) {
    for (let j = 0; j < 6; j++) {
      dias[i].itens.push({
        tipo: j % 6 === 5 ? "questoes" : "aula",
        titulo: `Item ${i + 1}.${j + 1}`,
        materia: MATERIAS[(i + j) % MATERIAS.length],
        ref_id: null,
        url: `https://youtu.be/v${i}_${j}`
      });
    }
  }
  // Nomenclatura oficial da plataforma, como está no banco.
  [[6, 1], [9, 2], [11, 3], [13, 4]].forEach(([d, n]) =>
    dias[d - 1].itens.push({ tipo: "leitura", titulo: `Leitura do resumo do Livro ${n}`, materia: null })
  );
  [[10, 1], [17, 2]].forEach(([d, n]) =>
    dias[d - 1].itens.push({ tipo: "redacao", titulo: `Redação ${n}`, materia: null })
  );
  [[20, 1], [35, 2]].forEach(([d, n]) =>
    dias[d - 1].itens.push({ tipo: "simulado", titulo: `Simulado ${n}`, materia: null })
  );
  return dias;
}

function janela(dias, horas, diasEstuda = TODOS) {
  const inicio = "2026-08-12";
  const d = new Date(`${inicio}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return { inicio, dataProva: d.toISOString().slice(0, 10), diasEstuda, minutosPorDia: horas * 60 };
}

const porTipo = (rota, tipo) => rota.dias.flatMap((d) => d.itens).filter((i) => i.tipo === tipo);

// Toda janela que o pedido cita, da mais folgada à mais apertada.
const JANELAS = [
  { nome: "40 dias, 3h", dias: 40, horas: 3 },
  { nome: "20 dias, 3h", dias: 20, horas: 3 },
  { nome: "10 dias, 3h", dias: 10, horas: 3 },
  { nome: "5 dias, 3h", dias: 5, horas: 3 },
  { nome: "10 dias, 8h", dias: 10, horas: 8 },
  { nome: "30 dias, 3x/semana", dias: 30, horas: 3, diasEstuda: ["seg", "qua", "sex"] }
];

// ══════════════════════════════════════════════════════════ LIVROS E REDAÇÕES
JANELAS.forEach((j) => {
  test(`${j.nome} — as 4 leituras dos livros e as 2 redações sobrevivem`, () => {
    const rota = gerarRota(template(), janela(j.dias, j.horas, j.diasEstuda));

    assert.equal(porTipo(rota, "leitura").length, 4, `${j.nome}: perdeu leitura de livro`);
    assert.equal(porTipo(rota, "redacao").length, 2, `${j.nome}: perdeu redação`);

    // E sem estourar a capacidade de nenhum dia para conseguir isso.
    rota.dias.forEach((d) => {
      if (d.tipo === "prova" || d.tipo === "descanso") return;
      assert.ok(d.minutos <= j.horas * 60, `${j.nome}: dia ${d.routeDay} com ${d.minutos} min`);
    });
  });
});

test("os quatro livros são atividades distintas e identificáveis", () => {
  const rota = gerarRota(template(), janela(10, 3));
  const titulos = porTipo(rota, "leitura").map((i) => i.titulo);
  assert.equal(new Set(titulos).size, 4, "os quatro livros precisam ser distintos");
  [1, 2, 3, 4].forEach((n) =>
    assert.ok(
      titulos.some((t) => t.includes(`Livro ${n}`)),
      `o Livro ${n} não está no cronograma`
    )
  );
});

test("as redações aparecem em dias diferentes — não empilhadas num só", () => {
  const rota = gerarRota(template(), janela(20, 3));
  const diasComRedacao = rota.dias.filter((d) => d.itens.some((i) => i.tipo === "redacao"));
  assert.equal(diasComRedacao.length, 2, "as duas redações caíram no mesmo dia");
});

// ════════════════════════════════════════════════ AS 4 REDAÇÕES DO PLANO ════
test("2 redações no cronograma + 1 por simulado = as 4 que o plano promete", () => {
  const rota = gerarRota(template(), janela(20, 3));
  assert.equal(rota.dias.filter((d) => d.tipo === "simulado").length, 2);
  // Cada simulado traz a sua redação.
  assert.equal(totalDeRedacoes(rota, 2), 4);
});

test("simulado sem proposta de redação não é contado como se tivesse", () => {
  // A conta reflete o que existe: se só um simulado tem redação, o total é 3
  // — e quem lê o número sabe que falta uma, em vez de acreditar em 4.
  const rota = gerarRota(template(), janela(20, 3));
  assert.equal(totalDeRedacoes(rota, 1), 3);
  assert.equal(totalDeRedacoes(rota, 0), 2);
});

// ══════════════════════════════════════════ O SIMULADO NÃO É DUPLICADO ══════
test("os simulados do template não viram itens soltos dentro de dias de estudo", () => {
  // A rota já reserva dois DIAS de simulado. Sem excluir os itens do
  // template, o aluno via quatro: dois dias e mais dois itens empilhados.
  const rota = gerarRota(template(), janela(40, 3));
  const dentroDeEstudo = rota.dias
    .filter((d) => d.tipo !== "simulado")
    .flatMap((d) => d.itens)
    .filter((i) => i.tipo === "simulado");
  assert.equal(dentroDeEstudo.length, 0);
  assert.equal(rota.dias.filter((d) => d.tipo === "simulado").length, 2);
});

// ═════════════════════════════════ OS OBRIGATÓRIOS VÊM ANTES DO ACADÊMICO ═══
test("numa janela apertada, quem cede espaço é o conteúdo acadêmico", () => {
  const curta = gerarRota(template(), janela(5, 3));
  const longa = gerarRota(template(), janela(40, 3));

  const aulasCurta = porTipo(curta, "aula").length;
  const aulasLonga = porTipo(longa, "aula").length;
  assert.ok(aulasCurta < aulasLonga, "o conteúdo acadêmico é que deveria encolher");

  // Mas os requisitos do plano ficam inteiros nos dois casos.
  assert.equal(porTipo(curta, "leitura").length, porTipo(longa, "leitura").length);
  assert.equal(porTipo(curta, "redacao").length, porTipo(longa, "redacao").length);
});

test("desempenho e dificuldade mudam o conteúdo, nunca os requisitos fixos", () => {
  const ctx = contextoVazio();
  ctx.sentimentos = { Biologia: "Turbulência" };
  ctx.desempenho.set("biologia", { acertos: 1, erros: 19 });
  ctx.pesos.set("biologia", { peso: 5, qtdQuestoes: 20 });

  const rota = gerarRota(template(), janela(10, 3), { contexto: ctx });
  assert.equal(porTipo(rota, "leitura").length, 4);
  assert.equal(porTipo(rota, "redacao").length, 2);
});

// ════════════════════════════════════════════════════════════ O VALIDADOR ═══
test("o validador reprova uma rota que perdeu um livro ou uma redação", () => {
  const t = template();
  const esperado = requisitosDoTemplate(t);
  assert.deepEqual(esperado, { leitura: 4, redacao: 2 });

  const rota = gerarRota(t, janela(10, 3));
  assert.ok(validarRota(rota, esperado).ok, "a rota gerada deveria passar");

  // Simula o que uma recalibragem descuidada faria: remover um obrigatório
  // para abrir espaço.
  const semLivro = gerarRota(t, janela(10, 3));
  const dia = semLivro.dias.find((d) => d.itens.some((i) => i.tipo === "leitura"));
  dia.itens = dia.itens.filter((i) => i.tipo !== "leitura");
  const r = validarRota(semLivro, esperado);
  assert.equal(r.ok, false);
  assert.ok(r.violacoes.some((x) => x.regra === "requisito-fixo-leitura"));

  const semRedacao = gerarRota(t, janela(10, 3));
  const diaR = semRedacao.dias.find((d) => d.itens.some((i) => i.tipo === "redacao"));
  diaR.itens = diaR.itens.filter((i) => i.tipo !== "redacao");
  assert.ok(validarRota(semRedacao, esperado).violacoes.some((x) => x.regra === "requisito-fixo-redacao"));
});

test("o validador cobra o que o template oferece, e nunca um número mágico", () => {
  // Admin cadastrou só 3 livros: a rota tem de entregar 3, não inventar 4.
  const t = template();
  const doTerceiro = t.find((d) => d.itens.some((i) => i.titulo?.includes("Livro 4")));
  doTerceiro.itens = doTerceiro.itens.filter((i) => !i.titulo?.includes("Livro 4"));

  const esperado = requisitosDoTemplate(t);
  assert.equal(esperado.leitura, 3);

  const rota = gerarRota(t, janela(10, 3));
  assert.equal(porTipo(rota, "leitura").length, 3);
  assert.ok(validarRota(rota, esperado).ok);
});

test("sem os requisitos do template, o validador não inventa cobrança", () => {
  const rota = gerarRota(template(), janela(10, 3));
  assert.ok(validarRota(rota).ok, "chamado sem o template, não deveria cobrar requisito");
});

// ════════════════════════════════════════════ NADA MAIS FOI QUEBRADO ════════
test("as janelas continuam válidas em todas as outras regras", () => {
  const esperado = requisitosDoTemplate(template());
  JANELAS.forEach((j) => {
    const rota = gerarRota(template(), janela(j.dias, j.horas, j.diasEstuda));
    const r = validarRota(rota, esperado);
    assert.ok(r.ok, `${j.nome}: ${r.violacoes.map((x) => `[${x.regra}] ${x.detalhe}`).join(" | ")}`);
    diasDeEstudoDaRota(rota.dias).forEach((d) => {
      if (d.tipo === "descanso") return;
      assert.ok(d.itens.length > 0, `${j.nome}: dia ${d.routeDay} vazio`);
    });
  });
});
