"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import type { AlunoMissaoTipo } from "@/types/database";

// Cronograma individual de um aluno específico (aluno_missoes) — não mexe
// em trilha_dias (o cronograma geral, compartilhado por todo mundo sem
// Copiloto). decola-app.tsx passa a usar essas missões em vez do
// cronograma compartilhado assim que o aluno tiver pelo menos uma (ver scrPlano()).
export async function adicionarMissaoIndividual(alunoId: string, formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const data = String(formData.get("data") ?? "").trim();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "livre") as AlunoMissaoTipo;
  const materia = String(formData.get("materia") ?? "").trim() || null;
  const duracao = Number(formData.get("duracao") ?? 30) || 30;

  if (!data || !titulo) {
    redirect(`/admin/usuarios/${alunoId}?erro=${encodeURIComponent("Informe a data e o título da missão.")}`);
  }

  const { error } = await supabase.from("aluno_missoes").insert({
    aluno_id: alunoId,
    data,
    titulo,
    tipo,
    materia,
    duracao_minutos: duracao,
    prioridade: 1,
    origem: "admin",
    concluida: false
  });

  revalidatePath(`/admin/usuarios/${alunoId}`);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  if (error) {
    redirect(`/admin/usuarios/${alunoId}?erro=${encodeURIComponent("Não foi possível adicionar a missão.")}`);
  }
  redirect(`/admin/usuarios/${alunoId}?sucesso=${encodeURIComponent("Missão adicionada ao cronograma individual.")}`);
}

export async function excluirMissaoIndividual(alunoId: string, missaoId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("aluno_missoes").delete().eq("id", missaoId).eq("aluno_id", alunoId);
  revalidatePath(`/admin/usuarios/${alunoId}`);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  redirect(`/admin/usuarios/${alunoId}?sucesso=${encodeURIComponent("Missão removida.")}`);
}
