import test from "node:test";
import assert from "node:assert/strict";
import { lerComissaoDeRedacao, erroDeComissaoDeRedacao, centavosDigitados } from "./comissao-redacao.ts";

/** Um FormData de mentira, com só o que o módulo usa. */
function form(campos) {
  return { get: (nome) => (nome in campos ? campos[nome] : null) };
}

const PROFESSORA = "34461046-d272-463a-872c-a4d709f661a9";

// ══════════════════════════════════════════ O QUE FICA GRAVADO ══════════════

test("valor e professora preenchidos viram as duas colunas", () => {
  const campos = lerComissaoDeRedacao(form({ comissao_redacao: "80", professor_id: PROFESSORA }));
  assert.deepEqual(campos, { comissao_redacao_centavos: 8000, professor_id: PROFESSORA });
});

test("valor com centavos é lido com vírgula ou ponto", () => {
  assert.equal(lerComissaoDeRedacao(form({ comissao_redacao: "80,50", professor_id: PROFESSORA })).comissao_redacao_centavos, 8050);
  assert.equal(lerComissaoDeRedacao(form({ comissao_redacao: "80.50", professor_id: PROFESSORA })).comissao_redacao_centavos, 8050);
});

test("sem professora, o valor é zerado junto", () => {
  // Guardar R$ 80,00 num plano sem a quem pagar deixaria uma comissão
  // configurada que nunca vira dívida — e que reapareceria no dia em que
  // alguém designasse a professora.
  const campos = lerComissaoDeRedacao(form({ comissao_redacao: "80", professor_id: "" }));
  assert.deepEqual(campos, { comissao_redacao_centavos: 0, professor_id: null });
});

test("plano sem comissão nenhuma continua sem comissão nenhuma", () => {
  assert.deepEqual(lerComissaoDeRedacao(form({})), { comissao_redacao_centavos: 0, professor_id: null });
});

test("professora escolhida sem valor não gera dívida", () => {
  const campos = lerComissaoDeRedacao(form({ comissao_redacao: "", professor_id: PROFESSORA }));
  assert.equal(campos.comissao_redacao_centavos, 0);
});

// ═══════════════════════════════════════════════ O QUE É RECUSADO ══════════

test("valor preenchido sem professora é recusado, não zerado em silêncio", () => {
  const erro = erroDeComissaoDeRedacao(form({ comissao_redacao: "80", professor_id: "" }));
  assert.match(erro ?? "", /professora/i);
});

test("valor negativo ou não numérico é recusado", () => {
  for (const invalido of ["-10", "oitenta", "R$ 80"]) {
    assert.ok(erroDeComissaoDeRedacao(form({ comissao_redacao: invalido, professor_id: PROFESSORA })), `"${invalido}" devia ser recusado`);
  }
});

test("configuração válida não reclama", () => {
  assert.equal(erroDeComissaoDeRedacao(form({ comissao_redacao: "80", professor_id: PROFESSORA })), null);
  assert.equal(erroDeComissaoDeRedacao(form({ comissao_redacao: "0", professor_id: "" })), null);
  assert.equal(erroDeComissaoDeRedacao(form({})), null);
});

// ═════════════════════════════════════════ CENTAVOS, SEM PONTO FLUTUANTE ════

test("reais viram centavos inteiros", () => {
  assert.equal(centavosDigitados("80"), 8000);
  assert.equal(centavosDigitados("0.1"), 10);
  assert.equal(centavosDigitados("0"), 0);
  assert.equal(centavosDigitados(""), 0);
  assert.equal(centavosDigitados(null), 0);
  assert.equal(centavosDigitados("-1"), null);
  assert.equal(centavosDigitados("abc"), null);
});
