import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AtividadesManager } from "./atividades-manager";
import type { Atividade } from "@/types/database";

export default async function AdminAtividadesPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: atividades } = await supabase.from("atividades").select("*").order("created_at", { ascending: false });
  const ids = (atividades ?? []).map((a: any) => a.id);

  const { data: questoesData } =
    ids.length > 0 ? await supabase.from("atividade_questoes").select("atividade_id").in("atividade_id", ids) : { data: [] as any[] };

  const totalPorId: Record<string, number> = {};
  (questoesData ?? []).forEach((q: any) => {
    totalPorId[q.atividade_id] = (totalPorId[q.atividade_id] ?? 0) + 1;
  });

  return <AtividadesManager atividades={(atividades as Atividade[]) ?? []} totalQuestoesPorId={totalPorId} />;
}
