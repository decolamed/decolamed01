// O número que este módulo produz é o faturamento que o dono da plataforma
// vai usar para decidir coisas. Os testes cobrem os três jeitos de ele sair
// errado sem ninguém perceber: somar o que não é receita, perder o último dia
// do período por causa de fuso, e contar a mesma venda duas vezes.

import test from "node:test";
import assert from "node:assert/strict";
import {
  STATUS_RECEBIDOS,
  ehRecebido,
  dataValida,
  limitesDoPeriodo,
  descreverPeriodo,
  somarRecebidos,
  dataDePagamento
} from "./periodo.ts";
import { instanteNoFuso } from "../site/data.ts";

const venda = (id, valor, extra = {}) => ({
  id,
  status: "confirmado",
  valor_centavos: valor,
  valor_liquido_centavos: null,
  comissao_centavos: 0,
  plano_nome: "VOO GUIADO",
  ...extra
});

// ═══════════════════════════ O QUE É RECEITA ════════════════════════════════
test("só confirmado e recebido são dinheiro que entrou", () => {
  assert.deepEqual([...STATUS_RECEBIDOS], ["confirmado", "recebido"]);
  assert.ok(ehRecebido("confirmado"));
  assert.ok(ehRecebido("recebido"));
  for (const status of ["pendente", "estornado", "falhou", "", null, undefined, "RECEBIDO"]) {
    assert.equal(ehRecebido(status), false, `${status} não pode contar como receita`);
  }
});

test("pendente, estornado e falhou ficam fora da soma", () => {
  const r = somarRecebidos([
    venda("a", 10000),
    venda("b", 15000, { status: "recebido" }),
    venda("c", 99900, { status: "pendente" }),
    venda("d", 99900, { status: "estornado" }),
    venda("e", 99900, { status: "falhou" })
  ]);
  assert.equal(r.totalCentavos, 25000);
  assert.equal(r.quantidade, 2);
});

// ═══════════════════════════════ A SOMA ═════════════════════════════════════
test("o exemplo do pedido: 100 + 150 + 200 …", () => {
  const linhas = [10000, 15000, 20000, 25000, 30000, 15000, 10000, 20000, 25000, 15000].map((v, i) =>
    venda(`v${i}`, v)
  );
  assert.equal(somarRecebidos(linhas).totalCentavos, 185000); // R$ 1.850,00
});

test("período sem nenhuma venda válida soma zero", () => {
  assert.equal(somarRecebidos([]).totalCentavos, 0);
  assert.equal(somarRecebidos([venda("a", 44500, { status: "pendente" })]).totalCentavos, 0);
  assert.equal(somarRecebidos([]).ticketMedioCentavos, 0, "sem divisão por zero");
});

test("a mesma venda nunca é contada duas vezes", () => {
  // Acontece de verdade: as linhas vêm em blocos paginados, e uma venda nova
  // registrada no meio da busca empurra as seguintes para o bloco de trás.
  const r = somarRecebidos([venda("repetida", 44500), venda("outra", 10000), venda("repetida", 44500)]);
  assert.equal(r.totalCentavos, 54500);
  assert.equal(r.quantidade, 2);
});

test("o líquido cai para bruto menos comissão quando não foi gravado", () => {
  const r = somarRecebidos([
    venda("a", 44500, { valor_liquido_centavos: 40050, comissao_centavos: 4450 }),
    venda("b", 10000, { valor_liquido_centavos: null, comissao_centavos: 1500 })
  ]);
  assert.equal(r.totalCentavos, 54500);
  assert.equal(r.liquidoCentavos, 40050 + 8500);
});

test("ticket médio é o total dividido pelas vendas que contaram", () => {
  const r = somarRecebidos([venda("a", 10000), venda("b", 20000), venda("c", 99900, { status: "pendente" })]);
  assert.equal(r.ticketMedioCentavos, 15000);
});

test("o resumo por plano acompanha a mesma regra", () => {
  const r = somarRecebidos([
    venda("a", 44500),
    venda("b", 44500),
    venda("c", 700, { plano_nome: "Teste" }),
    venda("d", 99900, { plano_nome: "Teste", status: "falhou" }),
    venda("e", 5000, { plano_nome: null })
  ]);
  assert.deepEqual(r.porPlano, [
    { plano: "VOO GUIADO", quantidade: 2, totalCentavos: 89000 },
    { plano: "Sem plano", quantidade: 1, totalCentavos: 5000 },
    { plano: "Teste", quantidade: 1, totalCentavos: 700 }
  ]);
});

test("valores nulos não viram NaN", () => {
  const r = somarRecebidos([venda("a", null, { comissao_centavos: null })]);
  assert.equal(r.totalCentavos, 0);
  assert.equal(r.liquidoCentavos, 0);
});

// ═══════════════════════════ AS DATAS DO FILTRO ═════════════════════════════
test("só aceita data de calendário de verdade", () => {
  assert.equal(dataValida("2026-08-01"), "2026-08-01");
  for (const ruim of ["", null, undefined, "01/08/2026", "2026-8-1", "2026-02-31", "2026-13-01", "ontem"]) {
    assert.equal(dataValida(ruim), null, `aceitou ${ruim}`);
  }
});

