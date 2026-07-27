"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import type { AtividadeGabaritoModo } from "@/types/database";

const PATH = "/admin/atividades";

export async function criarAtividade(titulo: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  if (!titulo.trim()) return { ok: false as const, erro: "Informe um título." };

  const { data, error } = await supabase
    .from("atividades")
    .insert({ titulo: titulo.trim(), ativo: false, criado_por: admin.id })
    .select("id")
    .single();

  revalidatePath(PATH);
  if (error || !data) return { ok: false as const, erro: "Não foi possível criar a atividade." };
  return { ok: true as const, id: data.id as string };
}

export async function salvarMetadadosAtividade(
  id: string,
  dados: { titulo: string; materia: string; descricao: string; gabaritoModo: AtividadeGabaritoModo; tempoLimiteMinutos: number | null; pesoFacape: number }
) {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!dados.titulo.trim()) return { ok: false as const, erro: "Informe um título." };

  const { error } = await supabase
    .from("atividades")
    .update({
      titulo: dados.titulo.trim(),
      materia: dados.materia.trim() || null,
      descricao: dados.descricao.trim() || null,
      gabarito_modo: dados.gabaritoModo,
      tempo_limite_minutos: dados.tempoLimiteMinutos,
      peso_facape: dados.pesoFacape
    })
    .eq("id", id);

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  return { ok: !error };
}

export async function alternarAtivoAtividade(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("atividades").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(PATH);
  return { ok: !error };
}

export async function excluirAtividade(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("atividades").delete().eq("id", id);
  revalidatePath(PATH);
  return { ok: !error };
}
