import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { PdfsManager } from "./pdfs-manager";

export default async function AdminPdfsPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.from("conteudos_biblioteca").select("*").in("tipo", ["pdf", "artigo"]).order("materia").order("created_at", { ascending: false });
  return <PdfsManager pdfs={data ?? []} />;
}
