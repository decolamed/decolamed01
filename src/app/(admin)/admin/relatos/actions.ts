"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import type { StatusRelato } from "@/lib/site/relatos";

const PATH = "/admin/relatos";

/**
 * Move o relato entre os três estados do fluxo.
 *
 * Antes existia só `marcarRelatoResolvido`: caminho de mão única. Como a tela
 * filtrava por "pendente", marcar como resolvido fazia o relato DESAPARECER —
 * não havia "em análise", não havia como desfazer e não havia histórico.
 */
export async function alterarStatusRelato(id: string, status: StatusRelato) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const resolvido = status === "resolvido";
  const { error } = await supabase
    .from("relatos_erro")
    .update({
      status,
      // Quem resolveu e quando só fazem sentido no estado final. Voltar para
      // pendente/em análise limpa os dois, senão o relato carregaria um
      // "resolvido por" que não corresponde ao estado atual.
      respondido_por: resolvido ? admin.id : null,
      respondido_em: resolvido ? new Date().toISOString() : null
    })
    .eq("id", id);

  revalidatePath(PATH);
  return { ok: !error };
}

export async function excluirRelato(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("relatos_erro").delete().eq("id", id);
  revalidatePath(PATH);
  return { ok: !error };
}
