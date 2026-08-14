// A parte perigosa desta mudança não é escolher o simulado — é NÃO trocar o
// simulado de quem já está com a rota andando. A rota é regerada a cada
// leitura de tela, então uma escolha feita "na hora" muda embaixo do aluno.
//
// Estes testes fixam as quatro situações que o pedido separa:
//   • cronograma novo        → usa a configuração atual;
//   • cronograma em andamento→ mantém o que já foi atribuído;
//   • simulado já realizado  → nunca é substituído, nem se for desativado;
//   • posição sem simulado   → fica vazia, sem duplicar a outra.

import test from "node:test";
import assert from "node:assert/strict";
import {
  decidirSimuladosDaRota,
  lerSimuladosConfigurados,
  chaveDoSimulado,
  CHAVES_DOS_SIMULADOS,
  ORDENS_DE_SIMULADO
} from "./simulados-da-rota.ts";

const A = "aaaaaaaa-0000-0000-0000-000000000001";
const B = "bbbbbbbb-0000-0000-0000-000000000002";
const C = "cccccccc-0000-0000-0000-000000000003";
const D = "dddddddd-0000-0000-0000-000000000004";
const VAZIO = "eeeeeeee-0000-0000-0000-000000000005";
const DESATIVADO = "ffffffff-0000-0000-0000-000000000006";

function catalogo() {
  return new Map([
    [A, { id: A, titulo: "Simulado ENEM 01", utilizavel: true }],
    [B, { id: B, titulo: "Simulado ENEM 02", utilizavel: true }],
    [C, { id: C, titulo: "Simulado FACAPE 01", utilizavel: true }],
    [D, { id: D, titulo: "Simulado FACAPE 02", utilizavel: true }],
    // Ativo, mas sem questões e sem redação: o aluno abriria uma tela vazia.
    [VAZIO, { id: VAZIO, titulo: "Rascunho", utilizavel: false }],
    [DESATIVADO, { id: DESATIVADO, titulo: "Simulado antigo", utilizavel: false }]
  ]);
}

function decidir({ configurados = {}, fixados = {}, realizados = [] } = {}) {
  return decidirSimuladosDaRota({
    configurados,
    fixados,
    catalogo: catalogo(),
    realizados: new Set(realizados)
  });
}

const ids = (d) => d.simulados.map((s) => s?.id ?? null);
const motivos = (d) => d.escolhas.map((e) => e.motivo);

// ═════════════════════════════════════════════ CRONOGRAMA NOVO ══════════════
test("aluno sem nada fixado recebe o que o admin configurou", () => {
  const d = decidir({ configurados: { 1: A, 2: B } });
  assert.deepEqual(ids(d), [A, B]);
  assert.deepEqual(motivos(d), ["novo", "novo"]);
  // E o vínculo precisa ser gravado, senão a próxima leitura decide de novo.
  assert.deepEqual(d.aFixar, [
    { ordem: 1, simuladoId: A },
    { ordem: 2, simuladoId: B }
  ]);
});

test("os dois simulados são diferentes quando o admin configurou diferentes", () => {
  const d = decidir({ configurados: { 1: A, 2: B } });
  assert.notEqual(ids(d)[0], ids(d)[1]);
});

test("created_at não existe mais como critério — a ordem do catálogo é irrelevante", () => {
  // O admin escolhe o D para a posição 1 e o A para a 2, invertendo qualquer
  // ordem de cadastro. É exatamente isso que antes não era possível.
  const d = decidir({ configurados: { 1: D, 2: A } });
  assert.deepEqual(ids(d), [D, A]);
});

// ═══════════════════════════════════ SEM DUPLICAÇÃO SILENCIOSA ══════════════
test("só um simulado configurado: a 2ª posição fica VAZIA, não repete a 1ª", () => {
  // Era o defeito relatado: `simulados[ordem-1] ?? simulados[0]` entregava o
  // mesmo simulado nos dois dias, e nada na tela dizia isso.
  const d = decidir({ configurados: { 1: A, 2: null } });
  assert.deepEqual(ids(d), [A, null]);
  assert.deepEqual(motivos(d), ["novo", "sem-configuracao"]);
  assert.deepEqual(d.aFixar, [{ ordem: 1, simuladoId: A }]);
});

test("nada configurado: as duas posições ficam vazias e nada é fixado", () => {
  const d = decidir({});
  assert.deepEqual(ids(d), [null, null]);
  assert.deepEqual(d.aFixar, []);
});

test("simulado sem questões não entra, mesmo configurado", () => {
  // Reservar o dia para um simulado vazio manda o aluno a uma tela sem
  // questões justamente no dia marcado para ele fazer a prova.
  const d = decidir({ configurados: { 1: VAZIO, 2: B } });
  assert.deepEqual(ids(d), [null, B]);
});

test("simulado apagado do catálogo não entra", () => {
  const d = decidir({ configurados: { 1: "id-que-nao-existe", 2: B } });
  assert.deepEqual(ids(d), [null, B]);
});

test("o mesmo simulado nas duas posições é escolha explícita do admin e é respeitada", () => {
  const d = decidir({ configurados: { 1: A, 2: A } });
  assert.deepEqual(ids(d), [A, A]);
});

