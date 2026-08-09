import { MATERIA_ESPANHOL, MATERIA_INGLES, ehMateriaIdioma, mesmaMateria } from "@/lib/site/materia-canonica";

// ============================================================================
// IDIOMA ESCOLHIDO PELO ALUNO (item 15)
//
// A prova traz questões de língua estrangeira e o aluno faz UMA das duas.
// A escolha vive em `aluno_briefing.idioma_prova`, e é aqui que ela vira
// efeito prático: filtrar tudo que é de idioma para deixar passar só o que
// o aluno escolheu.
//
// Regra de ouro deste módulo: quem NÃO respondeu a pergunta não perde nada.
// Sem escolha registrada, nenhum filtro é aplicado — esconder metade do
// acervo de quem nunca viu a pergunta seria trocar um problema por outro
// pior, e silencioso.
// ============================================================================

export type IdiomaProva = "ingles" | "espanhol";

/** Nome da matéria correspondente ao idioma escolhido. */
export function materiaDoIdioma(idioma: IdiomaProva): string {
  return idioma === "ingles" ? MATERIA_INGLES : MATERIA_ESPANHOL;
}

/** Rótulo para mostrar ao aluno. */
export function rotuloIdioma(idioma: IdiomaProva): string {
  return idioma === "ingles" ? "Inglês" : "Espanhol";
}

/** Valida o que veio do banco; qualquer outra coisa vira "não respondido". */
export function normalizarIdioma(valor: unknown): IdiomaProva | null {
  return valor === "ingles" || valor === "espanhol" ? valor : null;
}

/**
 * O conteúdo desta matéria deve ser mostrado a este aluno?
 *
 * Só nega quando as três condições valem ao mesmo tempo: o aluno escolheu um
 * idioma, a matéria é de idioma, e é o idioma que ele NÃO escolheu. Matérias
 * comuns (Biologia, Linguagens…) passam sempre.
 */
export function materiaVisivelParaIdioma(
  materia: string | null | undefined,
  idioma: IdiomaProva | null
): boolean {
  if (!idioma) return true;
  if (!ehMateriaIdioma(materia)) return true;
  return mesmaMateria(materia, materiaDoIdioma(idioma));
}

/** Filtra qualquer lista cujos itens tenham `materia`. */
export function filtrarPorIdioma<T extends { materia?: string | null }>(
  itens: T[],
  idioma: IdiomaProva | null
): T[] {
  if (!idioma) return itens;
  return itens.filter((i) => materiaVisivelParaIdioma(i.materia, idioma));
}

/**
 * Adapta o texto de uma atividade genérica de idioma ao aluno.
 *
 * O cronograma-base é o mesmo para todos e traz itens como "Faça 5 questões
 * de Inglês/Espanhol". Para quem escolheu Espanhol, o item vira "Faça 5
 * questões de Espanhol" — o texto acompanha o conteúdo que ele vai receber,
 * em vez de citar um idioma que a plataforma nem vai abrir para ele.
 */
export function textoAdaptadoAoIdioma(texto: string, idioma: IdiomaProva | null): string {
  if (!idioma || !texto) return texto;
  const escolhido = rotuloIdioma(idioma);
  return texto
    .replace(/Ingl[êe]s\s*\/\s*Espanhol/gi, escolhido)
    .replace(/Espanhol\s*\/\s*Ingl[êe]s/gi, escolhido)
    .replace(/L[íi]ngua\s+Estrangeira/gi, escolhido);
}
