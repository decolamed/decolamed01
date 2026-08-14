// A Q86A665 (FACAPE 2024.1, Inglês, questão 15) chegava ao aluno assim:
//
//   "(Referente ao texto da Questão 14). Qual das alternativas abaixo é a
//    mais apropriada de acordo com o texto acima:"
//
// Sem o texto da questão 14 na tela, ela é impossível de responder. Estes
// testes fixam o reconhecimento do padrão — e, tão importante quanto, fixam
// os casos que NÃO podem ser marcados por engano, porque marcar de menos
// deixa o aluno preso e marcar demais apaga questão boa do acervo.

import test from "node:test";
import assert from "node:assert/strict";
import { diagnosticarDependencia, dependeDeContextoExterno } from "./questao-dependente.ts";

// ─────────────────────────────────── OS CASOS REAIS DO ACERVO ───────────────
test("a Q86A665 é reconhecida", () => {
  const d = diagnosticarDependencia(
    "(Referente ao texto da Questão 14).\n\nQual das alternativas abaixo é a mais apropriada de\nacordo com o texto acima:"
  );
  assert.equal(d.dependente, true);
  assert.match(d.motivo, /outra questão/i);
});

test("as outras formas de citar a questão vizinha também são reconhecidas", () => {
  const casos = [
    "(Vide texto da questão 11.)\n\nQual é uma das consequências da turistificação mencionadas no texto?",
    "(Texto da questão 14, referenciado na questão 15)\n\nQual das alternativas abaixo é a mais apropriada:",
    "(O texto base é o mesmo da Questão 11: \"The Vital Role of Exercise\")\n\nBased on the second paragraph...",
    "(Não possui texto-base.)\n\nCom relação ao enunciado da questão 31, pode-se dizer que as enzimas:",
    "(Não possui texto-base.)\n\nA palavra 'you' na expressão - you have brains in your head - do dito da questão 13, é um:"
  ];
  casos.forEach((c) => assert.equal(dependeDeContextoExterno(c), true, c.slice(0, 40)));
});

test("depois do texto incorporado, a mesma citação deixa de ser um problema", () => {
  // A Q81D808 continua dizendo "do dito da questão 13" — a frase é da prova
  // original — mas agora traz o trecho acima. Marcar essa questão tiraria do
  // acervo justamente o que a migração 058 acabou de consertar.
  const reparada =
    "\"You have brains in your head. You have feet in\nyour shoes. You can steer yourself any direction\n" +
    "you choose.\" Dr. Seuss\n\nA palavra 'you' na expressão - you have brains in your head - " +
    "do dito da questão 13, analisada sintaticamente é um:";
  assert.equal(dependeDeContextoExterno(reparada), false);

  // E a versão ANTES do conserto continua sendo reconhecida.
  const quebrada =
    "(Não possui texto-base.)\n\nA palavra 'you' na expressão - you have brains in your head - " +
    "do dito da questão 13, analisada sintaticamente é um:";
  assert.equal(dependeDeContextoExterno(quebrada), true);
});

// ───────────────────────── O QUE NÃO PODE SER MARCADO POR ENGANO ────────────
test("questão que TRAZ o próprio texto continua válida", () => {
  const comTexto =
    "\"There is no more miserable human being than one in whom nothing is habitual but indecision, " +
    "and for whom the lighting of every cigar, the drinking of every cup, the time of rising and going " +
    "to bed every day, and the beginning of every bit of work, are subjects of express volitional " +
    "deliberation.\"\nFonte: William James - The Principles of Psychology\n\n" +
    "Qual é a alternativa CORRETA de acordo com o texto de William James?";
  assert.equal(dependeDeContextoExterno(comTexto), false);
});

test("cabeçalho 'TEXTO PARA AS QUESTÕES 11 A 15' com o texto embutido é válido", () => {
  // Estas questões repetem o texto inteiro em cada uma — o rótulo confunde,
  // mas o aluno tem tudo o que precisa.
  const q =
    "TEXTO PARA AS QUESTÕES 11 E 12\n\n\"En la historia de la humanidad, las migraciones han sido una " +
    "constante. Desde los primeros grupos nómadas hasta las actuales crisis de refugiados, el movimiento " +
    "humano ha moldeado civilizaciones, culturas y economías. Sin embargo, la percepción de la migración " +
    "ha variado con el tiempo.\"\n\nA principal tese do texto é que:";
  assert.equal(dependeDeContextoExterno(q), false);
});

test("tabela escrita em Markdown dentro do enunciado é contexto presente", () => {
  const q =
    "Foram verificadas as notas dos 30 alunos de uma turma do 3º ano do ensino médio. Essas notas, que " +
    "variaram de 5 a 10, bem como a frequência, foram anotadas na tabela abaixo:\n\n" +
    "| Notas | 5 | 6 | 8 | 9 | 10 |\n|---|---|---|---|---|---|\n| Nº de alunos | 5 | 7 | 8 | 6 | 4 |\n\n" +
    "A nota média desses alunos, com aproximação de uma casa decimal, foi:";
  assert.equal(dependeDeContextoExterno(q), false);
});

test("questão curta que cita figura é válida QUANDO tem imagem anexada", () => {
  const q = "De acordo com o gráfico acima, a velocidade máxima atingida foi:";
  assert.equal(dependeDeContextoExterno(q, { temImagem: true }), false);
  assert.equal(dependeDeContextoExterno(q, { temImagem: false }), true);
});

test("questão autossuficiente e curta não é marcada", () => {
  assert.equal(
    dependeDeContextoExterno("What is the passive voice of this sentence: \"They painted the house.\"?"),
    false
  );
  assert.equal(
    dependeDeContextoExterno("Sobre a obra \"Os Homens de Barro\" de Ariano Suassuna, é CORRETO afirmar que:"),
    false
  );
});

// ──────────────────────────────────────────────── BORDAS ────────────────────
test("enunciado vazio é dependente — não há o que responder", () => {
  assert.equal(dependeDeContextoExterno(""), true);
  assert.equal(dependeDeContextoExterno(null), true);
  assert.equal(dependeDeContextoExterno(undefined), true);
});

test("o motivo é uma frase que o admin consegue ler", () => {
  const d = diagnosticarDependencia("(Vide texto da questão 11.)\n\nO que pensam os turistas?");
  assert.ok(typeof d.motivo === "string" && d.motivo.length > 20);
  assert.equal(diagnosticarDependencia("Quanto é 2 + 2?").motivo, null);
});
