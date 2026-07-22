"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

const PATH = "/admin/simulados";

export async function criarSimulado(titulo: string, tempoMinutos: number) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  if (!titulo.trim()) return { ok: false as const, erro: "Informe um título." };

  const { data, error } = await supabase
    .from("simulados")
    .insert({ titulo: titulo.trim(), tempo_minutos: tempoMinutos, ativo: false, criado_por: admin.id })
    .select("id")
    .single();

  revalidatePath(PATH);
  if (error || !data) return { ok: false as const, erro: "Não foi possível criar o simulado." };
  return { ok: true as const, id: data.id as string };
}

export async function alternarAtivoSimulado(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("simulados").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(PATH);
  return { ok: !error };
}

export async function duplicarSimulado(id: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { data: original } = await supabase.from("simulados").select("*").eq("id", id).maybeSingle();
  if (!original) return { ok: false as const, erro: "Simulado não encontrado." };

  const { data: novo, error } = await supabase
    .from("simulados")
    .insert({
      titulo: `${original.titulo} (cópia)`,
      descricao: original.descricao,
      tempo_minutos: original.tempo_minutos,
      ativo: false,
      criado_por: admin.id
    })
    .select("id")
    .single();
  if (error || !novo) return { ok: false as const, erro: "Não foi possível duplicar." };

  const { data: questoesOriginais } = await supabase.from("simulado_questoes").select("questao_id, ordem").eq("simulado_id", id);
  if (questoesOriginais && questoesOriginais.length > 0) {
    await supabase.from("simulado_questoes").insert(
      questoesOriginais.map((q: any) => ({ simulado_id: novo.id, questao_id: q.questao_id, ordem: q.ordem }))
    );
  }

  revalidatePath(PATH);
  return { ok: true as const };
}

export async function excluirSimulado(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("simulados").delete().eq("id", id);
  revalidatePath(PATH);
  return { ok: !error };
}
