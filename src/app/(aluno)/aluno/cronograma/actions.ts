"use server";

import { revalidatePath } from "next/cache";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

// Devolve o resultado porque as duas telas que marcam missão fazem
// atualização otimista: elas riscam o item antes da resposta do servidor.
// Sem saber que a gravação falhou, o aluno via a missão como concluída e ela
// voltava sozinha no próximo carregamento — parecendo que o app "perdeu" o
// progresso.
export async function marcarMissaoConcluida(id: string, concluida: boolean) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const { error } = await supabase
    .from("aluno_missoes")
    .update({
      concluida,
      concluida_em: concluida ? new Date().toISOString() : null
    })
    .eq("id", id)
    .eq("aluno_id", profile.id); // dupla proteção junto com RLS
  revalidatePath("/aluno/cronograma");
  revalidatePath("/aluno");
  return { ok: !error };
}