test("o dia começa e termina em Brasília, não em UTC", () => {
  // O ponto do módulo. Brasília é UTC−3: 01/08 00:00 daqui é 03:00Z, e
  // 30/08 23:59:59 daqui é 31/08 02:59:59Z.
  assert.equal(instanteNoFuso("2026-08-01", "00:00:00.000").toISOString(), "2026-08-01T03:00:00.000Z");
  assert.equal(instanteNoFuso("2026-08-30", "23:59:59.999").toISOString(), "2026-08-31T02:59:59.999Z");
});

test("a venda das 21h do último dia entra no período", () => {
  // Era o bug do `.setHours()`: com o corte em 23:59 UTC, tudo que fosse
  // vendido depois das 21h de Brasília do dia final ficava de fora do dia
  // que o admin acabou de selecionar.
  const { fim } = limitesDoPeriodo("2026-08-01", "2026-08-30");
  const vendaTardia = new Date("2026-08-30T21:30:00-03:00").toISOString();
  assert.ok(vendaTardia <= fim, "a venda das 21h30 do dia 30 precisa caber no dia 30");
});

test("a venda da meia-noite do primeiro dia entra no período", () => {
  const { inicio } = limitesDoPeriodo("2026-08-01", "2026-08-30");
  const logoApos = new Date("2026-08-01T00:00:01-03:00").toISOString();
  assert.ok(logoApos >= inicio);
  const vespera = new Date("2026-07-31T23:59:59-03:00").toISOString();
  assert.ok(vespera < inicio, "a véspera não pode entrar");
});

test("filtro pela metade continua valendo", () => {
  assert.equal(limitesDoPeriodo("2026-08-01", null).fim, null);
  assert.equal(limitesDoPeriodo(null, "2026-08-30").inicio, null);
  const vazio = limitesDoPeriodo(null, null);
  assert.equal(vazio.inicio, null);
  assert.equal(vazio.fim, null);
  assert.equal(vazio.invertido, false);
});

test("data inicial depois da final é sinalizada, não ignorada", () => {
  // Sem isso a tela mostraria R$ 0,00 e o admin acharia que não vendeu nada.
  assert.equal(limitesDoPeriodo("2026-08-30", "2026-08-01").invertido, true);
  assert.equal(limitesDoPeriodo("2026-08-01", "2026-08-30").invertido, false);
  assert.equal(limitesDoPeriodo("2026-08-01", "2026-08-01").invertido, false, "um dia só é período válido");
});

test("data inválida na URL é tratada como filtro ausente", () => {
  const r = limitesDoPeriodo("qualquer coisa", "2026-08-30");
  assert.equal(r.inicio, null);
  assert.ok(r.fim);
});

// ═══════════════════════════════ O RÓTULO ═══════════════════════════════════
test("o rótulo diz exatamente qual período foi somado", () => {
  assert.equal(descreverPeriodo("2026-08-01", "2026-08-30"), "Total recebido entre 01/08/2026 e 30/08/2026");
  assert.equal(descreverPeriodo("2026-08-01", null), "Total recebido a partir de 01/08/2026");
  assert.equal(descreverPeriodo(null, "2026-08-30"), "Total recebido até 30/08/2026");
  assert.equal(descreverPeriodo(null, null), "Total recebido em todo o período");
});

// ═════════════════════ A DATA QUE O GATEWAY MANDA ═══════════════════════════
test("dia de calendário do Asaas vira meio-dia de Brasília", () => {
  // "2026-08-18" gravado cru vira meia-noite UTC = 17/08 21h em Brasília, e a
  // venda ficava arquivada no dia anterior ao que foi paga.
  assert.equal(dataDePagamento("2026-08-18"), "2026-08-18T15:00:00.000Z");
});

test("instante completo do gateway passa direto", () => {
  // Aqui não há ambiguidade: o Asaas já disse a hora exata.
  assert.equal(dataDePagamento("2026-08-30T22:15:00-03:00"), "2026-08-31T01:15:00.000Z");
});

test("sem data, usa o agora recebido", () => {
  const agora = new Date("2026-08-19T12:00:00Z");
  for (const vazio of [null, undefined, "", "   "]) {
    assert.equal(dataDePagamento(vazio, agora), "2026-08-19T12:00:00.000Z");
  }
});

test("data ilegível não vira Invalid Date no banco", () => {
  const agora = new Date("2026-08-19T12:00:00Z");
  assert.equal(dataDePagamento("qualquer coisa", agora), "2026-08-19T12:00:00.000Z");
});

test("a data gravada e a data filtrada concordam", () => {
  // A propriedade que importa: uma venda paga em 18/08 tem de cair dentro de
  // um filtro de 18/08 a 18/08 — e fora de um filtro de 17/08.
  const gravada = dataDePagamento("2026-08-18");
  const dia18 = limitesDoPeriodo("2026-08-18", "2026-08-18");
  assert.ok(gravada >= dia18.inicio && gravada <= dia18.fim, "não caiu no próprio dia");
  const dia17 = limitesDoPeriodo("2026-08-17", "2026-08-17");
  assert.ok(gravada > dia17.fim, "vazou para o dia anterior");
});
