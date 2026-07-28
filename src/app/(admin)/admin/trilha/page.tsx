import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { TrilhaManager } from "./trilha-manager";
import type { TrilhaDia } from "@/types/database";

export default async function AdminTrilhaPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: dias } = await supabase.from("trilha_dias").select("*").order("dia_numero");

  return <TrilhaManager dias={(dias as TrilhaDia[]) ?? []} />;
}
