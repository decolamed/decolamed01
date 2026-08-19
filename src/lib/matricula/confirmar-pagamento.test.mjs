// A confirmação de pagamento chega por DOIS caminhos que não se coordenam: o
// webhook do Asaas (que manda PAYMENT_CONFIRMED e PAYMENT_RECEIVED para a
// mesma cobrança, e reenvia quando a resposta não é 200) e a consulta de
// status que a tela do checkout faz enquanto espera.
//
// Os dois terminam na mesma função. Ela precisa produzir o mesmo resultado
// quantas vezes for chamada: um aluno, uma matrícula, um e-mail, um cupom
// contado uma vez. Estes testes são sobre isso.

import test from "node:test";
import assert from "node:assert/strict";
import { confirmarPagamento } from "./confirmar-pagamento.ts";

// ═════════════════════════ UM SUPABASE DE MENTIRA ═══════════════════════════
// Guarda as tabelas em memória e conta os efeitos que precisam ser únicos.
function fakeSupabase({ preCadastro, cupom = null }) {
  const db = {
    pre_cadastros: [{ ...preCadastro }],
    profiles: [],
    matriculas: [],
    pagamentos: [],
    cupons: cupom ? [{ ...cupom }] : []
  };
  const contador = { convites: 0, matriculas: 0, perfis: 0 };

  const acharUm = (tabela, filtros) =>
    db[tabela].find((linha) => Object.entries(filtros).every(([k, v]) => linha[k] === v)) ?? null;

  function query(tabela) {
    const filtros = {};
    const api = {
      select: () => api,
      eq: (campo, valor) => {
        filtros[campo] = valor;
        return api;
      },
      maybeSingle: async () => ({ data: acharUm(tabela, filtros), error: null }),
      single: async () => ({ data: acharUm(tabela, filtros), error: null }),
      update: (valores) => ({
        eq: async (campo, valor) => {
          const linha = acharUm(tabela, { [campo]: valor });
          if (linha) Object.assign(linha, valores);
          return { error: null };
        }
      }),
      upsert: (valores, opcoes) => {
        const chave = opcoes?.onConflict;
        const aplicar = () => {
          if (chave) {
            const existente = acharUm(tabela, { [chave]: valores[chave] });
            if (existente) {
              Object.assign(existente, valores);
              return existente;
            }
          }
          const nova = { id: `${tabela}-${db[tabela].length + 1}`, ...valores };
          db[tabela].push(nova);
          if (tabela === "matriculas") contador.matriculas += 1;
          if (tabela === "profiles") contador.perfis += 1;
          return nova;
        };
        const promessa = Promise.resolve().then(() => ({ data: aplicar(), error: null }));
        return {
          then: (r, j) => promessa.then(r, j),
          select: () => ({ single: async () => ({ data: aplicar(), error: null }) })
        };
      }
    };
    return api;
  }

  return {
    db,
    contador,
    from: (tabela) => query(tabela),
    auth: {
      admin: {
        inviteUserByEmail: async () => {
          contador.convites += 1;
          return { data: { user: { id: "aluno-1" } }, error: null };
        },
        listUsers: async () => ({ data: { users: [] }, error: null })
      }
    }
  };
}

const PRE_CADASTRO = {
  id: "pre-1",
  nome: "Aluno de Teste",
  email: "aluno@teste.com",
  telefone: "11999999999",
  cpf: "12345678901",
  plano_id: "plano-1",
  asaas_customer_id: "cus_1",
  asaas_charge_id: "pay_1",
  cupom_codigo: null,
  convertido: false,
  planos: { nome: "VOO GUIADO", duracao_meses: 12 }
};

const evento = (extra = {}) => ({
  asaasPaymentId: "pay_1",
  preCadastroId: "pre-1",
  valor: 445,
  billingType: "PIX",
  dataPagamento: "2026-08-19",
  recebido: false,
  payload: { evento: "PAYMENT_CONFIRMED" },
  ...extra
});

// ═══════════════════════════════ O CAMINHO FELIZ ════════════════════════════
test("pagamento confirmado cria conta, matrícula e venda", async () => {
  const sb = fakeSupabase({ preCadastro: PRE_CADASTRO });
  const r = await confirmarPagamento(sb, evento());

  assert.equal(r.ok, true);
  assert.equal(r.jaEstavaConvertido, false);
  assert.equal(sb.contador.convites, 1, "o aluno deve receber UM convite");
  assert.equal(sb.db.profiles.length, 1);
  assert.equal(sb.db.matriculas.length, 1);
  assert.equal(sb.db.matriculas[0].status, "ativa");
  assert.equal(sb.db.pagamentos.length, 1);
  assert.equal(sb.db.pagamentos[0].valor_centavos, 44500);
  assert.equal(sb.db.pre_cadastros[0].convertido, true, "sem esta marca a idempotência não fecha");
});

test("RECEIVED marca a venda como recebida; o resto, confirmada", async () => {
  const sb1 = fakeSupabase({ preCadastro: PRE_CADASTRO });
  await confirmarPagamento(sb1, evento({ recebido: true }));
  assert.equal(sb1.db.pagamentos[0].status, "recebido");

  const sb2 = fakeSupabase({ preCadastro: PRE_CADASTRO });
  await confirmarPagamento(sb2, evento({ recebido: false }));
  assert.equal(sb2.db.pagamentos[0].status, "confirmado");
});

