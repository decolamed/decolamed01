// ============================================================================
// PENDÊNCIAS — a decisão pura de "o que remarcar e para que dia"
//
// Esta parte fica separada do motor de propósito: o motor conversa com o
// Supabase (ler progresso, gravar missões), e essa conversa é justamente o
// que torna a regra difícil de testar. Aqui não há banco nenhum — só entram
// listas e saem listas —, então o comportamento que o aluno percebe (dia
// livre primeiro, carga horária respeitada, item irrelevante descartado)
// pode ser verificado direto, sem subir infraestrutura.
// ============================================================================

export interface Pendencia {
  chave: string;
  titulo: string;
  materia: string | null;
  tipo: string;
  minutos: number;
  importancia: number;
  diaOrigem: number;
}

// Peso próprio do tipo de conteúdo, somado ao GEN da matéria. Simulado e
// redação valem mais porque são difíceis de repor; link e leitura valem
// menos porque o aluno consegue recuperar sozinho.
export const PESO_TIPO: Record<string, number> = {
  simulado: 12,
  redacao: 10,
  aula: 8,
  atividade: 7,
  questoes: 7,
  flashcards: 5,
  pdf: 4,
  leitura: 3,
  link: 2,
  // Página do app é navegação, não estudo: se ficou para trás, o aluno
  // chega lá sozinho pelo menu. Fica abaixo do corte de importância.
  pagina: 1
};

export const PESO_TIPO_PADRAO = 4;

// Abaixo disso a atividade não volta ao cronograma. É o "conteúdo não
// essencial pode ser pulado": empurrar um link de matéria de baixa
// relevância para um aluno que já está atrasado piora o atraso.
export const IMPORTANCIA_MINIMA = 6;

// Teto por execução. Se o aluno sumiu por três semanas, remarcar 60
// atividades de uma vez transformaria o cronograma num paredão — o efeito
// prático seria o aluno desistir. Recupera-se o mais importante agora; o
// resto continua pendente e volta na próxima rodada, quando houver espaço.
export const MAX_POR_RODADA = 12;

export function importanciaDe(gen: number, tipo: string): number {
  return gen + (PESO_TIPO[tipo] ?? PESO_TIPO_PADRAO);
}

/** Descarta o que não vale remarcar e ordena o resto por importância. */
export function selecionarPendencias(pendencias: Pendencia[], max = MAX_POR_RODADA): Pendencia[] {
  return pendencias
    .filter((p) => p.importancia >= IMPORTANCIA_MINIMA)
    .sort((a, b) => (b.importancia - a.importancia) || (a.diaOrigem - b.diaOrigem))
    .slice(0, max);
}

export interface DiaAlvo {
  data: string;
  /** Minutos já comprometidos no dia (missões + itens do cronograma). */
  usados: number;
}

export interface Alocacao {
  pendencia: Pendencia;
  data: string;
  /** O dia estava completamente vazio quando recebeu esta atividade. */
  eraLivre: boolean;
}

export interface ResultadoDistribuicao {
  alocacoes: Alocacao[];
  /** Não coube em nenhum dia: continua pendente para a próxima rodada. */
  semEspaco: Pendencia[];
}

/**
 * Distribui as pendências pelos dias disponíveis.
 *
 * A ordem de preferência é o coração da regra: dias completamente vazios
 * primeiro (do mais próximo para o mais distante) e, só depois de esgotados,
 * os dias que ainda têm folga dentro da carga horária do aluno. É isso que
 * cumpre "mover para os dias livres sem aumentar a carga dos demais" — e o
 * `maxMinutosPorDia` é o que impede a sobrecarga quando os livres acabam.
 *
 * Não muta `alvos`.
 */
export function distribuirPendencias(
  pendencias: Pendencia[],
  alvos: DiaAlvo[],
  maxMinutosPorDia: number
): ResultadoDistribuicao {
  const estado = alvos
    .filter((a) => a.usados < maxMinutosPorDia)
    .map((a) => ({ data: a.data, usados: a.usados, livre: a.usados === 0 }));

  const porPreferencia = () =>
    estado.sort((a, b) => (a.livre === b.livre ? a.data.localeCompare(b.data) : a.livre ? -1 : 1));

  porPreferencia();

  const alocacoes: Alocacao[] = [];
  const semEspaco: Pendencia[] = [];

  for (const p of pendencias) {
    const alvo = porPreferencia().find((a) => a.usados + p.minutos <= maxMinutosPorDia);
    if (!alvo) {
      // Uma atividade longa pode não caber onde uma curta ainda cabe, então
      // segue tentando as próximas em vez de encerrar o laço.
      semEspaco.push(p);
      continue;
    }
    alocacoes.push({ pendencia: p, data: alvo.data, eraLivre: alvo.livre });
    alvo.usados += p.minutos;
    alvo.livre = false;
  }

  return { alocacoes, semEspaco };
}

/** Texto gravado em `motivo_copiloto`. O carimbo `[pendencia:<chave>]` é
 *  lido de volta na rodada seguinte para não remarcar a mesma coisa duas
 *  vezes — o formato importa, não é só descrição. */
export function motivoRemarcacao(a: Alocacao): string {
  const onde = a.eraLivre ? "movido para dia livre" : "encaixado no tempo que sobrava";
  return `[pendencia:${a.pendencia.chave}] ficou pendente do dia ${a.pendencia.diaOrigem} · importância ${a.pendencia.importancia.toFixed(1)} · ${onde}`;
}

export function chaveDoMotivo(motivo: string | null): string | null {
  return motivo?.match(/\[pendencia:([^\]]+)\]/)?.[1] ?? null;
}
