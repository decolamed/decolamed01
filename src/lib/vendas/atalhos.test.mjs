// Os atalhos de período existem para o admin não errar o intervalo à mão.
// Se eles próprios errarem o intervalo, o total do topo da tela responde com
// convicção a uma pergunta que ninguém fez.

import test from "node:test";
import assert from "node:assert/strict";
import { atalhosDePeriodo } from "./atalhos.ts";

const porRotulo = (hoje, rotulo) => atalhosDePeriodo(hoje).find((a) => a.rotulo === rotulo);

test("os últimos 30 dias incluem hoje e somam 30 dias, não 31", () => {
  const a = porRotulo("2026-08-19", "Últimos 30 dias");
  assert.equal(a.de, "2026-07-21");
  assert.equal(a.ate, "2026-08-19");
});

test("os últimos 7 dias incluem hoje", () => {
  const a = porRotulo("2026-08-19", "Últimos 7 dias");
  assert.equal(a.de, "2026-08-13");
  assert.equal(a.ate, "2026-08-19");
});

test("'este mês' começa no dia 1 e termina hoje, não no fim do mês", () => {
  // Terminar em 31/08 incluiria dias que ainda não aconteceram. Não muda a
  // soma, mas o rótulo embaixo do total diria um período que não é o somado.
  const a = porRotulo("2026-08-19", "Este mês");
  assert.equal(a.de, "2026-08-01");
  assert.equal(a.ate, "2026-08-19");
});

test("'este mês' no dia 1 é um período de um dia", () => {
  const a = porRotulo("2026-08-01", "Este mês");
  assert.equal(a.de, "2026-08-01");
  assert.equal(a.ate, "2026-08-01");
});

test("'mês passado' pega o mês inteiro, com o número certo de dias", () => {
  assert.deepEqual(porRotulo("2026-08-19", "Mês passado"), {
    rotulo: "Mês passado",
    de: "2026-07-01",
    ate: "2026-07-31"
  });
  // Fevereiro de 2027 tem 28 dias; 2028 é bissexto e tem 29.
  assert.equal(porRotulo("2027-03-10", "Mês passado").ate, "2027-02-28");
  assert.equal(porRotulo("2028-03-10", "Mês passado").ate, "2028-02-29");
});

test("em janeiro, 'mês passado' volta um ano", () => {
  assert.deepEqual(porRotulo("2027-01-15", "Mês passado"), {
    rotulo: "Mês passado",
    de: "2026-12-01",
    ate: "2026-12-31"
  });
});

test("todo atalho tem início antes ou igual ao fim", () => {
  for (const hoje of ["2026-01-01", "2026-02-28", "2026-08-19", "2026-12-31", "2028-02-29"]) {
    for (const a of atalhosDePeriodo(hoje)) {
      assert.ok(a.de <= a.ate, `${a.rotulo} em ${hoje}: ${a.de} > ${a.ate}`);
    }
  }
});
