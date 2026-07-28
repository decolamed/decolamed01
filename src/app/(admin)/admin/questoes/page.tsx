import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { QuestoesManager } from "./questoes-manager";
import type { Questao } from "@/types/database";

export default async function AdminQuestoesPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase.from("questoes").select("*").order("created_at", { ascending: false });
  const questoes = (data as Questao[]) ?? [];
  const materiasExistentes = Array.from(new Set(questoes.map((q) => q.materia))).sort();

  return <QuestoesManager questoes={questoes} materiasExistentes={materiasExistentes} />;
}
