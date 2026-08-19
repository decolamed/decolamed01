// O destino chega pela URL do link de e-mail (`?next=...`), então é entrada
// não confiável: sem restrição viraria redirecionamento aberto — bastaria
// enviar um link de recuperação apontando para outro domínio para levar
// alguém autenticado embora da plataforma.
//
// A regra é aplicada em dois ambientes diferentes (o route handler no
// servidor e a página /auth/finalizar no navegador), por isso mora num
// módulo só. Estes testes fixam o que passa e o que não passa.

import test from "node:test";
import assert from "node:assert/strict";
import { destinoDoLink, DESTINO_PADRAO } from "./destino-do-link.ts";

test("caminho interno normal passa", () => {
  assert.equal(destinoDoLink("/redefinir-senha"), "/redefinir-senha");
  assert.equal(destinoDoLink("/aluno"), "/aluno");
  assert.equal(destinoDoLink("/admin/usuarios"), "/admin/usuarios");
});

test("ausência de destino cai no padrão", () => {
  assert.equal(destinoDoLink(null), DESTINO_PADRAO);
  assert.equal(destinoDoLink(undefined), DESTINO_PADRAO);
  assert.equal(destinoDoLink(""), DESTINO_PADRAO);
  assert.equal(DESTINO_PADRAO, "/redefinir-senha");
});

test("URL absoluta não passa — seria redirecionamento aberto", () => {
  assert.equal(destinoDoLink("https://site-falso.test"), DESTINO_PADRAO);
  assert.equal(destinoDoLink("http://site-falso.test"), DESTINO_PADRAO);
});

test("barra dupla não passa: o navegador lê como domínio externo", () => {
  // "//site-falso.test" é URL protocolo-relativa. Parece caminho, não é.
  assert.equal(destinoDoLink("//site-falso.test"), DESTINO_PADRAO);
  assert.equal(destinoDoLink("//site-falso.test/aluno"), DESTINO_PADRAO);
});

test("barra invertida não passa: alguns navegadores a tratam como barra", () => {
  assert.equal(destinoDoLink("/\\site-falso.test"), DESTINO_PADRAO);
  assert.equal(destinoDoLink("\\\\site-falso.test"), DESTINO_PADRAO);
});

test("esquema embutido não passa", () => {
  assert.equal(destinoDoLink("/javascript:alert(1)"), DESTINO_PADRAO);
  assert.equal(destinoDoLink("javascript:alert(1)"), DESTINO_PADRAO);
  assert.equal(destinoDoLink("/user@site-falso.test"), DESTINO_PADRAO);
});

test("query e fragmento não passam — o destino é uma rota, não um endereço", () => {
  assert.equal(destinoDoLink("/aluno?x=1"), DESTINO_PADRAO);
  assert.equal(destinoDoLink("/aluno#topo"), DESTINO_PADRAO);
});

test("não começar com barra não passa", () => {
  assert.equal(destinoDoLink("aluno"), DESTINO_PADRAO);
  assert.equal(destinoDoLink("site-falso.test/aluno"), DESTINO_PADRAO);
});