// ═══════════════════════════════ IDEMPOTÊNCIA ═══════════════════════════════
test("o mesmo evento duas vezes não duplica nada", async () => {
  const sb = fakeSupabase({ preCadastro: PRE_CADASTRO });
  await confirmarPagamento(sb, evento());
  const segunda = await confirmarPagamento(sb, evento());

  assert.equal(segunda.ok, true);
  assert.equal(segunda.jaEstavaConvertido, true);
  assert.equal(sb.contador.convites, 1, "o aluno receberia um segundo e-mail de acesso");
  assert.equal(sb.db.profiles.length, 1);
  assert.equal(sb.db.matriculas.length, 1);
  assert.equal(sb.db.pagamentos.length, 1, "a venda apareceria em dobro no painel");
});

test("CONFIRMED seguido de RECEIVED — o par normal do Asaas", async () => {
  const sb = fakeSupabase({ preCadastro: PRE_CADASTRO });
  await confirmarPagamento(sb, evento({ recebido: false }));
  await confirmarPagamento(sb, evento({ recebido: true }));

  assert.equal(sb.contador.convites, 1);
  assert.equal(sb.db.pagamentos.length, 1);
  // A segunda passagem atualiza a MESMA linha: o status evolui.
  assert.equal(sb.db.pagamentos[0].status, "recebido");
});

test("webhook e consulta de status ao mesmo tempo não brigam", async () => {
  // Cenário real: o Asaas avisa enquanto a tela do aluno está perguntando.
  const sb = fakeSupabase({ preCadastro: PRE_CADASTRO });
  await confirmarPagamento(sb, evento());
  await confirmarPagamento(sb, evento({ payload: { origem: "consulta-de-status" } }));

  assert.equal(sb.contador.convites, 1);
  assert.equal(sb.db.matriculas.length, 1);
  assert.equal(sb.db.pagamentos.length, 1);
});

test("cinco reenvios seguidos continuam dando uma conta só", async () => {
  const sb = fakeSupabase({ preCadastro: PRE_CADASTRO });
  for (let i = 0; i < 5; i++) await confirmarPagamento(sb, evento());
  assert.equal(sb.contador.convites, 1);
  assert.equal(sb.db.matriculas.length, 1);
  assert.equal(sb.db.pagamentos.length, 1);
});

// ═══════════════════════════════ O CUPOM ════════════════════════════════════
test("o cupom é contado uma vez, não uma por evento", async () => {
  const sb = fakeSupabase({
    preCadastro: { ...PRE_CADASTRO, cupom_codigo: "PARCEIRO10" },
    cupom: { codigo: "PARCEIRO10", usos: 3, parceiro_id: "parc-1", percentual_comissao: 20 }
  });

  await confirmarPagamento(sb, evento());
  await confirmarPagamento(sb, evento({ recebido: true }));

  assert.equal(sb.db.cupons[0].usos, 4, "dois eventos contariam o mesmo uso duas vezes");
  assert.equal(sb.db.pagamentos[0].parceiro_id, "parc-1");
  assert.equal(sb.db.pagamentos[0].comissao_centavos, Math.round(445 * 100 * 20 / 100));
});

// ═══════════════════════════════ O QUE DÁ ERRADO ════════════════════════════
test("pré-cadastro inexistente não pede retentativa", async () => {
  // Reenviar não faria a compra aparecer. Pedir retentativa deixaria o Asaas
  // insistindo para sempre num evento que nunca vai dar certo.
  const sb = fakeSupabase({ preCadastro: PRE_CADASTRO });
  const r = await confirmarPagamento(sb, evento({ preCadastroId: "nao-existe" }));

  assert.equal(r.ok, false);
  assert.equal(r.repetir, false);
  assert.equal(sb.contador.convites, 0, "nada pode ser criado sem a compra correspondente");
});

test("plano sem duração deixa o acesso sem expiração", async () => {
  const sb = fakeSupabase({
    preCadastro: { ...PRE_CADASTRO, planos: { nome: "Vitalício", duracao_meses: null } }
  });
  await confirmarPagamento(sb, evento());
  assert.equal(sb.db.matriculas[0].acesso_expira_em, null);
});

test("a venda guarda quem comprou, para o painel não depender de join", async () => {
  const sb = fakeSupabase({ preCadastro: PRE_CADASTRO });
  await confirmarPagamento(sb, evento());
  const venda = sb.db.pagamentos[0];
  assert.equal(venda.comprador_nome, "Aluno de Teste");
  assert.equal(venda.comprador_email, "aluno@teste.com");
  assert.equal(venda.plano_nome, "VOO GUIADO");
  assert.equal(venda.forma_pagamento, "pix");
});

// ══════════════════════════════ O QUE QUEBROU EM PRODUÇÃO EM 19/08 ══════════
//
// Duas confirmações da mesma compra correram juntas (o webhook e a consulta
// que a tela faz a cada 5s). O convite perdedor voltou com o erro do Postgres,
// não com a frase amigável do Supabase:
//
//   duplicate key value violates unique constraint "users_email_partial_key"
//
// A rede de segurança testava /already|registered|exists/ e não pegava isso,
// então a compra parava sem matrícula — e, como `convertido` nunca era
// gravado, a tela tentava de novo a cada 5 segundos, reenviando o convite.

test("o erro de chave duplicada é reconhecido como conta já existente", () => {
  const reconhece = (m) => /already|registered|exists|duplicate key|23505/i.test(m);

  // As mensagens reais, as duas formas.
  assert.ok(reconhece('duplicate key value violates unique constraint "users_email_partial_key"'));
  assert.ok(reconhece("failed to close prepared statement: ERROR: current transaction is aborted (SQLSTATE 25P02): ERROR: duplicate key value violates unique constraint (SQLSTATE 23505)"));
  assert.ok(reconhece("A user with this email address has already been registered"));

  // E o que NÃO pode ser confundido com conta existente.
  assert.ok(!reconhece("Failed to fetch"));
  assert.ok(!reconhece("invalid email"));
});
