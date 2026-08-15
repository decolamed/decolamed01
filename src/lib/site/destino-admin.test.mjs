// A ação de enviar acesso passou a aceitar "para onde voltar" vindo do
// formulário, para o administrador não ser jogado para fora da página do
// aluno no meio da entrega do acesso.
//
// Um destino que vem do formulário é entrada não confiável: sem restrição,
// viraria redirecionamento aberto (o admin clica em "Enviar acesso" e vai
// parar em outro site). Estes testes fixam a regra que a ação aplica —
// `destinoDeRetorno` em admin/usuarios/actions.ts.

import test from "node:test";
import assert from "node:assert/strict";

const PATH = "/admin/usuarios";

/** Cópia exata da regra usada na server action. */
function destinoDeRetorno(pedido) {
  return /^\/admin\/usuarios(\/[0-9a-f-]{36})?$/i.test(String(pedido ?? "")) ? pedido : PATH;
}

const ID = "6fa84225-1111-2222-3333-444455556666";

test("volta para a página do aluno quando o id é um UUID", () => {
  assert.equal(destinoDeRetorno(`/admin/usuarios/${ID}`), `/admin/usuarios/${ID}`);
  assert.equal(destinoDeRetorno(`/admin/usuarios/${ID.toUpperCase()}`), `/admin/usuarios/${ID.toUpperCase()}`);
});

test("volta para a lista quando o formulário não diz nada", () => {
  assert.equal(destinoDeRetorno(undefined), PATH);
  assert.equal(destinoDeRetorno(""), PATH);
  assert.equal(destinoDeRetorno("/admin/usuarios"), "/admin/usuarios");
});

test("endereço externo é recusado — nada de redirecionamento aberto", () => {
  ["https://exemplo.test", "//exemplo.test", "http://admin/usuarios", "javascript:alert(1)"].forEach((mau) => {
    assert.equal(destinoDeRetorno(mau), PATH, `${mau} não podia passar`);
  });
});

test("outros caminhos do painel são recusados", () => {
  // A ação envia e-mail de acesso; ela não tem por que devolver o admin a
  // uma tela que não seja a de usuários.
  ["/admin/configuracoes", "/admin/usuarios/../vendas", "/aluno"].forEach((outro) => {
    assert.equal(destinoDeRetorno(outro), PATH, `${outro} não podia passar`);
  });
});

test("id malformado cai na lista em vez de virar URL quebrada", () => {
  assert.equal(destinoDeRetorno("/admin/usuarios/123"), PATH);
  assert.equal(destinoDeRetorno("/admin/usuarios/" + ID + "/extra"), PATH);
});
