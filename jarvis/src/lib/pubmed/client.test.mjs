// Teste do parse do XML do PubMed. Roda com `node --test src/lib/pubmed/`.
//
// Por que um teste com XML fixo em vez de bater na API: o XML do PubMed tem
// várias formas legítimas para a mesma informação — um autor vira objeto, dois
// viram array; o ano às vezes é <Year>, às vezes está enterrado num
// <MedlineDate> livre; o DOI aparece ora em <ELocationID>, ora em
// <ArticleIdList>; o título carrega marcação inline. É ESSA variação que quebra
// o parse, e ela não aparece de forma confiável numa amostra qualquer da rede.
// O fixture abaixo reúne todos os casos de uma vez, de propósito.

import test from "node:test";
import assert from "node:assert/strict";
import { interpretarXml, montarConsulta } from "./client.ts";

const XML = `<?xml version="1.0" ?>
<PubmedArticleSet>
  <PubmedArticle>
    <MedlineCitation Status="MEDLINE">
      <PMID Version="1">33301246</PMID>
      <Article PubModel="Print">
        <Journal>
          <ISOAbbreviation>N Engl J Med</ISOAbbreviation>
          <Title>The New England journal of medicine</Title>
          <JournalIssue><PubDate><Year>2021</Year><Month>Feb</Month></PubDate></JournalIssue>
        </Journal>
        <ArticleTitle>Effect of <i>Helicobacter pylori</i> eradication on gastric cancer: a 10-year follow-up</ArticleTitle>
        <Abstract>
          <AbstractText Label="BACKGROUND">Gastric cancer remains common.</AbstractText>
          <AbstractText Label="METHODS">We randomly assigned 1,630 patients (H&#x2082;O control).</AbstractText>
          <AbstractText Label="CONCLUSIONS">Eradication reduced incidence.</AbstractText>
        </Abstract>
        <AuthorList>
          <Author><LastName>Choi</LastName><Initials>IJ</Initials></Author>
          <Author><LastName>Kook</LastName><Initials>MC</Initials></Author>
          <Author><CollectiveName>The HELPER Study Group</CollectiveName></Author>
        </AuthorList>
        <PublicationTypeList>
          <PublicationType>Journal Article</PublicationType>
          <PublicationType>Randomized Controlled Trial</PublicationType>
        </PublicationTypeList>
        <ELocationID EIdType="doi" ValidYN="Y">10.1056/NEJMoa2020693</ELocationID>
      </Article>
    </MedlineCitation>
  </PubmedArticle>
  <PubmedArticle>
    <MedlineCitation Status="MEDLINE">
      <PMID Version="2">9876543</PMID>
      <Article>
        <Journal>
          <Title>Revista Brasileira de Cardiologia</Title>
          <JournalIssue><PubDate><MedlineDate>1998 Nov-Dec</MedlineDate></PubDate></JournalIssue>
        </Journal>
        <ArticleTitle>Dor tor&#xE1;cica na emerg&#xEA;ncia</ArticleTitle>
        <Abstract><AbstractText>Resumo sem r&#xF3;tulo nenhum, num par&#xE1;grafo s&#xF3;.</AbstractText></Abstract>
        <AuthorList><Author><LastName>Silva</LastName><Initials>AB</Initials></Author></AuthorList>
        <PublicationTypeList><PublicationType>Review</PublicationType></PublicationTypeList>
      </Article>
    </MedlineCitation>
    <PubmedData>
      <ArticleIdList>
        <ArticleId IdType="pubmed">9876543</ArticleId>
        <ArticleId IdType="doi">10.1590/exemplo</ArticleId>
      </ArticleIdList>
    </PubmedData>
  </PubmedArticle>
  <PubmedArticle>
    <MedlineCitation>
      <PMID>111</PMID>
      <Article>
        <Journal><ISOAbbreviation>Lancet</ISOAbbreviation><JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue></Journal>
        <ArticleTitle>Editorial sem resumo</ArticleTitle>
        <PublicationTypeList><PublicationType>Editorial</PublicationType></PublicationTypeList>
      </Article>
    </MedlineCitation>
  </PubmedArticle>
</PubmedArticleSet>`;

test("lê os três artigos do conjunto", () => {
  assert.equal(interpretarXml(XML).length, 3);
});

test("título preserva a ordem das palavras apesar da marcação inline", () => {
  const [a] = interpretarXml(XML);
  // O risco real: sem `stopNodes`, o <i> vira um nó irmão e o parser entrega
  // "Effect of eradication on gastric cancer ... Helicobacter pylori" — com o
  // nome da bactéria jogado no fim. Aqui a frase tem que ficar inteira.
  assert.equal(
    a.titulo,
    "Effect of Helicobacter pylori eradication on gastric cancer: a 10-year follow-up"
  );
});

test("resumo estruturado mantém os rótulos das seções", () => {
  const [a] = interpretarXml(XML);
  assert.match(a.resumo, /^BACKGROUND: Gastric cancer remains common\./);
  assert.match(a.resumo, /CONCLUSIONS: Eradication reduced incidence\./);
  // Entidade numérica decodificada (H₂O), não deixada como "&#x2082;".
  assert.match(a.resumo, /H₂O control/);
});

test("autores: um por linha, e consórcio entra pelo CollectiveName", () => {
  const [a] = interpretarXml(XML);
  assert.deepEqual(a.autores, ["Choi IJ", "Kook MC", "The HELPER Study Group"]);
});

test("um autor só (objeto, não array) não vira lista vazia", () => {
  const [, b] = interpretarXml(XML);
  assert.deepEqual(b.autores, ["Silva AB"]);
});

test("DOI é achado tanto em ELocationID quanto em ArticleIdList", () => {
  const [a, b] = interpretarXml(XML);
  assert.equal(a.doi, "10.1056/NEJMoa2020693");
  assert.equal(b.doi, "10.1590/exemplo");
});

test("ano sai do MedlineDate quando não existe <Year>", () => {
  const [, b] = interpretarXml(XML);
  assert.equal(b.ano, "1998");
});

test("acentos do português chegam decodificados", () => {
  const [, b] = interpretarXml(XML);
  assert.equal(b.titulo, "Dor torácica na emergência");
  assert.equal(b.revista, "Revista Brasileira de Cardiologia");
});

test("artigo sem resumo não quebra o parse — só vem com resumo vazio", () => {
  const [, , c] = interpretarXml(XML);
  assert.equal(c.resumo, "");
  assert.equal(c.titulo, "Editorial sem resumo");
  assert.deepEqual(c.tipos, ["Editorial"]);
});

test("PMID inválido não vira artigo fantasma", () => {
  assert.deepEqual(interpretarXml("<PubmedArticleSet></PubmedArticleSet>"), []);
});

test("filtros entram na expressão de busca, não no resultado", () => {
  const ano = new Date().getFullYear();
  const c = montarConsulta("chest pain", { ultimosAnos: 5, apenasRevisoes: true });
  assert.match(c, /^\(chest pain\)/);
  assert.match(c, /review\[pt\]/);
  assert.match(c, new RegExp(`"${ano - 5}"\\[dp\\] : "${ano + 1}"\\[dp\\]`));
});
