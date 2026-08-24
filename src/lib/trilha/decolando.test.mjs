// O Decolando é um cronograma FIXO que espera o aluno. Estes testes fixam as
// duas promessas do plano, que a conta por calendário quebrava:
//
//   1. o cronograma só anda quando o aluno CONCLUI um bloco;
//   2. os 40 blocos continuam disponíveis, não importa quanto tempo passou.
//
// Nenhum teste aqui passa data para função nenhuma — é essa a garantia.

import test from "node:test";
import assert from "node:assert/strict";
import {
  diaDoDecolando,
  blocoConcluido,
  blocosConcluidos,
  cronogramaConcluido,
  chavesConcluidas
} from "./decolando.ts";
import { chaveItemTrilha } from "./progresso.ts";

/** Um cronograma de N blocos, cada um com dois itens que contam. */
function cronograma(n) {
  return Array.from({ length: n }, (_, i) => ({
    dia_numero: i + 1,
    itens: [
      { tipo: "aula", titulo: `Aula do dia ${i + 1}`, url: null, ref_id: null },
      { tipo: "questoes", titulo: `Questões do dia ${i + 1}` }
    ]
  }));
}

/** Marca como concluídos todos os itens dos blocos indicados. */
function concluir(dias, numeros) {
  const p = new Set();
  for (const n of numeros) {
    const dia = dias.find((d) => d.dia_numero === n);
    dia.itens.forEach((_, indice) => p.add(chaveItemTrilha(n, indice)));
  }
  return p;
}

// ═════════════════════════════════════════════ O CRONOGRAMA ESPERA O ALUNO ══

test("aluno novo, sem nada concluído, começa no bloco 1", () => {
  const dias = cronograma(40);
  assert.equal(diaDoDecolando(dias, new Set()), 1);
});

test("concluir o bloco 1 libera o bloco 2", () => {
  const dias = cronograma(40);
  assert.equal(diaDoDecolando(dias, concluir(dias, [1])), 2);
});

test("duas semanas sem estudar não movem o cronograma", () => {
  // O caso do pedido: parou no bloco 2 e voltou depois. Como nada aqui lê
  // data, "depois" não existe — o estado é o mesmo, e é essa a garantia.
  const dias = cronograma(40);
  const progresso = concluir(dias, [1]);
  assert.equal(diaDoDecolando(dias, progresso), 2);
  assert.equal(diaDoDecolando(dias, progresso), 2, "chamar de novo não avança");
});

test("bloco pela metade ainda é o bloco atual", () => {
  const dias = cronograma(40);
  const parcial = new Set([chaveItemTrilha(1, 0)]);
  assert.equal(blocoConcluido(dias[0], parcial), false);
  assert.equal(diaDoDecolando(dias, parcial), 1);
});

test("quem pulou um bloco volta para o que ficou devendo", () => {
  // Concluiu 1 e 3; o 2 continua pendente e é onde a tela abre.
  const dias = cronograma(40);
  assert.equal(diaDoDecolando(dias, concluir(dias, [1, 3])), 2);
});

// ══════════════════════════════════════════ OS 40 BLOCOS NÃO DESAPARECEM ════

test("cronograma inteiro concluído para no último bloco, não além dele", () => {
  const dias = cronograma(40);
  const tudo = concluir(dias, Array.from({ length: 40 }, (_, i) => i + 1));
  assert.equal(diaDoDecolando(dias, tudo), 40, "nunca devolve 41");
  assert.equal(cronogramaConcluido(dias, tudo), true);
});

test("o dia atual está sempre dentro do cronograma", () => {
  const dias = cronograma(40);
  for (let feitos = 0; feitos <= 40; feitos++) {
    const p = concluir(dias, Array.from({ length: feitos }, (_, i) => i + 1));
    const dia = diaDoDecolando(dias, p);
    assert.ok(dia >= 1 && dia <= 40, `bloco ${dia} fora da faixa com ${feitos} concluídos`);
  }
});

test("redefinir o progresso devolve o aluno ao bloco 1", () => {
  // O reset apaga aluno_progresso_itens; para esta conta isso é um objeto
  // vazio, e o efeito tem de ser voltar ao começo sem tocar nos 40 blocos.
  const dias = cronograma(40);
  assert.equal(diaDoDecolando(dias, concluir(dias, [1, 2, 3])), 4);
  assert.equal(diaDoDecolando(dias, new Set()), 1);
  assert.equal(dias.length, 40, "o cronograma continua com 40 blocos");
});

// ══════════════════════════════════════════════════ CASOS QUE TRAVARIAM ═════

test("bloco sem itens que contam não trava o aluno", () => {
  // Um dia vazio, ou só com o bloco extra, nunca seria concluído — e o aluno
  // ficaria preso nele para sempre.
  const dias = [
    { dia_numero: 1, itens: [] },
    { dia_numero: 2, itens: [{ tipo: "questoes", titulo: "5 questões", extra: true }] },
    ...cronograma(3).slice(2)
  ];
  assert.equal(blocoConcluido(dias[0], new Set()), true);
  assert.equal(blocoConcluido(dias[1], new Set()), true);
  assert.equal(diaDoDecolando(dias, new Set()), 3);
});

test("o bloco de questões extras não é exigido para avançar", () => {
  const dias = [
    {
      dia_numero: 1,
      itens: [
        { tipo: "aula", titulo: "Aula", url: null, ref_id: null },
        { tipo: "questoes", titulo: "Extras", extra: true }
      ]
    },
    { dia_numero: 2, itens: [{ tipo: "aula", titulo: "Aula 2", url: null, ref_id: null }] }
  ];
  const soOItemPrincipal = new Set([chaveItemTrilha(1, 0)]);
  assert.equal(diaDoDecolando(dias, soOItemPrincipal), 2, "o extra não podia segurar o dia");
});

test("sem cronograma cadastrado não há bloco atual", () => {
  assert.equal(diaDoDecolando([], new Set()), null);
  assert.equal(diaDoDecolando(null, new Set()), null);
});

test("linha com concluida=false NÃO conclui o bloco", () => {
  // É assim que o app guarda onde o aluno parou num vídeo. Quem só ABRIU a
  // aula não pode destravar o bloco seguinte.
  const dias = cronograma(3);
  const linhas = [
    { chave: chaveItemTrilha(1, 0), concluida: true },
    { chave: chaveItemTrilha(1, 1), concluida: false }
  ];
  assert.equal(diaDoDecolando(dias, chavesConcluidas(linhas)), 1);

  linhas[1].concluida = true;
  assert.equal(diaDoDecolando(dias, chavesConcluidas(linhas)), 2);
});

test("blocos concluídos conta o que foi feito, não o que passou", () => {
  const dias = cronograma(40);
  assert.equal(blocosConcluidos(dias, new Set()), 0);
  assert.equal(blocosConcluidos(dias, concluir(dias, [1, 2, 5])), 3);
});
