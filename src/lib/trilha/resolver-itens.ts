import type { TrilhaDia, TrilhaItem } from "@/types/database";
import { aplicarLinksDosResumos, type LinksDosResumos } from "@/lib/site/resumos-livros";

// ============================================================================
// RESOLUÇÃO DOS ITENS DO CRONOGRAMA — a parte pura
//
// Um item do cronograma guarda uma CÓPIA do título e da URL do conteúdo, para
// o dia poder ser renderizado sem join. O efeito colateral é que corrigir o
// link de uma aula em "Cursos e Aulas" não chegava ao cronograma: o item
// continuava apontando para o vídeo antigo, e as duas telas divergiam em
// silêncio.
//
// A regra aqui é: quando o item tem `ref_id`, o registro em
// conteudos_biblioteca é a fonte da verdade — menos pelo título, se o admin
// tiver personalizado ("Bagagem Essencial — Livro 1" exibido como "Resumo do
// Livro 1"). Por isso `titulo_custom`: sem essa marca não há como distinguir
// um título personalizado de uma cópia desatualizada.
//
// Este arquivo não conhece o Supabase. Quem busca os dados é `resolver.ts`,
// que importa `next/headers` e por isso não roda fora do Next — deixar as
// funções puras aqui é o que permite testá-las.
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

export function resolverDias(
  dias: TrilhaDia[],
  fonte: Map<string, ConteudoResolvido>,
  /**
   * Endereços dos quatro resumos de livro, vindos de `configuracoes`.
   *
   * Aplicados DEPOIS da biblioteca e com precedência sobre ela: o painel é a
   * fonte oficial desses quatro links, e é ele que precisa valer em qualquer
   * cronograma — template, rota do Voo Guiado, plano Decolando. Ver
   * lib/site/resumos-livros.ts.
   */
  linksDosResumos: LinksDosResumos = {}
): TrilhaDia[] {
  return dias.map((d) => ({
    ...d,
    itens: aplicarLinksDosResumos(
      (d.itens ?? []).map((i) => resolverItem(i, fonte)),
      linksDosResumos
    )
  }));
}
