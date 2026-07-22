"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function marcarNotificacaoLida(notificacaoId: string) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  // A cláusula .eq("usuario_id", ...) aqui é redundante com a RLS
  // ("notificacoes_update_own"), mas deixa explícito o que a query faz e
  // evita depender só da política de segurança pra impedir marcar
  // notificação de outra pessoa como lida.
  await supabase.from("notificacoes").update({ lida: true }).eq("id", notificacaoId).eq("usuario_id", profile.id);
}
