import type { TrilhaItem } from "@/types/database";

// Chaves de `aluno_progresso_itens`. Ficam aqui, e não dentro do app do
// aluno, porque agora dois lados precisam concordar sobre elas: o app grava
// a conclusão e o Copiloto (no servidor) lê para saber o que o aluno já fez.
// Se as duas implementações divergissem um caractere, o Copiloto reagendaria
// conteúdo que o aluno já tinha marcado como concluído — exatamente o que
// não pode acontecer.

export function youtubeVideoId(url: string): string | null {
  const m = (url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/i);
  return m ? m[1] : null;
}

export function chaveAula(conteudoId: string): string {
  return "aula:" + conteudoId;
}

// Nem toda aula do cronograma tem `ref_id` — a maioria guarda só a URL do
// vídeo. A chave cai para o ID do YouTube, que é tão estável quanto o
// ref_id e continua igual se o admin reordenar os itens do dia.
export function chaveDeAula(refId: string | null, url: string | null): string | null {
  if (refId) return chaveAula(refId);
  const videoId = url ? youtubeVideoId(url) : null;
  if (videoId) return "aula-yt:" + videoId;
  return url ? "aula-url:" + url : null;
}

export function chaveItemTrilha(diaNumero: number, indice: number): string {
  return "trilha:" + diaNumero + ":" + indice;
}

// Chave do bloco de questões extras do dia. Namespace próprio, e não a chave
// posicional: o bloco é acrescentado depois que a rota está montada, então o
// índice dele dentro do dia muda sempre que o algoritmo escolhe outra
// quantidade de itens principais. Com a chave posicional, a sessão que o
// aluno já respondeu passaria a apontar para outro lugar.
export function chaveItemExtra(diaNumero: number): string {
  return "extra:" + diaNumero;
}

export function chaveDeItemTrilha(diaNumero: number, indice: number, item: TrilhaItem): string | null {
  if (item.extra) return chaveItemExtra(diaNumero);
  if (item.tipo === "aula") return chaveDeAula(item.ref_id, item.url);
  return chaveItemTrilha(diaNumero, indice);
}

/** O item é um bloco de questões extras? */
export function ehQuestaoExtra(item: TrilhaItem): boolean {
  return Boolean(item.extra);
}

/**
 * Os itens que contam para "o dia está concluído", com o índice original.
 *
 * O bloco de questões extras fica DE FORA: deixar de fazê-lo não pode marcar
 * o dia como incompleto nem travar a barra de progresso em 4/5 para sempre.
 * O índice original é devolvido junto porque a chave de progresso dos demais
 * itens depende da posição deles no dia.
 */
export function itensQueContam<T extends TrilhaItem>(itens: T[]): { item: T; indice: number }[] {
  return itens.map((item, indice) => ({ item, indice })).filter(({ item }) => !item.extra);
}

// Quanto tempo estimar para cada tipo de item ao reagendá-lo. Aproximação
// deliberada: o que importa é não estourar a carga horária do dia, não
// cravar a duração exata de cada conteúdo.
export const MINUTOS_POR_TIPO: Record<string, number> = {
  aula: 30,
  pdf: 25,
  link: 15,
  leitura: 30,
  questoes: 40,
  flashcards: 20,
  simulado: 90,
  atividade: 40,
  pagina: 10,
  revisao: 30,
  redacao: 60,
  livre: 0
};

/**
 * Quanto tempo o item ocupa no dia.
 *
 * Videoaula usa a duração REAL quando ela é conhecida — aulas variam de 5 a
 * 60+ minutos, e tratar todas como 30 é o que fazia um dia de 2h receber uma
 * única aula de 10 minutos enquanto outro estourava com três de 50.
 *
 * "Conhecida" é uma marca explícita, não um palpite: `duracao_real` só chega
 * aqui quando a duração veio da fonte (ver `duracao_confirmada` em
 * conteudos_biblioteca, migração 070). Sem a marca, vale a média por tipo —
 * que é o comportamento de sempre, e o que continua valendo para questões,
 * revisão, flashcards e todo o resto, porque a duração deles depende de quem
 * estuda, não do conteúdo.
 */
export function minutosDoItem(item: TrilhaItem): number {
  const real = duracaoRealDoItem(item);
  if (real !== null) return real;
  return MINUTOS_POR_TIPO[item.tipo] ?? 30;
}

/** A duração real de uma videoaula, se ela for confiável. */
export function duracaoRealDoItem(item: TrilhaItem): number | null {
  if (item.tipo !== "aula") return null;
  const i = item as unknown as { duracao_real?: boolean; duracao_minutos?: number };
  if (!i.duracao_real) return null;
  const minutos = i.duracao_minutos;
  // Duração marcada como real mas inutilizável (zero, negativa, ausente) cai
  // na média: é melhor uma estimativa do que somar zero e o dia receber aula
  // demais.
  return Number.isFinite(minutos) && (minutos as number) > 0 ? Math.round(minutos as number) : null;
}

// Itens que não valem reagendamento: "livre" é descanso e "revisao" é
// genérico o bastante para o Copiloto recriar quando fizer sentido.
export function itemReagendavel(item: TrilhaItem): boolean {
  // Bloco extra não vira pendência: deixar de fazer não pode gerar dívida
  // nem empilhar 5 questões no dia seguinte. É a regra que separa a camada
  // complementar do cronograma principal.
  if (item.extra) return false;
  return item.tipo !== "livre" && item.tipo !== "revisao";
}
