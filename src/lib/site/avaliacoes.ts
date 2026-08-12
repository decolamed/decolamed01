// ============================================================================
// DISPONIBILIDADE DE UMA AVALIAÇÃO (simulado ou atividade)
//
// Existiam DUAS regras diferentes para a mesma pergunta — "o aluno vê isto?":
//
//   • no admin, a resposta era `ativo`. A lista mostrava "Ativo" e pronto;
//   • na aba Atividades do aluno, além de `ativo`, havia um filtro extra:
//     `totalQuestoes > 0 || temRedacao`, para o aluno não abrir uma prova
//     vazia.
//
// As duas regras eram razoáveis isoladamente e incompatíveis juntas. O
// resultado é o defeito relatado: o admin cria o simulado, liga o "Ativo",
// vê "Ativo · 0 questões" na lista e conclui que publicou — mas o simulado
// não aparece para o aluno, e nada em lugar nenhum diz por quê.
//
// Este módulo passa a ser a ÚNICA regra. O admin exibe o que ele responde
// (inclusive o motivo), e as duas telas do aluno filtram por ele. Assim a
// palavra "Ativo" no painel volta a significar o que promete.
// ============================================================================

export interface AvaliacaoParaAluno {
  /** Publicada pelo admin. */
  ativo: boolean;
  /** Quantas questões estão de fato vinculadas. */
  totalQuestoes: number;
  /** Tem proposta de redação (uma avaliação pode ser só de redação). */
  temRedacao: boolean;
}

/**
 * O aluno vê esta avaliação?
 *
 * Publicada E com algo dentro. Sem conteúdo, o botão "Começar" levaria a uma
 * tela vazia — o que é pior do que não listar; mas quem precisa saber disso
 * é o ADMIN, não o aluno, e é o que `motivoIndisponivel()` resolve.
 */
export function disponivelParaAluno(a: AvaliacaoParaAluno): boolean {
  return a.ativo && (a.totalQuestoes > 0 || a.temRedacao);
}

/**
 * Por que esta avaliação não chega ao aluno — em português, para aparecer na
 * tela do admin. Devolve null quando ela está normalmente disponível.
 */
export function motivoIndisponivel(a: AvaliacaoParaAluno): string | null {
  if (disponivelParaAluno(a)) return null;
  if (!a.ativo) return "Desativado — não aparece para o aluno.";
  return "Sem questões e sem redação: não aparece para o aluno mesmo estando ativo.";
}
