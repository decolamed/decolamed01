// Os quatro resumos de livro tinham `url` nula no banco e `abrirItemTrilha`
// dizia, em comentário, que "leitura não abre nada". O aluno via o item e não
// tinha para onde ir. Estes testes fixam a resolução central: o endereço sai
// das configurações e vale em qualquer cronograma.

import test from "node:test";
import assert from "node:assert/strict";
import {
  numeroDoLivro,
  ehResumoDeLivro,
  urlDoResumo,
  aplicarLinksDosResumos,
  lerLinksDosResumos,
  chaveDoResumo,
  CHAVES_DOS_RESUMOS,
  TOTAL_DE_LIVROS
} from "./resumos-livros.ts";

const LINKS = {
  1: "https://exemplo.test/livro-1",
  2: "https://exemplo.test/livro-2",
  3: "https://exemplo.test/livro-3",
  4: "https://exemplo.test/livro-4"
};

// ─────────────────────────────────────────── RECONHECER O LIVRO ─────────────
test("os títulos reais do template são reconhecidos", () => {
  // Exatamente como estão em trilha_dias hoje.
  assert.equal(numeroDoLivro("Leitura do resumo do Livro 1"), 1);
  assert.equal(numeroDoLivro("Leitura do resumo do Livro 2"), 2);
  assert.equal(numeroDoLivro("Leitura do resumo do Livro 3"), 3);
  assert.equal(numeroDoLivro("Leitura do resumo do Livro 4 (dia livre de aulas)"), 4);
});

test("outras redações do mesmo item também são reconhecidas", () => {
  // O vínculo não pode depender do texto exato: o admin renomeia o item e o
  // botão continuaria apontando para lugar nenhum.
  assert.equal(numeroDoLivro("Resumo do Livro 2"), 2);
  assert.equal(numeroDoLivro("Bagagem Essencial — Livro 3"), 3);
  assert.equal(numeroDoLivro("LIVRO 4"), 4);
  assert.equal(numeroDoLivro("livro 1 — leitura obrigatória"), 1);
});

test("fora do intervalo dos quatro, não é um dos resumos", () => {
  assert.equal(numeroDoLivro("Livro 7"), null);
  assert.equal(numeroDoLivro("Livro 0"), null);
  assert.equal(numeroDoLivro("Leitura complementar"), null);
  assert.equal(numeroDoLivro(""), null);
  assert.equal(numeroDoLivro(null), null);
});

test("só item de LEITURA vira resumo — o número sozinho não basta", () => {
  assert.equal(ehResumoDeLivro({ tipo: "leitura", titulo: "Leitura do resumo do Livro 1" }), true);
  // Uma aula que por acaso cita "livro 2" no título não é o resumo.
  assert.equal(ehResumoDeLivro({ tipo: "aula", titulo: "Resenha do livro 2" }), false);
  assert.equal(ehResumoDeLivro({ tipo: "leitura", titulo: "Leitura livre" }), false);
});

// ──────────────────────────────────────── RESOLVER O ENDEREÇO ───────────────
test("o endereço vem das configurações", () => {
  assert.equal(urlDoResumo(3, LINKS), "https://exemplo.test/livro-3");
  assert.equal(urlDoResumo(null, LINKS), null);
});

test("campo em branco não vira link", () => {
  // Melhor o item sem ação do que um botão que abre a página em branco.
  assert.equal(urlDoResumo(1, { 1: "" }), null);
  assert.equal(urlDoResumo(1, { 1: "   " }), null);
  assert.equal(urlDoResumo(2, {}), null);
});

// ─────────────────────────────── APLICAR NOS ITENS DO CRONOGRAMA ────────────
test("os itens de leitura recebem o link; os outros ficam intactos", () => {
  const itens = [
    { tipo: "leitura", titulo: "Leitura do resumo do Livro 1", url: null },
    { tipo: "aula", titulo: "Citologia", url: "https://youtu.be/abc" },
    { tipo: "leitura", titulo: "Leitura do resumo do Livro 4 (dia livre de aulas)", url: null }
  ];
  const saida = aplicarLinksDosResumos(itens, LINKS);
  assert.equal(saida[0].url, "https://exemplo.test/livro-1");
  assert.equal(saida[1].url, "https://youtu.be/abc", "a aula não pode ser tocada");
  assert.equal(saida[2].url, "https://exemplo.test/livro-4");
});

test("a configuração tem precedência sobre um endereço antigo copiado no item", () => {
  // É o ponto do pedido: nenhuma ocorrência com link fixo ou diferente do
  // que está cadastrado.
  const itens = [{ tipo: "leitura", titulo: "Resumo do Livro 2", url: "https://antigo.test/velho" }];
  assert.equal(aplicarLinksDosResumos(itens, LINKS)[0].url, "https://exemplo.test/livro-2");
});

test("sem link cadastrado, o item volta como estava", () => {
  const itens = [{ tipo: "leitura", titulo: "Leitura do resumo do Livro 3", url: null }];
  const saida = aplicarLinksDosResumos(itens, {});
  assert.equal(saida[0].url, null);
  assert.deepEqual(saida[0], itens[0]);
});

test("aplicar não altera a lista original", () => {
  const itens = [{ tipo: "leitura", titulo: "Livro 1", url: null }];
  aplicarLinksDosResumos(itens, LINKS);
  assert.equal(itens[0].url, null, "a entrada precisa continuar intacta");
});

// ──────────────────────────────────────── LEITURA DAS CONFIGURAÇÕES ─────────
test("as chaves têm o formato esperado e são quatro", () => {
  assert.equal(TOTAL_DE_LIVROS, 4);
  assert.equal(chaveDoResumo(1), "livros.resumo_1_url");
  assert.deepEqual(CHAVES_DOS_RESUMOS, [
    "livros.resumo_1_url",
    "livros.resumo_2_url",
    "livros.resumo_3_url",
    "livros.resumo_4_url"
  ]);
});

test("lê as linhas de configuracoes e ignora o que não é resumo", () => {
  const links = lerLinksDosResumos([
    { chave: "livros.resumo_1_url", valor: "https://a.test" },
    { chave: "livros.resumo_2_url", valor: "  " },
    { chave: "site.termos_uso_url", valor: "https://termos.test" },
    { chave: "livros.resumo_9_url", valor: "https://fora.test" }
  ]);
  assert.deepEqual(links, { 1: "https://a.test" });
});

test("valor com aspas a mais é desembrulhado, não vira link quebrado", () => {
  // Linhas antigas de `configuracoes` estão gravadas com camadas de aspas
  // (ver lib/site/configuracoes.ts). Sem desembrulhar, o botão abriria
  // `"https://a.test"` — com as aspas dentro do endereço.
  const links = lerLinksDosResumos([
    { chave: "livros.resumo_1_url", valor: '"https://a.test"' },
    { chave: "livros.resumo_2_url", valor: '"\\"https://b.test\\""' }
  ]);
  assert.deepEqual(links, { 1: "https://a.test", 2: "https://b.test" });
});

test("lista vazia ou nula devolve mapa vazio", () => {
  assert.deepEqual(lerLinksDosResumos([]), {});
  assert.deepEqual(lerLinksDosResumos(null), {});
  assert.deepEqual(lerLinksDosResumos(undefined), {});
});
