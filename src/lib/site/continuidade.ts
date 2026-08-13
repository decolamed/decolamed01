// ============================================================================
// CONTINUAR DE ONDE PAROU — banco de questões e banco de flashcards
//
// As duas telas montavam a rodada assim:
//
//     [...todos].sort(() => Math.random() - 0.5).slice(0, LIMITE)
//
// Sorteio novo a cada visita. O aluno respondia 5 das 82 questões de
// Biologia, saía, voltava — e recebia 10 questões sorteadas de novo, quase
// sempre começando por alguma que ele já tinha feito. Não é que a posição não
// fosse salva: é que não existia ORDEM nenhuma para salvar posição dentro.
//
// A correção não é guardar um índice. Índice não sobrevive a filtro trocado,
// questão nova cadastrada pelo admin ou item pulado. O que se guarda — e já
// se guardava — é O QUE O ALUNO FEZ, por ID: `respostas_aluno.questao_id` e
// `flashcard_revisoes.flashcard_id`. A rodada é montada a partir disso.
//
// Duas regras, e só:
//
//   1. o que ele ainda não fez vem primeiro, na ordem do acervo;
//   2. o que ele já fez continua acessível, logo em seguida.
//
// "Já respondeu" nunca vira "não pode responder de novo": a segunda regra é
// tão importante quanto a primeira. O sistema recomenda o próximo item
// pendente; quem decide é o aluno.
// ============================================================================

export interface ItemComId {
  id: string;
}

export interface Rodada<T> {
  /** Os itens desta rodada, pendentes primeiro. */
  itens: T[];
  /** Quantos itens do acervo (com o filtro atual) o aluno já fez. */
  feitos: number;
  /** Quantos ainda faltam. */
  pendentes: number;
  /** Tamanho do acervo com o filtro atual. */
  total: number;
  /**
   * O aluno está retomando algo começado antes? É o que decide se a tela
   * mostra "você já fez N; continuando de onde parou" ou nada.
   */
  retomando: boolean;
  /** true quando não sobrou nada pendente e a rodada é de revisão. */
  soRevisao: boolean;
}

/**
 * Monta a rodada a partir do acervo e do histórico REAL do aluno.
 *
 * A ordem do acervo é respeitada como veio (é a ordem estável do banco:
 * matéria, depois cadastro). Nada de sorteio — sem ordem fixa, "continuar de
 * onde parou" não significa nada, porque o lugar onde ele parou muda a cada
 * abertura da tela.
 */
export function montarRodada<T extends ItemComId>(
  acervo: T[],
  jaFeitos: Set<string>,
  tamanho: number
): Rodada<T> {
  const pendentes = acervo.filter((i) => !jaFeitos.has(i.id));
  const feitos = acervo.filter((i) => jaFeitos.has(i.id));

  // Pendentes primeiro; os já feitos continuam na fila, logo atrás, para o
  // aluno poder rever sem sair da tela nem trocar de filtro.
  const itens = [...pendentes, ...feitos].slice(0, Math.max(0, tamanho));

  return {
    itens,
    feitos: feitos.length,
    pendentes: pendentes.length,
    total: acervo.length,
    retomando: feitos.length > 0 && pendentes.length > 0,
    soRevisao: acervo.length > 0 && pendentes.length === 0
  };
}

/**
 * A frase que explica ao aluno por que ele não está na primeira questão.
 *
 * Devolve null quando não há nada a explicar — numa primeira visita a tela
 * não precisa dizer nada, e um aviso vazio é ruído.
 */
export function mensagemDeRetomada(r: Rodada<unknown>, singular: string, plural: string): string | null {
  if (r.total === 0) return null;
  if (r.soRevisao) {
    return `Você já passou por ${r.total === 1 ? `1 ${singular}` : `${r.total} ${plural}`}. Esta rodada é de revisão.`;
  }
  if (!r.retomando) return null;
  return `Você já fez ${r.feitos} de ${r.total}. Continuando de onde parou.`;
}
