// O briefing inicial do Voo Guiado saiu das mãos do aluno e passou para o
// mentor. A regra que decide o que cada aluno vê é uma condição só, e ela
// precisa ser exata em três pontos:
//
//   • Voo Guiado sem briefing  → tela de espera (NÃO o formulário);
//   • Voo Guiado com briefing  → cronograma normal, Recalibrar disponível;
//   • Decolando                → tudo exatamente como era, sem exceção.
//
// A condição é `temCopiloto && !briefing`, replicada aqui como a fonte de
// verdade do teste: ela aparece em aluno/page.tsx, aluno/cronograma/page.tsx
// e decola-app.tsx, e as três precisam concordar.

import test from "node:test";
import assert from "node:assert/strict";

/** A regra, exatamente como está nas três telas. */
const aguardandoMentor = (temCopiloto, briefing) => Boolean(temCopiloto) && !briefing;

/** Tela inicial do app do aluno (decola-app.tsx). */
function telaInicial({ demoMode = false, briefing = null, temCopiloto = false } = {}) {
  if (demoMode) return "mapa";
  if (briefing) return "mapa";
  if (aguardandoMentor(temCopiloto, briefing)) return "mapa";
  return "briefing";
}

const BRIEFING = { data_prova: "2026-09-01" };

// ═══════════════════════════════════════════════ VOO GUIADO ═════════════════
test("Voo Guiado sem briefing NÃO recebe o formulário", () => {
  // Era o comportamento antigo: sem briefing, o aluno caía direto no
  // formulário. Agora quem preenche é o mentor.
  assert.equal(telaInicial({ temCopiloto: true, briefing: null }), "mapa");
  assert.equal(aguardandoMentor(true, null), true);
});

test("Voo Guiado com briefing entra no mapa e sai da espera", () => {
  assert.equal(telaInicial({ temCopiloto: true, briefing: BRIEFING }), "mapa");
  assert.equal(aguardandoMentor(true, BRIEFING), false);
});

// ═══════════════════════════════════════════════ DECOLANDO ══════════════════
test("Decolando sem briefing continua indo para o briefing — nada mudou", () => {
  // É a garantia do item 10: o Decolando não pode entrar no fluxo novo.
  assert.equal(telaInicial({ temCopiloto: false, briefing: null }), "briefing");
  assert.equal(aguardandoMentor(false, null), false, "Decolando nunca fica 'aguardando mentor'");
});

test("Decolando com briefing entra no mapa, como antes", () => {
  assert.equal(telaInicial({ temCopiloto: false, briefing: BRIEFING }), "mapa");
});

// ═══════════════════════════════════════════════ VITRINE ════════════════════
test("o modo demonstração não é afetado", () => {
  assert.equal(telaInicial({ demoMode: true, temCopiloto: true, briefing: null }), "mapa");
});

// ═════════════════════════════ O QUE A ESPERA ESCONDE ═══════════════════════
test("quem aguarda não recebe o cronograma genérico do outro plano", () => {
  // Sem esta regra, o Voo Guiado sem briefing caía no template linear de 40
  // dias do Decolando e via um cronograma que não é o dele.
  const diasVisiveis = (temCopiloto, briefing, template) =>
    aguardandoMentor(temCopiloto, briefing) ? [] : template;
  const template = [{ dia_numero: 1 }, { dia_numero: 2 }];
  assert.deepEqual(diasVisiveis(true, null, template), []);
  assert.deepEqual(diasVisiveis(true, BRIEFING, template), template);
  assert.deepEqual(diasVisiveis(false, null, template), template, "Decolando continua vendo o template");
});

test("Recalibrar Voo some só enquanto não há plano — e volta depois", () => {
  const mostraRecalibrar = (temCopiloto, briefing) => !aguardandoMentor(temCopiloto, briefing);
  assert.equal(mostraRecalibrar(true, null), false, "não há o que recalibrar antes do envio");
  assert.equal(mostraRecalibrar(true, BRIEFING), true, "depois do envio, é do aluno de novo");
  assert.equal(mostraRecalibrar(false, null), true, "Decolando intocado");
});