// ═══════════════════════════ CRONOGRAMA EM ANDAMENTO ════════════════════════
test("mudar a configuração NÃO troca o simulado de quem já tem rota", () => {
  // O caso do pedido: aluno recebeu A e B; o admin passou a configurar C e D.
  const d = decidir({ configurados: { 1: C, 2: D }, fixados: { 1: A, 2: B } });
  assert.deepEqual(ids(d), [A, B], "a rota em andamento tem de continuar com A e B");
  assert.deepEqual(motivos(d), ["fixado", "fixado"]);
  assert.deepEqual(d.aFixar, [], "nada a regravar: o vínculo já existe");
});

test("a configuração nova vale para o aluno seguinte", () => {
  const novo = decidir({ configurados: { 1: C, 2: D } });
  assert.deepEqual(ids(novo), [C, D]);
});

test("uma posição fixada e outra não: só a vazia recebe a configuração", () => {
  const d = decidir({ configurados: { 1: C, 2: D }, fixados: { 1: A } });
  assert.deepEqual(ids(d), [A, D]);
  assert.deepEqual(d.aFixar, [{ ordem: 2, simuladoId: D }]);
});

// ══════════════════════════════════ SIMULADO JÁ REALIZADO ═══════════════════
test("simulado já realizado nunca é substituído", () => {
  const d = decidir({ configurados: { 1: C, 2: D }, fixados: { 1: A, 2: B }, realizados: [A] });
  assert.equal(ids(d)[0], A);
  assert.equal(motivos(d)[0], "fixado-realizado");
});

test("simulado realizado E depois desativado continua no cronograma do aluno", () => {
  // É o ponto mais delicado: o aluno FEZ aquele simulado. Trocá-lo faria o
  // cronograma mentir sobre o que ele fez, e a nota em simulado_tentativas
  // ficaria órfã na tela.
  const d = decidir({
    configurados: { 1: C, 2: D },
    fixados: { 1: DESATIVADO, 2: B },
    realizados: [DESATIVADO]
  });
  assert.equal(ids(d)[0], DESATIVADO);
  assert.equal(motivos(d)[0], "fixado-realizado");
  assert.deepEqual(d.aFixar, [], "não pode reatribuir por cima de um simulado já feito");
});

test("realizado tem precedência sobre utilizável — a ordem das regras importa", () => {
  const d = decidir({ configurados: { 1: A }, fixados: { 1: DESATIVADO }, realizados: [DESATIVADO] });
  assert.equal(ids(d)[0], DESATIVADO);
});

// ═══════════════════════ A ÚNICA REGRA DE SUBSTITUIÇÃO ══════════════════════
test("fixado que ficou inutilizável e NÃO foi realizado é substituído", () => {
  // Sem esta regra o dia apontaria para um simulado desativado e o aluno
  // chegaria ao dia da prova simulada sem prova.
  const d = decidir({ configurados: { 1: C, 2: D }, fixados: { 1: DESATIVADO, 2: B } });
  assert.deepEqual(ids(d), [C, B]);
  assert.equal(motivos(d)[0], "substituido");
  assert.deepEqual(d.aFixar, [{ ordem: 1, simuladoId: C }]);
});

test("fixado inutilizável e sem substituto configurado vira posição vazia", () => {
  const d = decidir({ fixados: { 1: DESATIVADO } });
  assert.deepEqual(ids(d), [null, null]);
  assert.deepEqual(d.aFixar, []);
});

test("simulado apagado (vínculo virou nulo) é reatribuído", () => {
  // `on delete set null` deixa a linha com simulado_id nulo.
  const d = decidir({ configurados: { 1: A, 2: B }, fixados: { 1: null, 2: null } });
  assert.deepEqual(ids(d), [A, B]);
  assert.deepEqual(motivos(d), ["novo", "novo"]);
});

// ════════════════════════════════════════════════ ESTABILIDADE ══════════════
test("decidir duas vezes seguidas dá o mesmo resultado", () => {
  const entrada = { configurados: { 1: A, 2: B }, fixados: { 1: A, 2: B } };
  assert.deepEqual(ids(decidir(entrada)), ids(decidir(entrada)));
});

test("depois de fixado, o resultado para de depender da configuração", () => {
  const comConfig = decidir({ configurados: { 1: C, 2: D }, fixados: { 1: A, 2: B } });
  const semConfig = decidir({ fixados: { 1: A, 2: B } });
  assert.deepEqual(ids(comConfig), ids(semConfig));
});

// ══════════════════════════════════ LEITURA DAS CONFIGURAÇÕES ═══════════════
const cru = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

test("as chaves têm o formato esperado", () => {
  assert.deepEqual([...ORDENS_DE_SIMULADO], [1, 2]);
  assert.equal(chaveDoSimulado(1), "voo_guiado.simulado_1_id");
  assert.deepEqual(CHAVES_DOS_SIMULADOS, ["voo_guiado.simulado_1_id", "voo_guiado.simulado_2_id"]);
});

test("lê as linhas de configuracoes e ignora o resto", () => {
  const c = lerSimuladosConfigurados(
    [
      { chave: "voo_guiado.simulado_1_id", valor: A },
      { chave: "voo_guiado.simulado_2_id", valor: "  " },
      { chave: "livros.resumo_1_url", valor: "https://x.test" },
      { chave: "voo_guiado.simulado_9_id", valor: C }
    ],
    cru
  );
  assert.deepEqual(c, { 1: A, 2: null });
});

test("sem linhas, as duas posições vêm nulas — não indefinidas", () => {
  assert.deepEqual(lerSimuladosConfigurados([], cru), { 1: null, 2: null });
  assert.deepEqual(lerSimuladosConfigurados(null, cru), { 1: null, 2: null });
});
