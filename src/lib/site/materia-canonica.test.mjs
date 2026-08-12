// Auditoria das matérias — item 14 do pedido.
//
// A lista canônica é a de `materias_peso` no banco, conferida em 12/08/2026:
// Biologia, Espanhol, Física, Geografia, História, Inglês, Linguagens,
// Matemática, Química. Estes testes garantem que as variações conhecidas
// continuem caindo na matéria certa e — igualmente importante — que
// disciplinas distintas NÃO sejam fundidas.

import test from "node:test";
import assert from "node:assert/strict";
import {
  materiaCanonica,
  mesmaMateria,
  chaveMateria,
  materiasUnicas,
  ehMateriaIdioma,
  ehMateriaIdiomaConjunta
} from "./materia-canonica.ts";

/** As 9 disciplinas oficiais (espelham materias_peso). */
const OFICIAIS = [
  "Biologia",
  "Espanhol",
  "Física",
  "Geografia",
  "História",
  "Inglês",
  "Linguagens",
  "Matemática",
  "Química"
];

test("toda matéria oficial é canônica de si mesma", () => {
  OFICIAIS.forEach((m) => {
    assert.equal(materiaCanonica(m), m, `${m} deveria ser o próprio nome canônico`);
    assert.ok(mesmaMateria(m, m));
  });
});

test("caixa, acento e espaço não criam matérias diferentes", () => {
  OFICIAIS.forEach((m) => {
    const semAcento = m.normalize("NFD").replace(/[̀-ͯ]/g, "");
    [m.toUpperCase(), m.toLowerCase(), `  ${m}  `, semAcento, semAcento.toUpperCase()].forEach((v) => {
      assert.ok(mesmaMateria(v, m), `"${v}" deveria ser a mesma matéria que "${m}"`);
    });
  });
});

test("os nomes antigos de Linguagens continuam encontrando o conteúdo", () => {
  [
    "Português",
    "portugues",
    "PORTUGUÊS",
    "Língua Portuguesa",
    "Literatura",
    "Português e Literatura",
    "Linguagens e Códigos"
  ].forEach((v) => {
    assert.equal(materiaCanonica(v), "Linguagens", `${v} deveria virar Linguagens`);
    assert.ok(mesmaMateria(v, "Linguagens"));
  });
});

test("variações de Inglês e Espanhol normalizam a grafia", () => {
  ["Inglês", "ingles", "INGLES", "Língua Inglesa", "English"].forEach((v) =>
    assert.equal(materiaCanonica(v), "Inglês", `${v} deveria virar Inglês`)
  );
  ["Espanhol", "espanhol", "ESPANHOL", "Língua Espanhola", "Espanol"].forEach((v) =>
    assert.equal(materiaCanonica(v), "Espanhol", `${v} deveria virar Espanhol`)
  );
});

test("Inglês e Espanhol NÃO podem ser fundidos — são disciplinas distintas", () => {
  assert.ok(!mesmaMateria("Inglês", "Espanhol"));
  assert.ok(!mesmaMateria("English", "Espanol"));
  assert.ok(ehMateriaIdioma("Inglês") && ehMateriaIdioma("Espanhol"));
  assert.ok(!ehMateriaIdioma("Linguagens"), "Linguagens não é língua estrangeira");
});

test("a matéria conjunta antiga é reconhecida para poder ser recusada", () => {
  ["Inglês/Espanhol", "ingles / espanhol", "Espanhol/Inglês"].forEach((v) =>
    assert.ok(ehMateriaIdiomaConjunta(v), `${v} deveria ser detectada como conjunta`)
  );
  assert.ok(!ehMateriaIdiomaConjunta("Inglês"));
});

test("disciplinas diferentes nunca colidem entre si", () => {
  for (let i = 0; i < OFICIAIS.length; i++) {
    for (let j = i + 1; j < OFICIAIS.length; j++) {
      assert.ok(
        !mesmaMateria(OFICIAIS[i], OFICIAIS[j]),
        `${OFICIAIS[i]} e ${OFICIAIS[j]} não podem ser tratadas como a mesma`
      );
    }
  }
});

test("matéria nova cadastrada pelo admin não é descartada nem renomeada", () => {
  assert.equal(materiaCanonica("Filosofia"), "Filosofia");
  assert.equal(materiaCanonica("Sociologia"), "Sociologia");
  assert.equal(materiaCanonica("  Atualidades  "), "Atualidades");
});

test("vazio e nulo não viram matéria", () => {
  ["", "   ", null, undefined].forEach((v) => {
    assert.equal(materiaCanonica(v), "");
    assert.ok(!mesmaMateria(v, "Biologia"));
    assert.ok(!mesmaMateria(v, v), "vazio não é 'a mesma matéria' que vazio");
  });
});

test("materiasUnicas colapsa variações e preserva a ordem", () => {
  const saida = materiasUnicas(["Português", "Biologia", "portugues", "Literatura", "Biologia", null, "Inglês"]);
  assert.deepEqual(saida, ["Linguagens", "Biologia", "Inglês"]);
});

test("chaveMateria é estável — é a chave usada como índice em todo o motor", () => {
  assert.equal(chaveMateria("  QUÍMICA  "), "quimica");
  assert.equal(chaveMateria("História"), "historia");
  assert.equal(chaveMateria("Língua  Portuguesa"), "lingua portuguesa");
});
