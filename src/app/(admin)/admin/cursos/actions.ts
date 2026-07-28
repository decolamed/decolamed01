"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

export async function criarConteudo(tipo: "aula" | "pdf", titulo: string, materia: string, assunto: string | null, url: string | null, duracao: number) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim() || !materia.trim()) return { ok: false as const, erro: "Preencha título e matéria." };
  const { error } = await supabase.from("conteudos_biblioteca").insert({
    tipo,
    titulo: titulo.trim(),
    materia: materia.trim(),
    assunto: assunto?.trim() || null,
    url: url?.trim() || null,
    duracao_minutos: duracao,
    ativo: true,
    criado_por: admin.id
  });
  revalidatePath(`/admin/cursos`);
  revalidatePath(`/admin/pdfs`);
  if (error) return { ok: false as const, erro: "Não foi possível criar." };
  return { ok: true as const };
}

export async function alternarAtivoConteudo(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("conteudos_biblioteca").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(`/admin/cursos`);
  revalidatePath(`/admin/pdfs`);
}

export async function excluirConteudo(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("conteudos_biblioteca").delete().eq("id", id);
  revalidatePath(`/admin/cursos`);
  revalidatePath(`/admin/pdfs`);
  return { ok: !error };
}
