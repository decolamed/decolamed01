"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { nomeDaTela } from "@/lib/site/telas";

export async function enviarRelatoErro(mensagem: string, categoria: string, tela?: string) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const texto = mensagem.trim();
  if (!texto) return { ok: false as const };

  const mensagemCompleta = `[${categoria}] ${texto}`;
  const { error } = await supabase.from("relatos_erro").insert({
    aluno_id: profile.id,
    mensagem: mensagemCompleta,
    // A tela já era mostrada ao aluno no bloco "enviado automaticamente com o
    // relato", mas nunca chegava ao banco — o admin recebia o chamado sem ela.
    pagina: nomeDaTela(tela)
  });

  return { ok: !error };
}
