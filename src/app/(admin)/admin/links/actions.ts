"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

const PATH = "/admin/links";

export async function criarLink(titulo: string, url: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim() || !url.trim()) return { ok: false as const, erro: "Preencha título e URL." };
  const { error } = await supabase.from("links_externos").insert({ titulo: titulo.trim(), url: url.trim(), ativo: true, criado_por: admin.id });
  revalidatePath(PATH);
  if (error) return { ok: false as const, erro: "Não foi possível criar o link." };
  return { ok: true as const };
}

export async function alternarAtivoLink(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("links_externos").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(PATH);
}

export async function excluirLink(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("links_externos").delete().eq("id", id);
  revalidatePath(PATH);
  return { ok: !error };
}
