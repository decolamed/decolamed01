import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { SimuladosManager } from "./simulados-manager";
import type { Simulado } from "@/types/database";
import { listaOuVazio } from "@/lib/supabase/resultado";

export default async function AdminSimuladosPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const simuladosData = listaOuVazio(await supabase.from("simulados").select("*").order("created_at", { ascending: false }), "simulados — simulados");
  const simulados = (simuladosData as Simulado[]) ?? [];

  const contagens = listaOuVazio(await supabase.from("simulado_questoes").select("simulado_id"), "simulados — contagen");
  const totalQuestoesPorId: Record<string, number> = {};
  (contagens ?? []).forEach((c: any) => {
    totalQuestoesPorId[c.simulado_id] = (totalQuestoesPorId[c.simulado_id] ?? 0) + 1;
  });

  return <SimuladosManager simulados={simulados} totalQuestoesPorId={totalQuestoesPorId} />;
}
