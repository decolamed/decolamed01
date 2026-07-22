"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function enviarRelatoErro(mensagem: string, categoria: string) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const mensagemCompleta = `[${categoria}] ${mensagem}`;
  const { error } = await supabase.from("relatos_erro").insert({
    aluno_id: profile.id,
    mensagem: mensagemCompleta
  });

  return { ok: !error };
}
