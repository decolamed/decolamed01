import type { TrilhaItem, TrilhaItemTipo } from "@/types/database";

// ============================================================================
// O QUE O MENTOR SALVA NUM DIA DA ROTA
//
// A tela do painel envia a lista de itens do dia como JSON. Ela é entrada de
// formulário: pode vir com campo em branco, tipo inventado, link sem esquema,
// item sem título, ou simplesmente não ser um array. Nada disso pode virar um
// dia quebrado no cronograma de um aluno — a mesma lista é lida depois pela
// tela dele, pelo resolvedor de conteúdo e pelo Copiloto.
//
// Este módulo é a fronteira: entra texto de formulário, sai `TrilhaItem[]`
// confiável. É puro de propósito — a regra fica testável sem banco.
// ============================================================================

/** Os tipos que um item de cronograma pode ter, conforme `trilha_dias.itens`. */
export const TIPOS_DE_ITEM = [
  "aula",
  "pdf",
  "link",
  "questoes",
  "flashcards",
  "simulado",
  "atividade",
  "redacao",
  "leitura",
  "revisao",
  "livre"
] as const;

export const TIPO_PADRAO: TrilhaItemTipo = "aula";

/** Um item como ele chega do formulário: tudo opcional, tudo suspeito. */
export interface ItemBruto {
  tipo?: unknown;
  titulo?: unknown;
  materia?: unknown;
  url?: unknown;
  ref_id?: unknown;
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/** Endereço utilizável, ou null. Sem esquema o item viraria um link morto. */
export function urlValida(valor: unknown): string | null {
  const bruto = texto(valor);
  if (!bruto) return null;
  return /^https?:\/\/\S+$/i.test(bruto) ? bruto : null;
}

function tipoValido(valor: unknown): TrilhaItemTipo {
  const bruto = texto(valor).toLowerCase();
  return (TIPOS_DE_ITEM as readonly string[]).includes(bruto) ? (bruto as TrilhaItemTipo) : TIPO_PADRAO;
}

/**
 * Um item do formulário vira um item de cronograma — ou null, se não houver
 * item nenhum ali.
 *
 * Sem título não existe item: o aluno veria uma linha em branco no dia dele,
 * que não abre nada e não explica nada. É o único campo obrigatório; o resto
 * tem padrão sensato.
 */
export function normalizarItem(bruto: ItemBruto): TrilhaItem | null {
  const titulo = texto(bruto.titulo);
  if (!titulo) return null;

  const refId = texto(bruto.ref_id) || null;

  return {
    tipo: tipoValido(bruto.tipo),
    titulo,
    materia: texto(bruto.materia) || null,
    url: urlValida(bruto.url),
    ref_id: refId,
    // O título foi escrito à mão pelo mentor, então é ele que vale na tela —
    // mesmo que o conteúdo de origem seja renomeado depois em Cursos e Aulas.
    // Sem esta marca, `resolverCronograma` sobrescreveria o nome que o mentor
    // acabou de dar. Só faz sentido quando o item aponta para um conteúdo.
    ...(refId ? { titulo_custom: true } : {})
  };
}

/**
 * A lista inteira de um dia, vinda do JSON do formulário.
 *
 * Devolve sempre um array — inclusive vazio, que é como o mentor esvazia um
 * dia. Entrada inválida não estoura: vira lista vazia, e quem chamou decide
 * se isso é um erro (ver `salvarDiaDaRota`).
 */
export function normalizarItens(entrada: unknown): TrilhaItem[] {
  if (!Array.isArray(entrada)) return [];
  return entrada
    .map((bruto) => normalizarItem((bruto ?? {}) as ItemBruto))
    .filter((item): item is TrilhaItem => item !== null);
}

/** O JSON do formulário, já normalizado. Texto inválido vira lista vazia. */
export function lerItensDoFormulario(json: string): TrilhaItem[] {
  try {
    return normalizarItens(JSON.parse(json));
  } catch {
    return [];
  }
}
