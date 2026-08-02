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

export function chaveDeItemTrilha(diaNumero: number, indice: number, item: TrilhaItem): string | null {
  if (item.tipo === "aula") return chaveDeAula(item.ref_id, item.url);
  return chaveItemTrilha(diaNumero, indice);
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

export function minutosDoItem(item: TrilhaItem): number {
  return MINUTOS_POR_TIPO[item.tipo] ?? 30;
}

// Itens que não valem reagendamento: "livre" é descanso e "revisao" é
// genérico o bastante para o Copiloto recriar quando fizer sentido.
export function itemReagendavel(item: TrilhaItem): boolean {
  return item.tipo !== "livre" && item.tipo !== "revisao";
}
