// O valor que o cliente vê na tela e o valor que vai para o Asaas precisam ser
// o mesmo número. A única forma de garantir isso é os dois saírem daqui.
//
// Estes testes cobrem as três coisas que podem dar errado com dinheiro:
// a conta dos juros, o arredondamento em centavos, e o teto de parcelas —
// que é entrada vinda do navegador e não pode ser respeitada por confiança.

import test from "node:test";
import assert from "node:assert/strict";
import {
  SEM_PARCELAMENTO,
  PARCELAS_MAXIMAS_ABSOLUTAS,
  lerConfiguracao,
  limitarParcelas,
  totalComJuros,
  montarOpcao,
  opcoesDeParcelamento,
  opcaoEscolhida,
  descreverOpcao
} from "./parcelamento.ts";

const PRECO = 44500; // R$ 445,00 — o VOO GUIADO

const semJuros = { parcelamentoAtivo: true, parcelasMaximas: 6, jurosAtivo: false, jurosPercentual: 0 };
const comJuros = { parcelamentoAtivo: true, parcelasMaximas: 12, jurosAtivo: true, jurosPercentual: 2 };

// ═══════════════════════════════ A CONFIGURAÇÃO ═════════════════════════════
test("plano sem as colunas preenchidas não parcela", () => {
  // Todo plano criado antes desta funcionalidade cai aqui. O resultado tem de
  // ser o comportamento de hoje, nunca um valor inventado.
  assert.deepEqual(lerConfiguracao(null), SEM_PARCELAMENTO);
  assert.deepEqual(lerConfiguracao({}), SEM_PARCELAMENTO);
  assert.deepEqual(lerConfiguracao({ preco_centavos: 44500 }), SEM_PARCELAMENTO);
});

test("parcelamento desligado ignora o resto da configuração", () => {
  const c = lerConfiguracao({ parcelamento_ativo: false, parcelas_maximas: 12, juros_ativo: true, juros_percentual: 5 });
  assert.equal(c.parcelamentoAtivo, false);
  assert.equal(c.parcelasMaximas, 1);
});

test("juros ligado com percentual zerado é tratado como sem juros", () => {
  // Configuração incompleta. Sem isto o cliente leria "com juros" e pagaria o
  // valor à vista — ou o contrário, que é pior.
  const c = lerConfiguracao({ parcelamento_ativo: true, parcelas_maximas: 3, juros_ativo: true, juros_percentual: 0 });
  assert.equal(c.jurosAtivo, false);
});

test("o teto de parcelas é limitado ao do gateway", () => {
  assert.equal(limitarParcelas(99), PARCELAS_MAXIMAS_ABSOLUTAS);
  assert.equal(limitarParcelas(0), 1);
  assert.equal(limitarParcelas(-5), 1);
  assert.equal(limitarParcelas(3.7), 3);
  assert.equal(limitarParcelas(NaN), 1);
});

// ═══════════════════════════════ SEM JUROS ══════════════════════════════════
test("sem juros, parcelar não encarece nada", () => {
  for (const n of [1, 2, 3, 6]) {
    assert.equal(totalComJuros(PRECO, n, semJuros), PRECO, `${n}x`);
  }
});

test("sem juros, a soma das parcelas fecha com o preço", () => {
  const o = montarOpcao(PRECO, 5, semJuros);
  assert.equal(o.valorDaParcelaCentavos * 5, o.totalCentavos);
  assert.equal(o.temJuros, false);
  assert.equal(o.jurosCentavos, 0);
});

test("centavo de arredondamento não vira 'com juros'", () => {
  // R$ 445,00 em 3x dá R$ 148,3333… → R$ 148,34, e o total fecha em
  // R$ 445,02. São dois centavos de divisão, não juros. Comparar o total
  // final com o preço faria um plano SEM juros anunciar juros na tela.
  const o = montarOpcao(44500, 3, semJuros);
  assert.equal(o.valorDaParcelaCentavos, 14834);
  assert.equal(o.totalCentavos, 44502, "a sobra do arredondamento existe");
  assert.equal(o.temJuros, false, "mas ela não é juros");
  assert.equal(o.jurosCentavos, 0);
  assert.match(descreverOpcao(o), /sem juros/);
});

test("divisão inexata arredonda para cima — a plataforma não pode receber menos", () => {
  // R$ 100,00 em 3x daria 33,3333... A soma de 33,33 × 3 = 99,99: um centavo
  // a menos do que foi vendido, em toda compra.
  const o = montarOpcao(10000, 3, semJuros);
  assert.equal(o.valorDaParcelaCentavos, 3334);
  assert.equal(o.totalCentavos, 10002);
  assert.ok(o.totalCentavos >= 10000, "a soma nunca pode ficar abaixo do preço");
});

