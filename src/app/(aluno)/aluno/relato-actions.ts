"use server";

import { revalidatePath } from "next/cache";
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

  if (error) {
    // Sem isto o relato se perdia em silêncio: o aluno via "enviado" e o
    // admin nunca recebia nada. O motivo real fica no log do servidor.
    console.error("Falha ao gravar relato de erro:", error.message);
    return { ok: false as const };
  }

  // Invalida a fila do admin na hora: a tela é dinâmica, mas o painel pode
  // ter servido uma versão anterior e o relato só apareceria no próximo
  // acesso — que é exatamente o "não chega no painel" relatado.
  revalidatePath("/admin/relatos");
  revalidatePath("/admin");

  return { ok: true as const };
}
