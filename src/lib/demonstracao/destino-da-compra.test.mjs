// O link vem de um campo de texto do painel e vai direto para um `href` que
// todo visitante da demonstração pode clicar. Estes testes cobrem as três
// coisas que podem dar errado: mandar a pessoa para o plano errado, aceitar
// um endereço que executa código, e prometer compra levando a um formulário.

import test from "node:test";
import assert from "node:assert/strict";
import { linkDeCompraValido, destinoDaCompra, levaAComprar } from "./destino-da-compra.ts";

/**
 * O último recurso agora é o WHATSAPP, e ele chega como parâmetro.
 *
 * Era a constante "/contato" — uma página descontinuada que só faz redirect
 * para o LOGIN. Quem clicava querendo falar com alguém para comprar caía numa
 * tela de acesso de uma conta que ainda não tinha.
 */
const ZAP = "https://wa.me/5587999999999";

// ═══════════════════════════ A PRECEDÊNCIA ══════════════════════════════════
test("o plano de origem vence o link configurado", () => {
  // Quem clicou em "Ver demonstração" na página do VOO GUIADO volta para o
  // VOO GUIADO, mesmo com outro link salvo no painel. Mandar essa pessoa para
  // um destino genérico seria perder a venda já encaminhada.
  assert.equal(
    destinoDaCompra("/inscricao/voo-guiado", "https://outro.site/checkout", ZAP),
    "/inscricao/voo-guiado"
  );
});

test("sem plano de origem, vale o link do painel", () => {
  // O caso do link repassado no WhatsApp.
  assert.equal(destinoDaCompra(null, "https://decolamed.online/checkout", ZAP), "https://decolamed.online/checkout");
});

test("sem origem e sem link, sobra o WhatsApp", () => {
  assert.equal(destinoDaCompra(null, null, ZAP), ZAP);
  assert.equal(destinoDaCompra(null, "", ZAP), ZAP);
  assert.equal(destinoDaCompra(null, "   ", ZAP), ZAP);
});

test("link inválido no painel não vira destino", () => {
  // Cair no WhatsApp é melhor do que um botão que não abre nada — e muito
  // melhor do que a tela de login, que era onde /contato terminava.
  assert.equal(destinoDaCompra(null, "javascript:alert(1)", ZAP), ZAP);
});

test("o último recurso nunca é uma tela interna que exige conta", () => {
  // A regressão que este arquivo existe para impedir: o visitante da
  // demonstração NÃO tem login, então o fim de linha não pode ser uma rota
  // da plataforma.
  const destino = destinoDaCompra(null, null, ZAP);
  assert.ok(destino.startsWith("https://"), "o fim de linha tem de ser um endereço externo");
  assert.doesNotMatch(destino, /^\/(contato|login)/);
});

// ═══════════════════════ O QUE O PAINEL ACEITA ══════════════════════════════
test("endereço completo passa", () => {
  assert.equal(linkDeCompraValido("https://decolamed.online/inscricao/voo-guiado"), "https://decolamed.online/inscricao/voo-guiado");
  assert.equal(linkDeCompraValido("http://exemplo.com/x"), "http://exemplo.com/x");
});

test("caminho interno passa — é o que o admin vai colar na maioria das vezes", () => {
  assert.equal(linkDeCompraValido("/inscricao/voo-guiado"), "/inscricao/voo-guiado");
  assert.equal(linkDeCompraValido("/planos"), "/planos");
});

test("endereço sem protocolo ganha https", () => {
  // "decolamed.online/planos" é o que uma pessoa escreve naturalmente. Sem
  // completar o protocolo isso viraria caminho relativo dentro do site.
  assert.equal(linkDeCompraValido("decolamed.online/planos"), "https://decolamed.online/planos");
  assert.equal(linkDeCompraValido("pay.hotmart.com/abc"), "https://pay.hotmart.com/abc");
});

test("espaços em volta não atrapalham", () => {
  assert.equal(linkDeCompraValido("  /inscricao/voo-guiado  "), "/inscricao/voo-guiado");
});

// ═══════════════════════ O QUE O PAINEL RECUSA ══════════════════════════════
test("esquemas que executam código são recusados", () => {
  // O motivo de existir validação aqui: este campo é texto livre do painel e
  // vai para um href clicado por qualquer visitante.
  for (const perigoso of [
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd"
  ]) {
    assert.equal(linkDeCompraValido(perigoso), null, `aceitou ${perigoso}`);
  }
});

test("barra dupla é endereço externo disfarçado de caminho", () => {
  // `//outro.site` parece caminho relativo, mas o navegador abre outro
  // domínio — é o truque clássico de redirecionamento aberto.
  assert.equal(linkDeCompraValido("//outro.site/golpe"), null);
  assert.equal(linkDeCompraValido("/\\outro.site"), null);
});

test("texto que não é endereço nenhum é recusado", () => {
  for (const lixo of ["", "   ", null, undefined, "link de compra", "coloque aqui", "abc"]) {
    assert.equal(linkDeCompraValido(lixo), null, `aceitou ${JSON.stringify(lixo)}`);
  }
});

// ═══════════════════════════ O TEXTO DO BOTÃO ═══════════════════════════════
test("o texto só promete compra quando há para onde comprar", () => {
  assert.equal(levaAComprar("/inscricao/voo-guiado", null), true);
  assert.equal(levaAComprar(null, "https://decolamed.online/checkout"), true);
  assert.equal(levaAComprar(null, null), false);
  assert.equal(levaAComprar(null, "javascript:alert(1)"), false, "link recusado não promete compra");
});
