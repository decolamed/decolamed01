// O valor vem da URL de um link que qualquer pessoa pode editar antes de
// repassar. Ele vira o `href` de um botão que diz "Quero começar" — ou seja,
// o lugar exato onde um destino errado custa uma venda, e um destino externo
// vira redirecionamento aberto.

import test from "node:test";
import assert from "node:assert/strict";
import { planoDeOrigem, planoDoCaminho, linkDaDemonstracao, enderecoCurto } from "./plano-de-origem.ts";

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

// ═══════════════════════ O CAMINHO DE IDA E VOLTA ═══════════════════════════
// Validar o parâmetro isolado não basta: entre a página do plano e a
// demonstração o valor passa por encodeURIComponent e pela leitura do
// searchParams. É nessa ida e volta que o slug pode chegar deformado e o
// visitante terminar num plano que não é o dele.

/** O href ANTIGO, com query string — mantido para provar que ainda funciona. */
const linkAntigo = (slug) => `/demonstracao?voltar=${encodeURIComponent(`/inscricao/${slug}`)}`;

/** O que o Next entrega em searchParams.voltar. */
const comoChegaNoServidor = (href) => new URL(href, "https://exemplo.test").searchParams.get("voltar");

test("quem entra pelo plano A volta para o plano A", () => {
  assert.equal(planoDeOrigem(comoChegaNoServidor(linkAntigo("voo-guiado"))), "/inscricao/voo-guiado");
});

test("cada plano preserva a própria origem", () => {
  for (const slug of ["voo-guiado", "decolando-pro", "plano-teste-2", "a"]) {
    assert.equal(
      planoDeOrigem(comoChegaNoServidor(linkAntigo(slug))),
      `/inscricao/${slug}`,
      `o plano ${slug} não voltou para si mesmo`
    );
  }
});

test("link solto, sem origem, não inventa um plano", () => {
  assert.equal(planoDeOrigem(comoChegaNoServidor("/demonstracao")), null);
});

// ═══════════════════════════ O LINK CURTO ═══════════════════════════════════
// `/demonstracao?voltar=%2Finscricao%2Fvooguiado` diz a mesma coisa que
// `/demo/vooguiado` — com 43 caracteres a mais e três símbolos no meio.

test("o link que a página do plano monta é curto e legível", () => {
  assert.equal(linkDaDemonstracao("vooguiado"), "/demo/vooguiado");
  assert.equal(linkDaDemonstracao("decolando-pro"), "/demo/decolando-pro");
  assert.ok(!linkDaDemonstracao("vooguiado").includes("%"), "sem símbolo codificado");
  assert.ok(!linkDaDemonstracao("vooguiado").includes("?"), "sem query string");
});

test("slug estranho não vira link quebrado, vira o link sem plano", () => {
  for (const ruim of ["", "  ", "com/barra", "../fuga", "com espaço"]) {
    assert.equal(linkDaDemonstracao(ruim), "/demo", `aceitou ${JSON.stringify(ruim)}`);
  }
});

test("o caminho /demo/<slug> devolve a inscrição correspondente", () => {
  assert.equal(planoDoCaminho(["vooguiado"]), "/inscricao/vooguiado");
  assert.equal(planoDoCaminho(["decolando-pro"]), "/inscricao/decolando-pro");
});

test("/demo sozinho não tem plano de origem — e isso é esperado", () => {
  // É o link repassado no WhatsApp: usa o endereço de compra do painel.
  assert.equal(planoDoCaminho(undefined), null);
  assert.equal(planoDoCaminho([]), null);
});

test("caminho não vira porta de fuga", () => {
  for (const ruim of [[".."], ["..", "admin"], ["a", "b"], [""], ["  "], ["%2e%2e"]]) {
    assert.equal(planoDoCaminho(ruim), null, `aceitou ${JSON.stringify(ruim)}`);
  }
});

test("o endereço antigo é convertido para o novo", () => {
  // Links já enviados continuam funcionando, e quem clicar neles passa a ver
  // o endereço bonito na barra.
  assert.equal(enderecoCurto("/inscricao/vooguiado"), "/demo/vooguiado");
  assert.equal(enderecoCurto("/inscricao/decolando-pro"), "/demo/decolando-pro");
  assert.equal(enderecoCurto(null), "/demo");
  assert.equal(enderecoCurto("//outro.site"), "/demo", "origem inválida não vira caminho");
});

test("ida e volta: o link curto reconstrói a mesma origem do link antigo", () => {
  for (const slug of ["vooguiado", "decolando-pro", "a"]) {
    const curto = linkDaDemonstracao(slug);
    const segmentos = curto.replace("/demo/", "").split("/");
    assert.equal(planoDoCaminho(segmentos), `/inscricao/${slug}`, slug);
  }
});
