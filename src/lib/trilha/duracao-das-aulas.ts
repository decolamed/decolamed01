import type { TrilhaDia, TrilhaItem } from "@/types/database";

// ============================================================================
// A DURAÇÃO REAL DA VIDEOAULA ENTRA NO CÁLCULO DO DIA
//
// O template do cronograma (`trilha_dias.itens`) guarda o `ref_id` da aula,
// não a duração dela. Quem sabe quanto tempo a aula tem é
// `conteudos_biblioteca`. Este módulo é a ponte: antes de gerar a rota, cada
// item de aula recebe a duração real da aula que ele aponta.
//
// Só entra duração CONFIRMADA (ver `duracao_confirmada`, migração 070). Para
// 253 das 270 aulas do banco o campo `duracao_minutos` é um placeholder de 30
// minutos, não a duração do vídeo — carimbar isso como "real" trocaria a média
// configurada por outro número fixo e não resolveria nada.
//
// O que muda no algoritmo é só isto: a conta de quanto o dia comporta. As
// regras de seleção — prioridade, peso de matéria, dificuldade, ordem,
// distribuição, repetição — continuam exatamente como estavam. O item já
// escolhido apenas passa a ocupar o tempo que realmente ocupa.
// ============================================================================

/** O que sabemos sobre a duração de um conteúdo. */
export interface DuracaoConhecida {
  duracaoMinutos: number;
  confirmada: boolean;
}

/**
 * Carimba a duração real nos itens de aula de um template.
 *
 * Devolve um template NOVO — o original é reaproveitado entre alunos e não
 * pode ser modificado no lugar.
 */
export function comDuracaoReal(
  template: TrilhaDia[],
  duracoes: Map<string, DuracaoConhecida>
): TrilhaDia[] {
  if (duracoes.size === 0) return template;

  return template.map((dia) => ({
    ...dia,
    itens: (dia.itens ?? []).map((item) => carimbarItem(item, duracoes))
  }));
}

function carimbarItem(item: TrilhaItem, duracoes: Map<string, DuracaoConhecida>): TrilhaItem {
  if (item.tipo !== "aula" || !item.ref_id) return item;

  const conhecida = duracoes.get(item.ref_id);
  if (!conhecida || !conhecida.confirmada || conhecida.duracaoMinutos <= 0) return item;

  return {
    ...item,
    // `duracao_real` é a marca que `minutosDoItem` procura. Sem ela, a duração
    // é ignorada e vale a média por tipo — que é o certo para uma aula cuja
    // duração ninguém confirmou.
    duracao_minutos: conhecida.duracaoMinutos,
    duracao_real: true
  } as TrilhaItem;
}

/**
 * Os `ref_id` de aula usados por um template.
 *
 * Serve para buscar só o que interessa: um template de 40 dias referencia
 * algumas dezenas de aulas, não o acervo inteiro.
 */
export function aulasReferenciadas(template: TrilhaDia[]): string[] {
  const ids = new Set<string>();
  for (const dia of template) {
    for (const item of dia.itens ?? []) {
      if (item.tipo === "aula" && item.ref_id) ids.add(item.ref_id);
    }
  }
  return [...ids];
}
