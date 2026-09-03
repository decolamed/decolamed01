import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com service role: IGNORA a RLS por completo.
 *
 * Existe só para operações que não têm dono — hoje, mudar o plano de alguém
 * depois de um pagamento. Toda vez que for usado, o filtro por usuário passa a
 * ser responsabilidade de quem escreveu a consulta, e não mais do banco.
 *
 * Nunca importe isto de um componente de cliente: a chave vazaria no bundle.
 */
export function criarClienteAdmin() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error("SUPABASE_SERVICE_ROLE_KEY não está definida.");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
