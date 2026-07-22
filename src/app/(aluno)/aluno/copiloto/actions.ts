"use server";

import { revalidatePath } from "next/cache";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function marcarRecomendacao(id: string, novoStatus: "concluida" | "descartada") {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  await supabase
    .from("copiloto_recomendacoes")
    .update({
      status: novoStatus,
      concluida_em: novoStatus === "concluida" ? new Date().toISOString() : null
    })
    .eq("id", id)
    .eq("aluno_id", profile.id); // dupla proteção junto com a RLS
  revalidatePath("/aluno/copiloto");
  revalidatePath("/aluno");
}
