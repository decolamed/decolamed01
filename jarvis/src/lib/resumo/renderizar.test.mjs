// Teste do renderizador de resumo. `node --experimental-strip-types --test`.
//
// Dois grupos de risco justificam este arquivo:
//   1. SEGURANÇA — o corpo do resumo é escrito por um modelo e editado pelo
//      aluno, e o resultado vai para a tela com `dangerouslySetInnerHTML`.
//      Se o escape falhar, é XSS na cara.
//   2. NUMERAÇÃO — a citação [@pmid] só vale alguma coisa se o número no texto
//      corresponder à fonte certa na lista do rodapé.

import test from "node:test";
import assert from "node:assert/strict";
import { renderizar, autoresAbreviados } from "./renderizar.ts";

const FONTES = [
  { pmid: "111", titulo: "Artigo Um", autores: ["Silva A"], revista: "Lancet", ano: "2020" },
  { pmid: "222", titulo: "Artigo Dois", autores: ["Souza B"], revista: "NEJM", ano: "2021" }
];

test("escapa HTML vindo do modelo", () => {
  const { html } = renderizar('Texto com <script>alert("x")</script> no meio.');
  assert.ok(!html.includes("<script>"), "a tag script não pode sobreviver");
  assert.match(html, /&lt;script&gt;/);
});

test("não deixa passar link javascript:", () => {
  const { html } = renderizar("[clique](javascript:alert(1))");
  // O texto continua visível como texto puro — isso é correto e desejável.
  // O que não pode existir é a ÂNCORA: sem <a href>, não há o que clicar.
  assert.ok(!/<a\b/.test(html), "nada de âncora para um esquema não permitido");
  assert.ok(!/href=/.test(html), "nada de href");
  assert.match(html, /<p class="r-p">\[clique\]\(javascript:alert\(1\)\)<\/p>/);
});

test("link http vira âncora com rel de segurança", () => {
  const { html } = renderizar("[PubMed](https://pubmed.ncbi.nlm.nih.gov/)");
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /href="https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/"/);
});

test("numera citações na ordem de aparição e reusa o número na repetição", () => {
  const { html, citadas } = renderizar(
    "Primeiro fato [@222]. Segundo fato [@111]. De novo o primeiro [@222].",
    FONTES
  );
  // 222 apareceu antes, então é a fonte 1 — mesmo estando depois na lista.
  assert.match(html, /data-pmid="222">1</);
  assert.match(html, /data-pmid="111">2</);
  assert.equal((html.match(/data-pmid="222">1</g) ?? []).length, 2, "a repetição reusa o número");
  assert.deepEqual(citadas.map((r) => r.pmid), ["222", "111"]);
});

test("referência anexada mas nunca citada fica fora da lista final", () => {
  const { citadas } = renderizar("Só cito uma [@111].", FONTES);
  assert.deepEqual(citadas.map((r) => r.pmid), ["111"]);
});

test("citação sem fonte correspondente é denunciada, não escondida", () => {
  const { citacoesOrfas } = renderizar("Fato sem lastro [@999].", FONTES);
  assert.deepEqual(citacoesOrfas, ["999"]);
});

test("bloco :::atencao vira aside com rótulo próprio", () => {
  const { html } = renderizar(":::atencao\nNão confundir com angina estável.\n:::");
  assert.match(html, /class="r-bloco b-atencao"/);
  assert.match(html, /r-bloco-rotulo">Atenção</);
  assert.match(html, /Não confundir com angina estável\./);
});

test("bloco com título próprio usa o título no lugar do rótulo padrão", () => {
  const { html } = renderizar(":::clinico Como o paciente chega\nDor em aperto.\n:::");
  assert.match(html, /r-bloco-rotulo">Como o paciente chega</);
});

test("tipo de bloco desconhecido degrada em nota, sem sumir com o conteúdo", () => {
  const { html } = renderizar(":::inventado Coisa nova\nO conteúdo tem que sobreviver.\n:::");
  assert.match(html, /b-nota/);
  assert.match(html, /O conteúdo tem que sobreviver\./);
});

test("grifo, negrito e itálico", () => {
  const { html } = renderizar("Um ==termo grifado==, um **forte** e um *leve*.");
  assert.match(html, /<mark class="r-grifo">termo grifado<\/mark>/);
  assert.match(html, /<strong class="r-forte">forte<\/strong>/);
  assert.match(html, /<em>leve<\/em>/);
});

test("código protege seu conteúdo da formatação", () => {
  const { html } = renderizar("Use `a**b**c` literalmente.");
  assert.match(html, /<code class="r-codigo">a\*\*b\*\*c<\/code>/);
  assert.ok(!html.includes("<strong"), "o que está em código não vira negrito");
});

test("tabela com cabeçalho e corpo", () => {
  const { html } = renderizar("| Achado | Significa |\n| --- | --- |\n| Troponina | Necrose |");
  assert.match(html, /<th>Achado<\/th>/);
  assert.match(html, /<td>Troponina<\/td>/);
  assert.match(html, /r-tabela-rolagem/);
});

test("lista com sublista aninhada por recuo", () => {
  const { html } = renderizar("- Causa cardíaca\n  - Infarto\n  - Pericardite\n- Causa pulmonar");
  assert.match(html, /r-lista-interna/);
  assert.match(html, /<li>Infarto<\/li>/);
  // A sublista fica DENTRO do primeiro item, não solta como item irmão.
  assert.match(html, /Causa cardíaca<ul class="r-lista-interna">/);
});

test("títulos viram h1..h4 com a classe certa", () => {
  const { html } = renderizar("# Um\n## Dois\n### Três");
  assert.match(html, /<h1 class="r-h1">Um<\/h1>/);
  assert.match(html, /<h2 class="r-h2">Dois<\/h2>/);
  assert.match(html, /<h3 class="r-h3">Três<\/h3>/);
});

test("linhas soltas viram um parágrafo só, e linha em branco separa", () => {
  const { html } = renderizar("Linha um\nLinha dois\n\nOutro parágrafo");
  assert.match(html, /<p class="r-p">Linha um Linha dois<\/p>/);
  assert.match(html, /<p class="r-p">Outro parágrafo<\/p>/);
});

test("corpo vazio não quebra", () => {
  assert.deepEqual(renderizar(""), { html: "", citadas: [], citacoesOrfas: [] });
});

test("bloco sem fechamento consome o resto sem entrar em laço infinito", () => {
  const { html } = renderizar(":::conceito\nAbri e esqueci de fechar.");
  assert.match(html, /Abri e esqueci de fechar\./);
});

test("autores abreviados seguem o corte da Vancouver", () => {
  assert.equal(autoresAbreviados(["A", "B"]), "A, B");
  assert.equal(autoresAbreviados(["A", "B", "C"]), "A, B, C");
  assert.equal(autoresAbreviados(["A", "B", "C", "D"]), "A, B, C, et al.");
  assert.equal(autoresAbreviados([]), "");
});

test("na conversa, a citação abre o PubMed em vez de apontar para o rodapé", () => {
  const { html } = renderizar("Fato [@31234567].", [], { citacaoAbrePubmed: true });
  assert.match(html, /href="https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/31234567\/"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("no resumo, a citação continua apontando para a fonte no rodapé", () => {
  const { html } = renderizar("Fato [@31234567].");
  assert.match(html, /href="#fonte-31234567"/);
  assert.ok(!html.includes("pubmed.ncbi.nlm.nih.gov"));
});
