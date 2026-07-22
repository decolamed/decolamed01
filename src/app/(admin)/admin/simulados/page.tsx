import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { SimuladosManager } from "./simulados-manager";
import type { Simulado } from "@/types/database";

export default async function AdminSimuladosPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: simuladosData } = await supabase.from("simulados").select("*").order("created_at", { ascending: false });
  const simulados = (simuladosData as Simulado[]) ?? [];

  const { data: contagens } = await supabase.from("simulado_questoes").select("simulado_id");
  const totalQuestoesPorId: Record<string, number> = {};
  (contagens ?? []).forEach((c: any) => {
    totalQuestoesPorId[c.simulado_id] = (totalQuestoesPorId[c.simulado_id] ?? 0) + 1;
  });

  return <SimuladosManager simulados={simulados} totalQuestoesPorId={totalQuestoesPorId} />;
}
