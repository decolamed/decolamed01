import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { PdfsManager } from "./pdfs-manager";
import { listaOuVazio } from "@/lib/supabase/resultado";

export default async function AdminPdfsPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const data = listaOuVazio(await supabase.from("conteudos_biblioteca").select("*").in("tipo", ["pdf", "artigo"]).order("materia").order("created_at", { ascending: false }), "PDFs e artigos");
  return <PdfsManager pdfs={data ?? []} />;
}
