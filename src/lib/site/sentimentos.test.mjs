// A autoavaliação do briefing precisa chegar ao servidor com o nome da
// matéria EXATO — acento incluído. Antes a matéria ia no nome do campo do
// FormData e as cinco acentuadas se perdiam pelo caminho; estes testes
// existem para isso não voltar.
//
// Os testes de ida e volta passam por `Request`/`formData()`, que é o
// codificador e o analisador multipart de verdade do runtime — não uma
// simulação.

import test from "node:test";
import assert from "node:assert/strict";
import { escreverSentimentos, lerSentimentos, SENTIMENTOS_VALIDOS } from "./sentimentos.ts";

/** As 9 matérias do conteúdo, com uma resposta diferente em cada. */
const BRIEFING_COMPLETO = {
  "Biologia": "Turbulência",
  "Espanhol": "Domínio",
  "Física": "Turbulência",
  "Geografia": "Domínio",
  "História": "Turbulência",
  "Inglês": "Atenção",
  "Linguagens": "Domínio",
  "Matemática": "Turbulência",
  "Química": "Atenção"
};

const ACENTUADAS = ["Física", "Inglês", "Química", "História", "Matemática"];
const SEM_ACENTO = ["Biologia", "Geografia", "Linguagens", "Espanhol"];

/** Ida e volta pelo multipart de verdade, como numa submissão do navegador. */
async function pelaRede(sentimentos) {
  const fd = new FormData();
  escreverSentimentos(fd, sentimentos);
  const recebido = await new Request("http://decola.test/briefing", { method: "POST", body: fd }).formData();
  return lerSentimentos(recebido);
}

// ------------------------------------------------------------------ BÁSICO --
test("ida e volta preserva as 9 matérias com respostas diferentes", async () => {
  const saida = await pelaRede(BRIEFING_COMPLETO);
  assert.deepEqual(saida, BRIEFING_COMPLETO);
  assert.equal(Object.keys(saida).length, 9);
});

test("cada matéria acentuada chega com a resposta que o aluno deu", async () => {
  const saida = await pelaRede(BRIEFING_COMPLETO);
  ACENTUADAS.forEach((m) => {
    assert.ok(m in saida, `"${m}" não chegou ao servidor`);
    assert.equal(saida[m], BRIEFING_COMPLETO[m], `"${m}" chegou com a resposta errada`);
  });
});

test("matérias sem acento continuam funcionando", async () => {
  const saida = await pelaRede(BRIEFING_COMPLETO);
  SEM_ACENTO.forEach((m) => assert.equal(saida[m], BRIEFING_COMPLETO[m]));
});

// ----------------------------------------------------- O NOME É O DO BANCO --
test('"Física" nunca vira "Fisica" — o acento faz parte do nome', async () => {
  const saida = await pelaRede({ "Física": "Turbulência" });
  assert.ok("Física" in saida);
  assert.ok(!("Fisica" in saida));
  assert.notDeepEqual(Object.keys(saida), ["Fisica"]);
});

test('"Inglês" nunca vira "Ingles"', async () => {
  const saida = await pelaRede({ "Inglês": "Domínio" });
  assert.ok("Inglês" in saida);
  assert.ok(!("Ingles" in saida));
});

test("Inglês e Espanhol são matérias distintas e não se sobrepõem", async () => {
  const saida = await pelaRede({ "Inglês": "Domínio", "Espanhol": "Turbulência" });
  assert.equal(saida["Inglês"], "Domínio");
  assert.equal(saida["Espanhol"], "Turbulência");
});

// ------------------------------------------------- QUALQUER NOME DE MATÉRIA --
test("vale para qualquer caractere, não só para as cinco conhecidas", async () => {
  // Nada aqui é uma matéria real: é o ponto. A regra não pode conhecer nomes.
  const exoticas = {
    "Educação Física": "Domínio",
    "Ciências da Natureza": "Atenção",
    "Français": "Turbulência",
    "Física Quântica · Aprofundamento": "Atenção",
    "MATEMÁTICA": "Domínio",
    "Ação & Reação (I)": "Turbulência",
    "Español — Avanzado": "Atenção"
  };
  assert.deepEqual(await pelaRede(exoticas), exoticas);
});

test("maiúscula e minúscula são nomes diferentes e ambos sobrevivem", async () => {
  const saida = await pelaRede({ "Física": "Domínio", "física": "Turbulência" });
  assert.equal(saida["Física"], "Domínio");
  assert.equal(saida["física"], "Turbulência");
});

// ----------------------------------------------------------------- LIMPEZA --
test("sentimento inválido é descartado, não gravado", async () => {
  const saida = await pelaRede({ "Física": "Pânico", "Biologia": "Domínio" });
  assert.deepEqual(saida, { "Biologia": "Domínio" });
});

test("matéria em branco não vira chave vazia", async () => {
  assert.deepEqual(await pelaRede({ "   ": "Domínio" }), {});
});

test("os três sentimentos válidos são exatamente os que a tela oferece", () => {
  assert.deepEqual([...SENTIMENTOS_VALIDOS].sort(), ["Atenção", "Domínio", "Turbulência"]);
});

// ------------------------------------------------------- FORMATO ANTERIOR --
test("uma aba aberta antes da correção ainda é lida", () => {
  // Formato antigo: a matéria no NOME do campo. Continua sendo entendido na
  // leitura para ninguém perder o briefing durante a virada.
  const fd = new FormData();
  fd.set("sentimento_Biologia", "Turbulência");
  fd.set("sentimento_Geografia", "Domínio");
  assert.deepEqual(lerSentimentos(fd), { "Biologia": "Turbulência", "Geografia": "Domínio" });
});

test("o formato novo tem precedência sobre o antigo", () => {
  const fd = new FormData();
  fd.set("sentimento_Biologia", "Atenção");
  escreverSentimentos(fd, { "Biologia": "Turbulência" });
  assert.deepEqual(lerSentimentos(fd), { "Biologia": "Turbulência" });
});

test("sem nenhum campo de sentimento, devolve vazio", () => {
  const fd = new FormData();
  fd.set("data_prova", "2026-10-31");
  assert.deepEqual(lerSentimentos(fd), {});
});

// ---------------------------------------------------- CHEGA ATÉ O COPILOTO --
test("o Copiloto encontra o sentimento pelo nome que veio do conteúdo", async () => {
  // O motor lê `sentimentos[matéria]` usando o nome que vem do banco de
  // questões. Se a chave gravada não for idêntica a esse nome, a resposta é
  // descartada em silêncio e a matéria vira "Atenção" — era o defeito.
  const gravado = await pelaRede(BRIEFING_COMPLETO);
  const materiasDoConteudo = Object.keys(BRIEFING_COMPLETO);
  materiasDoConteudo.forEach((m) => {
    const sentimento = gravado[m] ?? "Atenção";
    assert.equal(sentimento, BRIEFING_COMPLETO[m], `o Copiloto leria "${m}" como ${sentimento}`);
  });
  // E nenhuma matéria caiu no padrão por acidente.
  const viraramPadrao = materiasDoConteudo.filter((m) => !(m in gravado));
  assert.deepEqual(viraramPadrao, []);
});
