// O checkout respondia SEMPRE "Não foi possível gerar a cobrança no momento.
// Tente novamente em instantes." — inclusive quando o Asaas tinha explicado,
// em português, exatamente o que estava errado nos dados enviados.
//
// Para um valor abaixo do mínimo do Asaas, essa frase é falsa nos dois
// sentidos: não é momentâneo, e tentar de novo não resolve. O motivo real ia
// só para o `console.error`, e a retenção de log da Vercel neste plano é de
// cerca de uma hora — depois disso o pré-cadastro fica na tabela sem nenhuma
// pista do que aconteceu.
//
// Estes testes fixam a separação: 400 com explicação chega a quem está
// comprando; qualquer outra falha continua escondida atrás da mensagem
// genérica, porque aí o problema é nosso, não de quem digitou.

import test from "node:test";
import assert from "node:assert/strict";

// A chave precisa existir ANTES do import: o módulo lê process.env no topo.
process.env.ASAAS_API_KEY = "$aact_hmlg_chave_de_teste";
process.env.ASAAS_API_URL = "https://sandbox.asaas.com/api/v3";

const { createCharge, AsaasValidacaoError } = await import("./client.ts");

/** Faz o próximo fetch responder o que o teste mandar. */
function responderCom(status, corpo) {
  globalThis.fetch = async () =>
    new Response(typeof corpo === "string" ? corpo : JSON.stringify(corpo), {
      status,
      headers: { "Content-Type": "application/json" }
    });
}

const cobranca = { customer: "cus_1", billingType: "BOLETO", value: 1, dueDate: "2026-08-20" };

test("400 do Asaas vira erro de validação, com a explicação preservada", async () => {
  responderCom(400, {
    errors: [{ code: "invalid_value", description: "O valor mínimo para uma cobrança é R$ 5,00." }]
  });

  await assert.rejects(createCharge(cobranca), (e) => {
    assert.ok(e instanceof AsaasValidacaoError, `veio ${e.name}`);
    assert.equal(e.message, "O valor mínimo para uma cobrança é R$ 5,00.");
    assert.deepEqual(e.codigos, ["invalid_value"]);
    return true;
  });
});

test("vários erros de uma vez viram uma mensagem só", async () => {
  responderCom(400, {
    errors: [
      { code: "invalid_cpfCnpj", description: "CPF ou CNPJ inválido." },
      { code: "invalid_postalCode", description: "CEP não encontrado." }
    ]
  });

  await assert.rejects(createCharge(cobranca), (e) => {
    assert.equal(e.message, "CPF ou CNPJ inválido. CEP não encontrado.");
    assert.deepEqual(e.codigos, ["invalid_cpfCnpj", "invalid_postalCode"]);
    return true;
  });
});

test("401 NÃO é erro de validação — chave errada não é culpa de quem compra", async () => {
  responderCom(401, { errors: [{ code: "unauthorized", description: "Acesso não autorizado." }] });

  await assert.rejects(createCharge(cobranca), (e) => {
    assert.ok(!(e instanceof AsaasValidacaoError), "401 não pode virar mensagem para o comprador");
    assert.match(e.message, /401/);
    return true;
  });
});

test("500 continua sendo erro técnico", async () => {
  responderCom(500, "Internal Server Error");

  await assert.rejects(createCharge(cobranca), (e) => {
    assert.ok(!(e instanceof AsaasValidacaoError));
    assert.match(e.message, /500/);
    return true;
  });
});

test("400 com corpo que não é o JSON esperado não estoura o parser", async () => {
  // Se o formato mudar, o pior resultado aceitável é cair na mensagem
  // genérica — nunca uma exceção de JSON.parse escondendo o status HTTP.
  responderCom(400, "<html>Bad Request</html>");

  await assert.rejects(createCharge(cobranca), (e) => {
    assert.ok(!(e instanceof AsaasValidacaoError));
    assert.match(e.message, /400/);
    return true;
  });
});

test("400 sem nenhuma descrição preenchida cai no genérico", async () => {
  responderCom(400, { errors: [{ code: "unknown", description: "   " }] });

  await assert.rejects(createCharge(cobranca), (e) => {
    assert.ok(!(e instanceof AsaasValidacaoError), "descrição vazia não ajuda ninguém");
    return true;
  });
});

test("resposta boa continua passando", async () => {
  responderCom(200, { id: "pay_1", status: "PENDING", invoiceUrl: "https://x.test/i", billingType: "BOLETO" });
  const c = await createCharge(cobranca);
  assert.equal(c.id, "pay_1");
});
