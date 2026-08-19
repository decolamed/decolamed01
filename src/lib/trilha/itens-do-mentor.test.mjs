// A tela do painel envia a lista de itens de um dia como JSON. É entrada de
// formulário: pode vir com campo em branco, tipo inventado, link sem esquema
// ou nem ser um array.
//
// Nada disso pode virar um dia quebrado no cronograma de um aluno — a mesma
// lista é lida depois pela tela dele, pelo resolvedor de conteúdo e pelo
// Copiloto. Estes testes fixam a fronteira.

import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizarItem,
  normalizarItens,
  lerItensDoFormulario,
  urlValida,
  TIPO_PADRAO
} from "./itens-do-mentor.ts";

// ═══════════════════════════════ UM ITEM ════════════════════════════════════
test("item completo passa inteiro", () => {
  const item = normalizarItem({
    tipo: "aula",
    titulo: "Citologia — a célula",
    materia: "Biologia",
    url: "https://youtu.be/abc",
    ref_id: "c1"
  });
  assert.equal(item.tipo, "aula");
  assert.equal(item.titulo, "Citologia — a célula");
  assert.equal(item.materia, "Biologia");
  assert.equal(item.url, "https://youtu.be/abc");
  assert.equal(item.ref_id, "c1");
});

test("sem título não existe item", () => {
  // Uma linha em branco no dia do aluno não abre nada e não explica nada.
  assert.equal(normalizarItem({ titulo: "", url: "https://x.test" }), null);
  assert.equal(normalizarItem({ titulo: "   " }), null);
  assert.equal(normalizarItem({}), null);
});

test("espaço em volta é aparado", () => {
  const item = normalizarItem({ titulo: "  Aula 1  ", materia: "  Física  " });
  assert.equal(item.titulo, "Aula 1");
  assert.equal(item.materia, "Física");
});

test("tipo inventado cai no padrão em vez de quebrar o dia", () => {
  for (const tipo of ["voo", "", null, 42, undefined]) {
    assert.equal(normalizarItem({ titulo: "x", tipo }).tipo, TIPO_PADRAO, `tipo ${tipo}`);
  }
});

test("tipo válido é aceito em qualquer caixa", () => {
  assert.equal(normalizarItem({ titulo: "x", tipo: "PDF" }).tipo, "pdf");
  assert.equal(normalizarItem({ titulo: "x", tipo: "Flashcards" }).tipo, "flashcards");
});

test("campo vazio vira null, não string vazia", () => {
  const item = normalizarItem({ titulo: "x", materia: "", url: "", ref_id: "" });
  assert.equal(item.materia, null);
  assert.equal(item.url, null);
  assert.equal(item.ref_id, null);
});

// ═══════════════════════════════ O LINK ═════════════════════════════════════
test("link sem esquema é recusado — seria um botão morto", () => {
  for (const url of ["youtube.com/x", "www.x.test", "//x.test", "javascript:alert(1)", "  "]) {
    assert.equal(urlValida(url), null, `deveria recusar ${url}`);
  }
});

test("http e https passam", () => {
  assert.equal(urlValida("https://x.test/a"), "https://x.test/a");
  assert.equal(urlValida("http://x.test/a"), "http://x.test/a");
  assert.equal(urlValida("HTTPS://X.test"), "HTTPS://X.test");
});

// ═══════════════════════════════ O TÍTULO DO MENTOR ═════════════════════════
test("título escrito pelo mentor é marcado como personalizado", () => {
  // Sem a marca, `resolverCronograma` sobrescreveria com o nome do conteúdo
  // de origem — o mentor renomearia a aula e veria o nome antigo voltar.
  assert.equal(normalizarItem({ titulo: "Resumo do Livro 1", ref_id: "c1" }).titulo_custom, true);
});

test("item sem conteúdo de origem não precisa da marca", () => {
  // Não há nome de origem para sobrescrever — a marca só criaria ruído.
  assert.equal(normalizarItem({ titulo: "Ler o capítulo 3" }).titulo_custom, undefined);
});

// ═══════════════════════════════ A LISTA ════════════════════════════════════
test("a lista descarta os itens sem título e mantém a ordem", () => {
  const itens = normalizarItens([
    { titulo: "Primeiro" },
    { titulo: "" },
    { titulo: "Segundo" },
    {},
    { titulo: "Terceiro" }
  ]);
  assert.deepEqual(itens.map((i) => i.titulo), ["Primeiro", "Segundo", "Terceiro"]);
});

test("lista vazia é resultado legítimo — é como se esvazia um dia", () => {
  assert.deepEqual(normalizarItens([]), []);
  assert.deepEqual(lerItensDoFormulario("[]"), []);
});

test("entrada que não é lista não estoura", () => {
  for (const entrada of [null, undefined, {}, "texto", 42]) {
    assert.deepEqual(normalizarItens(entrada), [], `entrada ${JSON.stringify(entrada)}`);
  }
});

test("JSON inválido vira lista vazia em vez de exceção", () => {
  assert.deepEqual(lerItensDoFormulario("{isso não é json"), []);
  assert.deepEqual(lerItensDoFormulario(""), []);
});

test("o formulário completo atravessa a fronteira", () => {
  const json = JSON.stringify([
    { tipo: "aula", titulo: "Aula de Citologia", materia: "Biologia", url: "https://youtu.be/1", ref_id: "c1" },
    { tipo: "questoes", titulo: "20 questões de Biologia", materia: "Biologia" },
    { tipo: "lixo", titulo: "Item de tipo estranho" },
    { titulo: "" }
  ]);
  const itens = lerItensDoFormulario(json);
  assert.equal(itens.length, 3, "o item sem título deveria ter caído");
  assert.equal(itens[0].url, "https://youtu.be/1");
  assert.equal(itens[1].url, null);
  assert.equal(itens[2].tipo, TIPO_PADRAO);
});
