import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { LinksManager } from "./links-manager";
import { listaOuVazio } from "@/lib/supabase/resultado";

export default async function AdminLinksPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const data = listaOuVazio(await supabase.from("links_externos").select("*").order("ordem").order("created_at", { ascending: false }), "links externos");
  return <LinksManager links={data ?? []} />;
}
