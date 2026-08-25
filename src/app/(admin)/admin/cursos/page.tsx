import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { CursosManager } from "./cursos-manager";
import { listaOuVazio } from "@/lib/supabase/resultado";

export default async function AdminCursosPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const data = listaOuVazio(await supabase.from("conteudos_biblioteca").select("*").eq("tipo", "aula").order("materia").order("created_at", { ascending: false }), "cursos e aulas");
  return <CursosManager aulas={data ?? []} />;
}
