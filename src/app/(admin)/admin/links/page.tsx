import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { LinksManager } from "./links-manager";

export default async function AdminLinksPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.from("links_externos").select("*").order("ordem").order("created_at", { ascending: false });
  return <LinksManager links={data ?? []} />;
}
