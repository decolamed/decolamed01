// O valor vem da URL de um link que qualquer pessoa pode editar antes de
// repassar. Ele vira o `href` de um botão que diz "Quero começar" — ou seja,
// o lugar exato onde um destino errado custa uma venda, e um destino externo
// vira redirecionamento aberto.

import test from "node:test";
import assert from "node:assert/strict";
import { planoDeOrigem } from "./plano-de-origem.ts";

test("o caminho legítimo de uma inscrição passa", () => {
  assert.equal(planoDeOrigem("/inscricao/voo-guiado"), "/inscricao/voo-guiado");
  assert.equal(planoDeOrigem("/inscricao/plano2"), "/inscricao/plano2");
  assert.equal(planoDeOrigem("/inscricao/a"), "/inscricao/a");
});

test("sem plano de origem devolve null — é o link solto do WhatsApp", () => {
  for (const vazio of [null, undefined, "", "   "]) {
    assert.equal(planoDeOrigem(vazio), null);
  }
});

test("endereço externo não vira destino", () => {
  // O caso que importa: um link de demonstração repassado com o `voltar`
  // trocado levaria o visitante para fora, ainda parecendo a Decola MED.
  for (const externo of [
    "https://outro-site.com",
    "//outro-site.com",
    "http://outro-site.com/inscricao/voo-guiado",
    "/\\outro-site.com",
    "javascript:alert(1)"
  ]) {
    assert.equal(planoDeOrigem(externo), null, `aceitou ${externo}`);
  }
});

test("outras rotas internas não passam", () => {
  // A demonstração devolve para a COMPRA. Qualquer outro destino interno,
  // por mais inofensivo que pareça, não é o que o botão promete.
  for (const rota of ["/admin", "/admin/usuarios", "/aluno", "/login", "/redefinir-senha", "/"]) {
    assert.equal(planoDeOrigem(rota), null, `aceitou ${rota}`);
  }
});

test("inscrição malformada não passa", () => {
  for (const ruim of [
    "/inscricao",
    "/inscricao/",
    "/inscricao/voo/guiado",
    "/inscricao/voo-guiado/extra",
    "/inscricao/-comeca-com-hifen",
    "/inscricao/termina-com-hifen-",
    "/inscricao/voo guiado",
    "/inscricao/voo-guiado?x=1",
    "/inscricao/voo-guiado#frag"
  ]) {
    assert.equal(planoDeOrigem(ruim), null, `aceitou ${ruim}`);
  }
});

test("o fallback NÃO é a tela de redefinir senha", () => {
  // Reusar `destinoDoLink` aqui mandaria o visitante para /redefinir-senha
  // quando o parâmetro viesse torto. Este teste existe para isso não voltar.
  assert.equal(planoDeOrigem("qualquer coisa"), null);
  assert.notEqual(planoDeOrigem("qualquer coisa"), "/redefinir-senha");
});
