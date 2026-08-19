// Os casos que estes testes fixam não são hipotéticos: saíram dos logs de
// autenticação do projeto. `same_password` duas vezes seguidas com dez
// segundos de intervalo, e `over_email_send_rate_limit` com a mensagem
// "you can only request this after 40 seconds".

import test from "node:test";
import assert from "node:assert/strict";
import {
  mensagemAoSalvarSenha,
  mensagemAoPedirLink,
  segundosDeEspera,
  MENSAGEM_PADRAO_SALVAR,
  MENSAGEM_PADRAO_ENVIO
} from "./erro-de-senha.ts";

// ══════════════════════════════════════════════════ SENHA IGUAL À ANTERIOR ══

test("senha repetida diz para escolher outra, e não para pedir novo link", () => {
  const msg = mensagemAoSalvarSenha({ code: "same_password", status: 422 });
  assert.match(msg, /diferente/i);
  // O defeito original era justamente mandar refazer o fluxo do link.
  assert.doesNotMatch(msg, /link/i);
});

test("senha repetida é reconhecida também pelo texto, sem code", () => {
  const msg = mensagemAoSalvarSenha({
    message: "New password should be different from the old password."
  });
  assert.match(msg, /diferente/i);
});

// ═══════════════════════════════════════════════════════ LIMITE DE ENVIO ════

test("limite de envio informa quantos segundos esperar", () => {
  const erro = {
    code: "over_email_send_rate_limit",
    message: "For security purposes, you can only request this after 40 seconds."
  };
  assert.equal(segundosDeEspera(erro), 40);
  assert.match(mensagemAoPedirLink(erro), /40 segundos/);
  assert.match(mensagemAoSalvarSenha(erro), /40 segundos/);
});

test("limite sem número não inventa um", () => {
  const erro = { code: "over_email_send_rate_limit", message: "email rate limit exceeded" };
  assert.equal(segundosDeEspera(erro), null);
  const msg = mensagemAoPedirLink(erro);
  assert.match(msg, /aguarde/i);
  assert.doesNotMatch(msg, /\d+ segundos/);
});

test("o pedido de link avisa que o anterior continua valendo", () => {
  const msg = mensagemAoPedirLink({ code: "over_email_send_rate_limit" });
  assert.match(msg, /continua valendo/i);
});

// ═════════════════════════════════════════════════════════ OUTROS CASOS ═════

test("senha fraca explica o que fazer", () => {
  assert.match(mensagemAoSalvarSenha({ code: "weak_password" }), /simples|óbvia/i);
  assert.match(
    mensagemAoSalvarSenha({ message: "Password should be at least 8 characters" }),
    /simples|óbvia/i
  );
});

test("sessão perdida é o único caso que manda pedir outro link", () => {
  const msg = mensagemAoSalvarSenha({ code: "session_not_found" });
  assert.match(msg, /link/i);
});

// ══════════════════════════════════════════════════════════ FALLBACKS ═══════

test("erro desconhecido cai na mensagem padrão de cada tela", () => {
  assert.equal(mensagemAoSalvarSenha({ code: "algo_novo" }), MENSAGEM_PADRAO_SALVAR);
  assert.equal(mensagemAoPedirLink({ code: "algo_novo" }), MENSAGEM_PADRAO_ENVIO);
});

test("erro nulo ou vazio não quebra", () => {
  assert.equal(mensagemAoSalvarSenha(null), MENSAGEM_PADRAO_SALVAR);
  assert.equal(mensagemAoSalvarSenha(undefined), MENSAGEM_PADRAO_SALVAR);
  assert.equal(mensagemAoPedirLink({}), MENSAGEM_PADRAO_ENVIO);
  assert.equal(segundosDeEspera(null), null);
});

test("o pedido do link não confirma se a conta existe", () => {
  // Qualquer um digita qualquer e-mail nessa tela; dizer "não existe conta"
  // entregaria a informação a quem só chutou.
  const msg = mensagemAoPedirLink({ code: "user_not_found", message: "User not found" });
  assert.equal(msg, MENSAGEM_PADRAO_ENVIO);
  assert.doesNotMatch(msg, /não existe|não encontrad/i);
});
