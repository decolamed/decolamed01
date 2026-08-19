// A ação de enviar acesso aceita "para onde voltar" vindo do formulário, para
// o administrador não ser jogado para fora da página do aluno no meio da
// entrega do acesso.
//
// Um destino que vem do formulário é entrada não confiável: sem restrição,
// viraria redirecionamento aberto (o admin clica em "Enviar acesso" e vai
// parar em outro site).
//
// Estes testes IMPORTAM a regra de verdade. A versão anterior deste arquivo
// mantinha uma cópia dela, porque a função morava dentro da server action —
// e uma cópia significa que mudar a regra na action deixaria os testes
// passando sozinhos, com a proteção já sem cobertura nenhuma.

import test from "node:test";
import assert from "node:assert/strict";
import { destinoDoAdmin, DESTINO_PADRAO_ADMIN as PATH } from "./destino-do-admin.ts";

const ID = "6fa84225-1111-2222-3333-444455556666";

test("volta para a página do aluno quando o id é um UUID", () => {
  assert.equal(destinoDoAdmin(`/admin/usuarios/${ID}`), `/admin/usuarios/${ID}`);
  assert.equal(destinoDoAdmin(`/admin/usuarios/${ID.toUpperCase()}`), `/admin/usuarios/${ID.toUpperCase()}`);
});

test("volta para a lista quando o formulário não diz nada", () => {
  assert.equal(destinoDoAdmin(undefined), PATH);
  assert.equal(destinoDoAdmin(null), PATH);
  assert.equal(destinoDoAdmin(""), PATH);
  assert.equal(destinoDoAdmin("/admin/usuarios"), "/admin/usuarios");
});

test("endereço externo é recusado — nada de redirecionamento aberto", () => {
  ["https://exemplo.test", "//exemplo.test", "http://admin/usuarios", "javascript:alert(1)"].forEach((mau) => {
    assert.equal(destinoDoAdmin(mau), PATH, `${mau} não podia passar`);
  });
});

test("outros caminhos do painel são recusados", () => {
  // A ação envia e-mail de acesso; ela não tem por que devolver o admin a
  // uma tela que não seja a de usuários.
  ["/admin/configuracoes", "/admin/usuarios/../vendas", "/aluno"].forEach((outro) => {
    assert.equal(destinoDoAdmin(outro), PATH, `${outro} não podia passar`);
  });
});

test("id malformado cai na lista em vez de virar URL quebrada", () => {
  assert.equal(destinoDoAdmin("/admin/usuarios/123"), PATH);
  assert.equal(destinoDoAdmin("/admin/usuarios/" + ID + "/extra"), PATH);
});

test("o padrão é a lista de usuários", () => {
  // Fixa a constante para que trocá-la sem querer não passe despercebido.
  assert.equal(PATH, "/admin/usuarios");
});
