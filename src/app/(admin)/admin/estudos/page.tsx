import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { EstudosBotoesManager } from "./estudos-botoes-manager";
import type { EstudosBotao } from "@/types/database";

export default async function AdminEstudosPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.from("estudos_botoes").select("*").order("ordem").order("created_at", { ascending: false });
  return <EstudosBotoesManager botoes={(data as EstudosBotao[]) ?? []} />;
}
