import type { SupabaseClient } from "@supabase/supabase-js";

// Tipos de evento registrados em historico_admin. Mantido como union de
// strings (não enum no banco) para não exigir migração toda vez que um novo
// tipo de ação administrativa for adicionado.
export type TipoHistoricoAdmin =
  | "matricula_criada_manual"
  | "convite_reenviado"
  | "senha_redefinicao_reenviada"
  | "usuario_desativado"
  | "usuario_reativado"
  | "usuario_promovido_admin"
  | "usuario_rebaixado_admin"
  | "usuario_promovido_parceiro"
  | "usuario_rebaixado_parceiro";

/**
 * Grava uma linha de auditoria. Nunca deve derrubar a ação principal caso
 * falhe — por isso o erro é apenas logado, e não propagado.
 */
export async function registrarHistoricoAdmin(
  supabase: SupabaseClient,
  params: {
    tipo: TipoHistoricoAdmin;
    usuarioAlvoId?: string | null;
    adminId: string;
    detalhes?: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from("historico_admin").insert({
    tipo: params.tipo,
    usuario_alvo_id: params.usuarioAlvoId ?? null,
    admin_id: params.adminId,
    detalhes: params.detalhes ?? {}
  });

  if (error) {
    console.error("Falha ao registrar historico_admin:", error);
  }
}
