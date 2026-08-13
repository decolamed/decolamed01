import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { EstudosBotoesManager } from "./estudos-botoes-manager";
import type { EstudosBotao } from "@/types/database";

export default async function AdminEstudosPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  // Os cursos vêm do cadastro de planos — a mesma tabela que decide o acesso
  // ao Copiloto. Nenhuma lista de curso escrita no código.
  const [{ data }, { data: planos }] = await Promise.all([
    supabase.from("estudos_botoes").select("*").order("ordem").order("created_at", { ascending: false }),
    supabase.from("planos").select("id, nome").eq("ativo", true).order("nome")
  ]);
  return (
    <EstudosBotoesManager
      botoes={(data as EstudosBotao[]) ?? []}
      cursos={(planos as { id: string; nome: string }[]) ?? []}
    />
  );
}
