// Criar e editar planos "pararam de funcionar do nada": o plano novo não
// aparecia na lista e a edição não salvava.
//
// A gravação falhava de verdade — UNIQUE(slug) recusando um endereço
// repetido, 409 nos logs do Supabase. O que faltava era o admin conseguir
// perceber isso: o aviso saía sem cor (bg-red-50/text-red-600 não existem
// neste tema) e não dizia qual plano já usava o slug.
//
// Estes testes fixam a parte que decide O QUE dizer.

import test from "node:test";
import assert from "node:assert/strict";
import { ehSlugDuplicado, mensagemDeSlugDuplicado, CODIGO_UNICIDADE } from "./erro-de-plano.ts";

// ═══════════════════════════════ RECONHECER ═════════════════════════════════
test("o código do Postgres é o que vale", () => {
  assert.equal(CODIGO_UNICIDADE, "23505");
  assert.ok(ehSlugDuplicado({ code: "23505", message: "seja lá o que for" }));
});

test("o código vence mesmo com a mensagem em outro idioma", () => {
  // A checagem antiga era `message.includes("duplicate")` — dependia de o
  // servidor responder em inglês. Um Postgres em pt-BR passaria batido, e o
  // admin veria "Não foi possível criar o plano." sem saber o motivo.
  assert.ok(ehSlugDuplicado({ code: "23505", message: "valor duplicado viola a restrição de unicidade" }));
});

test("sem código, o texto ainda salva o diagnóstico", () => {
  assert.ok(ehSlugDuplicado({ message: 'duplicate key value violates unique constraint "planos_slug_key"' }));
  assert.ok(ehSlugDuplicado({ message: "Key (slug)=(decolando) already exists." }));
});

test("outros erros não viram conflito de slug", () => {
  assert.equal(ehSlugDuplicado({ code: "23514", message: "check constraint violated" }), false);
  assert.equal(ehSlugDuplicado({ code: "23503", message: "foreign key violation" }), false);
  assert.equal(ehSlugDuplicado({ code: "42501", message: "permission denied" }), false);
});

test("ausência de erro não é conflito", () => {
  assert.equal(ehSlugDuplicado(null), false);
  assert.equal(ehSlugDuplicado(undefined), false);
  assert.equal(ehSlugDuplicado({}), false);
});

// ═══════════════════════════════ EXPLICAR ═══════════════════════════════════
test("quando sabemos de quem é o slug, o nome entra na mensagem", () => {
  const m = mensagemDeSlugDuplicado("decolando", "DECOLANDO PRO");
  assert.match(m, /decolando/);
  assert.match(m, /DECOLANDO PRO/);
});

test("sem saber o dono, a mensagem ainda diz qual slug conflitou", () => {
  const m = mensagemDeSlugDuplicado("decolando", null);
  assert.match(m, /decolando/);
  // Não pode inventar um nome nem deixar um espaço vazio no meio da frase.
  assert.doesNotMatch(m, /""|undefined|null/);
});

test("nome só com espaço é tratado como ausente", () => {
  assert.equal(mensagemDeSlugDuplicado("x", "   "), mensagemDeSlugDuplicado("x", null));
});

test("a mensagem diz o que fazer, não só o que houve", () => {
  for (const dono of ["DECOLANDO PRO", null]) {
    assert.match(mensagemDeSlugDuplicado("decolando", dono), /escolha outro/i);
  }
});
