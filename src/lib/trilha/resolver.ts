import { createAdminClient } from "@/lib/supabase/server";
import type { TrilhaDia, TrilhaItem } from "@/types/database";

// ============================================================================
// RESOLUÇÃO DOS ITENS DO CRONOGRAMA
//
// Um item do cronograma guarda uma CÓPIA do título e da URL do conteúdo, para
// o dia poder ser renderizado sem join. O efeito colateral é que corrigir o
// link de uma aula em "Cursos e Aulas" não chegava ao cronograma: o item
// continuava apontando para o vídeo antigo, e as duas telas divergiam em
// silêncio. É exatamente a dessincronização que a Alteração 6 descreve.
//
// A regra aqui é: quando o item tem `ref_id`, o registro em
// conteudos_biblioteca é a fonte da verdade — menos pelo título, se o admin
// tiver personalizado ("Bagagem Essencial — Livro 1" exibido como "Resumo do
// Livro 1", da Alteração 3). Por isso `titulo_custom`: sem essa marca não há
// como distinguir um título personalizado de uma cópia desatualizada.
// ============================================================================

export interface ConteudoResolvido {
  id: string;
  titulo: string;
  url: string | null;
  materia: string;
  ativo: boolean;
}

export function resolverItem(item: TrilhaItem, fonte: Map<string, ConteudoResolvido>): TrilhaItem {
  if (!item.ref_id) return item;
  const conteudo = fonte.get(item.ref_id);
  if (!conteudo) return item;
  return {
    ...item,
    // URL e matéria sempre vêm do registro: são dados técnicos, e uma cópia
    // velha aqui significa link quebrado na mão do aluno.
    url: conteudo.url ?? item.url,
    materia: conteudo.materia ?? item.materia,
    titulo: item.titulo_custom ? item.titulo : conteudo.titulo
  };
}

export function resolverDias(dias: TrilhaDia[], fonte: Map<string, ConteudoResolvido>): TrilhaDia[] {
  return dias.map((d) => ({ ...d, itens: (d.itens ?? []).map((i) => resolverItem(i, fonte)) }));
}

/**
 * Carrega da biblioteca todos os conteúdos referenciados pelos dias e devolve
 * os dias já resolvidos. Uma consulta só, por mais dias que existam.
 */
export async function resolverCronograma(dias: TrilhaDia[]): Promise<TrilhaDia[]> {
  const ids = Array.from(
    new Set(dias.flatMap((d) => (d.itens ?? []).map((i) => i.ref_id).filter((x): x is string => !!x)))
  );
  if (ids.length === 0) return dias;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("conteudos_biblioteca")
    .select("id, titulo, url, materia, ativo")
    .in("id", ids);

  const fonte = new Map<string, ConteudoResolvido>();
  ((data as ConteudoResolvido[]) ?? []).forEach((c) => fonte.set(c.id, c));
  return resolverDias(dias, fonte);
}
