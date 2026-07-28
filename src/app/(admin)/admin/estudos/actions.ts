"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import type { EstudosBotaoTipo } from "@/types/database";

const PATH = "/admin/estudos";

export async function criarBotaoEstudos(titulo: string, icone: string, tipo: EstudosBotaoTipo, link: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim() || !link.trim()) return { ok: false as const, erro: "Preencha nome e link." };
  const { error } = await supabase
    .from("estudos_botoes")
    .insert({ titulo: titulo.trim(), icone, tipo, link: link.trim(), ativo: true, criado_por: admin.id });
  revalidatePath(PATH);
  revalidatePath("/aluno");
  if (error) return { ok: false as const, erro: "Não foi possível criar o botão." };
  return { ok: true as const };
}

export async function alternarAtivoBotaoEstudos(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("estudos_botoes").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(PATH);
  revalidatePath("/aluno");
}

export async function excluirBotaoEstudos(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("estudos_botoes").delete().eq("id", id);
  revalidatePath(PATH);
  revalidatePath("/aluno");
  return { ok: !error };
}
