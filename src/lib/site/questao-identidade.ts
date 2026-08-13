// ============================================================================
// IDENTIDADE DE UMA QUESTÃO — como o aluno e o admin falam da mesma questão
//
// O código existia em dois lugares, escrito duas vezes com a mesma regra:
// no painel do admin e na tela de prática do app. Duas cópias da mesma regra
// é uma divergência esperando para acontecer — e o dia em que uma delas mudar
// é o dia em que o aluno reporta "erro na questão Q3F9A2" e o admin não acha
// nada. Aqui passa a existir uma regra só, e as telas de atividade, simulado
// e sessão — que não mostravam código nenhum — passam a usar a mesma.
//
// O código é derivado do id: não há coluna para ele, e criar uma exigiria
// gerar e migrar 396 valores para resolver um problema que a derivação já
// resolve. Derivar mantém código e questão sincronizados por construção.
// ============================================================================

import { rotuloProva } from "@/lib/site/filtro-questoes";

/** Metadados de origem que uma questão carrega no banco. */
export interface OrigemDaQuestao {
  id: string;
  materia?: string | null;
  prova_nome?: string | null;
  modalidade?: string | null;
  ano?: number | null;
  semestre?: number | null;
  numero_questao?: number | null;
  fonte?: string | null;
  anulada?: boolean | null;
}

/**
 * Código curto e estável da questão. É o que o aluno informa ao suporte e o
 * que o admin digita na busca — os dois precisam ser exatamente o mesmo.
 */
export function codigoDaQuestao(id: string): string {
  return "Q" + (id ?? "").slice(0, 6).toUpperCase();
}

/**
 * A prova de origem, em uma linha: "FACAPE 2026 — Rede PEBA".
 *
 * "Questão 12" sozinho não identifica nada — existe uma questão 12 em toda
 * prova de todo ano. Devolve string vazia quando não há origem cadastrada,
 * para a tela simplesmente não mostrar a linha em vez de mostrar "null".
 */
export function provaDaQuestao(q: OrigemDaQuestao): string {
  // `rotuloProva` já é o rótulo oficial da prova no painel do admin, com a
  // modalidade traduzida ("peba" → "Rede PEBA") e o semestre no lugar certo.
  // Reaproveitar em vez de reescrever: aluno e admin precisam ler a MESMA
  // origem, e uma segunda implementação divergiria na primeira mudança.
  const oficial = rotuloProva({
    id: q.id,
    materia: q.materia ?? "",
    assunto: null,
    enunciado: "",
    prova_nome: q.prova_nome ?? null,
    ano: q.ano ?? null,
    semestre: q.semestre ?? null,
    modalidade: q.modalidade ?? null
  });
  if (oficial) return oficial;

  // `fonte` é o campo livre antigo; só entra quando não há prova cadastrada,
  // para não repetir a mesma informação com dois nomes.
  return (q.fonte ?? "").trim();
}

/**
 * A segunda linha: "Questão 12 · Biologia".
 *
 * O número é o da PROVA de origem, não a posição na atividade — é por ele que
 * o aluno acha a questão no caderno original.
 */
export function referenciaDaQuestao(q: OrigemDaQuestao, posicaoNaLista?: number): string {
  const partes: string[] = [];
  if (q.numero_questao != null) partes.push(`Questão ${q.numero_questao}`);
  else if (posicaoNaLista != null) partes.push(`Questão ${posicaoNaLista}`);
  const materia = (q.materia ?? "").trim();
  if (materia) partes.push(materia);
  return partes.join(" · ");
}
