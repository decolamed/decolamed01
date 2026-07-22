"use server";

import { revalidatePath } from "next/cache";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function marcarMissaoConcluida(id: string, concluida: boolean) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  await supabase
    .from("aluno_missoes")
    .update({
      concluida,
      concluida_em: concluida ? new Date().toISOString() : null
    })
    .eq("id", id)
    .eq("aluno_id", profile.id); // dupla proteção junto com RLS
  revalidatePath("/aluno/cronograma");
  revalidatePath("/aluno");
}
