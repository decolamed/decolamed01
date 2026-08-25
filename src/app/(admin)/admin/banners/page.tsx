import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { BannersManager } from "./banners-manager";
import { listaOuVazio } from "@/lib/supabase/resultado";

export default async function AdminBannersPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const data = listaOuVazio(await supabase.from("banners").select("*").order("ordem").order("created_at", { ascending: false }), "banners");
  return <BannersManager banners={data ?? []} />;
}
