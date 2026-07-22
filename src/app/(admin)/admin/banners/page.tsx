import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { BannersManager } from "./banners-manager";

export default async function AdminBannersPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.from("banners").select("*").order("ordem").order("created_at", { ascending: false });
  return <BannersManager banners={data ?? []} />;
}