test("o total exibido é sempre parcela × n — nunca um total teórico", () => {
  // Se guardássemos o total sem arredondar, a soma das parcelas na tela não
  // fecharia com o total na tela. O cliente veria a diferença na fatura.
  for (const n of [2, 3, 5, 7, 11]) {
    const o = montarOpcao(PRECO, n, comJuros);
    assert.equal(o.valorDaParcelaCentavos * n, o.totalCentavos, `${n}x não fecha`);
  }
});

// ═══════════════════════════════ COM JUROS ══════════════════════════════════
test("juros compostos sobre o número de parcelas", () => {
  // 2% a.m. em 3x sobre R$ 445,00: 44500 × 1,02³ = 47224,36 → 47224
  assert.equal(totalComJuros(PRECO, 3, comJuros), Math.round(44500 * Math.pow(1.02, 3)));
});

test("à vista nunca tem juros, mesmo com juros configurados", () => {
  // Não há prazo a remunerar. Cobrar juros em 1x seria só aumentar o preço.
  assert.equal(totalComJuros(PRECO, 1, comJuros), PRECO);
  const o = montarOpcao(PRECO, 1, comJuros);
  assert.equal(o.temJuros, false);
  assert.equal(o.totalCentavos, PRECO);
});

test("com juros, o total passa do preço e a diferença é declarada", () => {
  const o = montarOpcao(PRECO, 6, comJuros);
  assert.ok(o.totalCentavos > PRECO);
  assert.equal(o.temJuros, true);
  assert.equal(o.jurosCentavos, o.totalCentavos - PRECO);
});

test("mais parcelas, mais juros — a curva é monotônica", () => {
  let anterior = 0;
  for (let n = 2; n <= 12; n++) {
    const o = montarOpcao(PRECO, n, comJuros);
    assert.ok(o.totalCentavos > anterior, `${n}x não é maior que ${n - 1}x`);
    anterior = o.totalCentavos;
  }
});

// ═══════════════════════════════ AS OPÇÕES ══════════════════════════════════
test("plano sem parcelamento oferece exatamente uma opção", () => {
  const opcoes = opcoesDeParcelamento(PRECO, SEM_PARCELAMENTO);
  assert.equal(opcoes.length, 1);
  assert.equal(opcoes[0].parcelas, 1);
  assert.equal(opcoes[0].totalCentavos, PRECO);
});

test("as opções respeitam exatamente o teto configurado", () => {
  assert.equal(opcoesDeParcelamento(PRECO, semJuros).length, 6);
  assert.equal(opcoesDeParcelamento(PRECO, comJuros).length, 12);
});

test("à vista é sempre a primeira opção", () => {
  const [primeira] = opcoesDeParcelamento(PRECO, comJuros);
  assert.equal(primeira.parcelas, 1);
  assert.equal(primeira.totalCentavos, PRECO);
});

// ═══════════════════ O QUE VEM DO NAVEGADOR ═════════════════════════════════
// O número de parcelas chega do checkout. Aceitar por confiança seria deixar
// o cliente escolher em quantas vezes pagar, independente do que o plano diz.

test("acima do teto do plano é recusado", () => {
  assert.equal(opcaoEscolhida(PRECO, 12, semJuros), null, "o plano só permite 6x");
  assert.equal(opcaoEscolhida(PRECO, 7, semJuros), null);
  assert.ok(opcaoEscolhida(PRECO, 6, semJuros));
});

test("plano sem parcelamento só aceita 1x", () => {
  assert.ok(opcaoEscolhida(PRECO, 1, SEM_PARCELAMENTO));
  assert.equal(opcaoEscolhida(PRECO, 2, SEM_PARCELAMENTO), null);
});

test("valor inválido é recusado, não corrigido", () => {
  for (const pedido of [0, -3, 2.5, "muitas", null, undefined, NaN, Infinity, "3; drop table"]) {
    assert.equal(opcaoEscolhida(PRECO, pedido, semJuros), null, `aceitou ${pedido}`);
  }
});

test("número em texto passa — é assim que chega de um formulário", () => {
  const o = opcaoEscolhida(PRECO, "3", semJuros);
  assert.ok(o);
  assert.equal(o.parcelas, 3);
});

test("a opção escolhida é idêntica à mostrada na lista", () => {
  // É esta igualdade que garante "o valor exibido é o valor cobrado".
  const daLista = opcoesDeParcelamento(PRECO, comJuros).find((o) => o.parcelas === 4);
  assert.deepEqual(opcaoEscolhida(PRECO, 4, comJuros), daLista);
});

// ═══════════════════════════════ O RÓTULO ═══════════════════════════════════
test("o rótulo diz parcelas, valor e se há juros", () => {
  assert.match(descreverOpcao(montarOpcao(PRECO, 1, comJuros)), /À vista/);
  assert.match(descreverOpcao(montarOpcao(PRECO, 3, comJuros)), /3x de .*com juros/);
  assert.match(descreverOpcao(montarOpcao(PRECO, 3, semJuros)), /3x de .*sem juros/);
});
