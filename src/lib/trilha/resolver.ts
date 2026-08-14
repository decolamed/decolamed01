import { createAdminClient } from "@/lib/supabase/server";
import type { TrilhaDia } from "@/types/database";
import { lerLinksDosResumos, CHAVES_DOS_RESUMOS } from "@/lib/site/resumos-livros";
import { resolverDias, type ConteudoResolvido } from "./resolver-itens";

// ============================================================================
// RESOLUÇÃO DOS ITENS DO CRONOGRAMA — a parte que vai ao banco
//
// A lógica pura mora em `resolver-itens.ts` (e é testada lá). Aqui fica só a
// busca: a biblioteca referenciada pelos itens e os quatro links dos resumos.
// Reexportados para os chamadores continuarem importando de um lugar só.
// ============================================================================

export { resolverItem, resolverDias } from "./resolver-itens";
export type { ConteudoResolvido } from "./resolver-itens";

/**
 * Carrega da biblioteca todos os conteúdos referenciados pelos dias e devolve
 * os dias já resolvidos. Uma consulta só, por mais dias que existam.
 */
export async function resolverCronograma(dias: TrilhaDia[]): Promise<TrilhaDia[]> {
  const ids = Array.from(
    new Set(dias.flatMap((d) => (d.itens ?? []).map((i) => i.ref_id).filter((x): x is string => !!x)))
  );

  const supabase = createAdminClient();

  // Os links dos resumos são buscados SEMPRE, mesmo sem nenhum `ref_id` na
  // lista: os quatro itens de leitura do template não têm ref_id nenhum, e
  // era exatamente por isso que a função retornava cedo e eles chegavam ao
  // aluno sem endereço.
  const [conteudos, configs] = await Promise.all([
    ids.length > 0
      ? supabase.from("conteudos_biblioteca").select("id, titulo, url, materia, ativo").in("id", ids)
      : Promise.resolve({ data: [] as ConteudoResolvido[] }),
    supabase.from("configuracoes").select("chave, valor").in("chave", CHAVES_DOS_RESUMOS)
  ]);

  const fonte = new Map<string, ConteudoResolvido>();
  ((conteudos.data as ConteudoResolvido[]) ?? []).forEach((c) => fonte.set(c.id, c));
  return resolverDias(dias, fonte, lerLinksDosResumos(configs.data as { chave: string; valor: unknown }[]));
}
