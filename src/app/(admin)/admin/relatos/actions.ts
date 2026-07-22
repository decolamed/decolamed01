"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

const PATH = "/admin/relatos";

export async function marcarRelatoResolvido(id: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("relatos_erro")
    .update({ status: "resolvido", respondido_por: admin.id, respondido_em: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(PATH);
  return { ok: !error };
}

export async function excluirRelato(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("relatos_erro").delete().eq("id", id);
  revalidatePath(PATH);
  return { ok: !error };
}
