import type { TrilhaDia } from "@/types/database";
import { chaveDeItemTrilha, itensQueContam } from "@/lib/trilha/progresso";

// ============================================================================
// O PLANO DECOLANDO — O CRONOGRAMA QUE ESPERA O ALUNO
//
// O Decolando é um cronograma FIXO: os mesmos 40 blocos para todo mundo, sem
// briefing, sem data de prova, sem dias da semana, sem adaptação. Este módulo
// existe para que ele não empreste nada da lógica do Voo Guiado — que é
// adaptativa por natureza e, aplicada aqui, produz exatamente os defeitos que
// este arquivo corrige.
//
// COMO ERA
// --------
// O dia atual vinha de `calcularDiaTrilha(matriculas.acesso_liberado_em)`:
// dias corridos desde a matrícula, mais um. Quem se matriculou e sumiu duas
// semanas voltava no dia 15 — com quatorze dias marcados como "anteriores"
// que ele nunca abriu. Quem passou de 40 dias de matrícula não tinha dia
// nenhum: `dia_numero` 41 não existe em `trilha_dias`, e a tela ficava sem
// missão para mostrar.
//
// O calendário decidia o progresso de alguém que comprou um conteúdo, não uma
// assinatura de rotina.
//
// COMO É AGORA
// ------------
// Quem decide é a CONCLUSÃO, não a data. O dia atual é o primeiro bloco que
// ainda não foi concluído. Concluiu o Dia 1 → o Dia 2 abre. Sumiu duas
// semanas → volta no mesmo Dia 2, intacto. O tempo não corre contra o aluno.
//
// Nada aqui lê data. É de propósito: enquanto não houver data nenhuma nesta
// conta, é impossível o cronograma andar sozinho.
// ============================================================================

/**
 * As chaves que o aluno de fato CONCLUIU.
 *
 * Um Set, e não a tabela crua, por um motivo que já seria um bug: em
 * `aluno_progresso_itens` existe linha com `concluida = false` — é assim que
 * o app guarda onde o aluno parou num vídeo. Aceitar "a chave existe" como
 * conclusão destravaria o bloco seguinte para quem apenas ABRIU a aula.
 */
export type Progresso = Set<string> | null | undefined;

/** Monta o Set a partir das linhas de `aluno_progresso_itens`. */
export function chavesConcluidas(
  linhas: { chave: string; concluida?: boolean | null }[] | null | undefined
): Set<string> {
  return new Set((linhas ?? []).filter((l) => l.concluida === true).map((l) => l.chave));
}

function concluido(progresso: Progresso, chave: string): boolean {
  return progresso ? progresso.has(chave) : false;
}

/**
 * O bloco está concluído?
 *
 * Vale a mesma regra do resto da plataforma (`itensQueContam`): o bloco de
 * questões extras fica de fora, porque ele é acompanhamento opcional e não
 * pode impedir o aluno de destravar o dia seguinte.
 *
 * Um dia SEM itens que contam é considerado concluído. Sem isso, um dia que o
 * admin deixou vazio — ou que ficou só com o bloco extra — travaria o aluno
 * para sempre num bloco que não tem nada para fazer.
 */
export function blocoConcluido(dia: TrilhaDia, progresso: Progresso): boolean {
  const itens = itensQueContam(dia.itens ?? []);
  if (itens.length === 0) return true;
  return itens.every(({ item, indice }) => {
    const chave = chaveDeItemTrilha(dia.dia_numero, indice, item);
    // Item sem chave possível (aula sem ref_id e sem URL) não tem como ser
    // marcado, então não pode ser exigido para concluir o bloco.
    return chave === null || concluido(progresso, chave);
  });
}

/**
 * Em que bloco o aluno está.
 *
 * O primeiro que ainda não foi concluído — e não "o próximo depois do último
 * concluído". A diferença aparece quando o aluno pula: quem concluiu o 1 e o
 * 3 continua devendo o 2, e é nele que a tela abre.
 *
 * Quando tudo está concluído, devolve o ÚLTIMO bloco em vez de um número que
 * não existe. O aluno que terminou o cronograma vê o dia 40, não uma tela
 * vazia — que é o que acontecia quando a conta por calendário passava de 40.
 *
 * Devolve `null` só quando não há cronograma nenhum cadastrado.
 */
export function diaDoDecolando(dias: TrilhaDia[], progresso: Progresso): number | null {
  if (!dias || dias.length === 0) return null;
  const ordenados = [...dias].sort((a, b) => a.dia_numero - b.dia_numero);
  const pendente = ordenados.find((d) => !blocoConcluido(d, progresso));
  return (pendente ?? ordenados[ordenados.length - 1]).dia_numero;
}

/** Quantos blocos o aluno já concluiu — para a barra de progresso. */
export function blocosConcluidos(dias: TrilhaDia[], progresso: Progresso): number {
  return (dias ?? []).filter((d) => blocoConcluido(d, progresso)).length;
}

/** O aluno terminou o cronograma inteiro? */
export function cronogramaConcluido(dias: TrilhaDia[], progresso: Progresso): boolean {
  return (dias?.length ?? 0) > 0 && blocosConcluidos(dias, progresso) === dias.length;
}
