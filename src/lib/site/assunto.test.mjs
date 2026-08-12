// Testes da afinidade de assunto — o elo entre questão errada, revisão e
// material de revisão (flashcards / vídeo).
//
// Os assuntos usados aqui são os REAIS do banco, copiados em 12/08/2026, para
// os testes falharem se o casamento voltar a não funcionar com os dados de
// verdade.

import test from "node:test";
import assert from "node:assert/strict";
import { afinidadeDeAssunto, termosDoAssunto, porAfinidadeDeAssunto, AFINIDADE_MINIMA } from "./assunto.ts";

/** Assuntos reais dos flashcards de Química. */
const FLASH_QUIMICA = [
  "Ácidos e Bases · Ácidos, bases e pH · Continuação",
  "Bioquímica · Aprofundamento",
  "Cinética Química · Aprofundamento",
  "Eletroquímica",
  "Equilíbrio Iônico · Aprofundamento",
  "Equilíbrio Químico",
  "Estequiometria",
  "Estequiometria de Gases · Aprofundamento",
  "Funções Orgânicas",
  "Funções Orgânicas · Continuação",
  "Ligações Químicas",
  "Polímeros · Mais funções orgânicas · Continuação",
  "Química Ambiental · Continuação",
  "Química Orgânica Avançada · Aprofundamento",
  "Radioatividade",
  "Radioatividade · Química ambiental e do cotidiano · Continuação",
  "Soluções · Aprofundamento",
  "Termoquímica"
].map((assunto) => ({ materia: "Química", assunto }));

const FLASH_BIOLOGIA = [
  { materia: "Biologia", assunto: "Citologia" },
  { materia: "Biologia", assunto: "Ecologia · Continuação" },
  { materia: "Biologia", assunto: "Genética" }
];

// ----------------------------------------------------------------- TESTE 1 --
test("1 — revisão de um assunto com flashcards abre só os cards daquele assunto", () => {
  const achados = porAfinidadeDeAssunto(FLASH_QUIMICA, {
    materia: "Química",
    assunto: "Físico-Química · Termoquímica e Combustão"
  });

  assert.ok(achados.length > 0, "deveria encontrar flashcards do assunto");
  assert.ok(achados.length < FLASH_QUIMICA.length, "nunca o acervo inteiro");
  assert.equal(achados[0].assunto, "Termoquímica", "o mais próximo vem primeiro");
  achados.forEach((f) => assert.equal(f.materia, "Química"));
});

test("1b — funciona para os assuntos reais que o Copiloto recomendou ao aluno", () => {
  // Os 7 assuntos que estavam em `copiloto_recomendacoes`. Antes, a
  // comparação por igualdade de string acertava 2 de 7.
  const casos = [
    "Físico-Química e Química Orgânica · Reações Orgânicas e Termoquímica",
    "Físico-Química · Termoquímica e Combustão",
    "Estequiometria · Cálculos Estequiométricos e Pureza",
    "Química Orgânica · Polímeros",
    "Química · Radioatividade",
    "Equilíbrio Químico e Ácidos e Bases · Deslocamento de Equilíbrio (Princípio de Le Chatelier)"
  ];
  casos.forEach((assunto) => {
    const achados = porAfinidadeDeAssunto(FLASH_QUIMICA, { materia: "Química", assunto });
    assert.ok(achados.length > 0, `"${assunto}" não encontrou nenhum flashcard`);
    assert.ok(achados.length <= 6, `"${assunto}" trouxe ${achados.length} — perto demais do acervo inteiro`);
  });
});

// ----------------------------------------------------------------- TESTE 2 --
test("2 — sem flashcards do assunto, devolve VAZIO (nunca o acervo)", () => {
  const achados = porAfinidadeDeAssunto(FLASH_QUIMICA, {
    materia: "Química",
    assunto: "Astrofísica de Buracos Negros"
  });
  assert.deepEqual(achados, [], "deveria devolver vazio para a tela poder avisar");
});

test("2b — sem assunto definido também devolve vazio, não a matéria inteira", () => {
  assert.deepEqual(porAfinidadeDeAssunto(FLASH_QUIMICA, { materia: "Química", assunto: null }), []);
});

// ------------------------------------------------------------- MATÉRIA DURA --
test("a matéria é filtro duro e canônico — nunca vaza para outra disciplina", () => {
  const misturado = [...FLASH_QUIMICA, ...FLASH_BIOLOGIA];
  const achados = porAfinidadeDeAssunto(misturado, {
    materia: "Química",
    assunto: "Química Orgânica · Polímeros"
  });
  achados.forEach((f) => assert.equal(f.materia, "Química", "trouxe card de outra matéria"));
});

