import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { CursosManager } from "./cursos-manager";

export default async function AdminCursosPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.from("conteudos_biblioteca").select("*").eq("tipo", "aula").order("materia").order("created_at", { ascending: false });
  return <CursosManager aulas={data ?? []} />;
}