test("Inglês e Espanhol não se misturam numa revisão", () => {
  const cards = [
    { materia: "Inglês", assunto: "Verb Tenses · Present Perfect" },
    { materia: "Espanhol", assunto: "Verb Tenses · Present Perfect" }
  ];
  const ingles = porAfinidadeDeAssunto(cards, { materia: "Inglês", assunto: "Verb Tenses · Present Perfect" });
  assert.equal(ingles.length, 1);
  assert.equal(ingles[0].materia, "Inglês");
});

test("Português na revisão encontra os cards gravados como Linguagens", () => {
  const cards = [{ materia: "Linguagens", assunto: "Sintaxe · Orações Subordinadas" }];
  const achados = porAfinidadeDeAssunto(cards, { materia: "Português", assunto: "Sintaxe · Período Composto" });
  assert.equal(achados.length, 1, "matéria canônica precisa casar Português com Linguagens");
});

// ------------------------------------------------------- ASSUNTOS DISTINTOS --
test("assuntos sem relação não casam", () => {
  const pares = [
    ["Reações Químicas · Oxirredução", "Radioatividade"],
    ["Citologia · Organelas Celulares", "Ecologia · Impactos Ambientais"],
    ["Genética · Leis de Mendel", "Termoquímica"]
  ];
  pares.forEach(([a, b]) =>
    assert.ok(afinidadeDeAssunto(a, b) < AFINIDADE_MINIMA, `"${a}" não deveria casar com "${b}"`)
  );
});

test("o nome da matéria sozinho não aproxima assuntos", () => {
  // "Química" aparece dos dois lados e não diz nada sobre o tema — era o que
  // fazia "Reações Químicas · Oxirredução" casar com "Equilíbrio Químico".
  assert.ok(afinidadeDeAssunto("Reações Químicas · Oxirredução", "Equilíbrio Químico") < AFINIDADE_MINIMA);
  assert.ok(afinidadeDeAssunto("Biologia · Citologia", "Biologia · Genética") < AFINIDADE_MINIMA);
});

test("marcadores de continuidade não contam como tema", () => {
  assert.deepEqual(termosDoAssunto("Estequiometria · Continuação"), ["estequiometria"]);
  assert.deepEqual(termosDoAssunto("Radioatividade · Aprofundamento"), ["radioatividade"]);
  // Um assunto que só tem palavras vazias não casa com nada.
  assert.equal(afinidadeDeAssunto("Revisão Geral", "Termoquímica"), 0);
});

test("plural e gênero não separam o mesmo assunto", () => {
  assert.ok(afinidadeDeAssunto("Funções Orgânicas", "Função Orgânica") >= AFINIDADE_MINIMA);
  assert.ok(afinidadeDeAssunto("Reações Orgânicas", "Reação Orgânica") >= AFINIDADE_MINIMA);
});

test("acento e caixa não separam o mesmo assunto", () => {
  assert.equal(afinidadeDeAssunto("TERMOQUÍMICA", "termoquimica"), 1);
  assert.equal(afinidadeDeAssunto("Genética", "GENETICA"), 1);
});

// ------------------------------------------------------------- DETERMINISMO --
test("7 — a mesma revisão devolve sempre os mesmos cards, na mesma ordem", () => {
  const alvo = { materia: "Química", assunto: "Química Orgânica · Polímeros" };
  const a = porAfinidadeDeAssunto(FLASH_QUIMICA, alvo).map((f) => f.assunto);
  const b = porAfinidadeDeAssunto(FLASH_QUIMICA, alvo).map((f) => f.assunto);
  assert.deepEqual(a, b, "a seleção mudou entre duas aberturas");
});

test("vale para todas as matérias canônicas, sem regra específica de assunto", () => {
  const OFICIAIS = [
    "Biologia", "Espanhol", "Física", "Geografia",
    "História", "Inglês", "Linguagens", "Matemática", "Química"
  ];
  OFICIAIS.forEach((materia) => {
    const cards = [
      { materia, assunto: "Fotossíntese Celular" },
      { materia, assunto: "Outro Tema Qualquer" }
    ];
    const achados = porAfinidadeDeAssunto(cards, { materia, assunto: "Metabolismo · Fotossíntese e Respiração" });
    assert.equal(achados.length, 1, `${materia} não casou pelo termo compartilhado`);
    assert.equal(achados[0].assunto, "Fotossíntese Celular");
  });
});
