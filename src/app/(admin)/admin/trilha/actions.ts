"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import type { TrilhaItem } from "@/types/database";

const PATH = "/admin/trilha";

const LABEL_TIPO: Record<TrilhaItem["tipo"], string> = {
  aula: "Aula",
  pdf: "PDF",
  link: "Link",
  questoes: "Questões",
  simulado: "Simulado",
  flashcards: "Flashcards",
  revisao: "Revisão",
  redacao: "Redação",
  leitura: "Leitura",
  atividade: "Atividade"
};

// Deriva o texto simples exibido nos lugares que só leem `atividades`
// (mesma lógica de compatibilidade usada em /admin/cronograma).
function descreverItem(item: TrilhaItem): string {
  if (item.tipo === "questoes" || item.tipo === "flashcards") {
    return `${LABEL_TIPO[item.tipo]} · ${item.materia ?? ""}`.trim();
  }
  return item.titulo;
}

export async function salvarDiaTrilha(diaNumero: number, titulo: string, itens: TrilhaItem[]) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("trilha_dias").upsert(
    {
      dia_numero: diaNumero,
      titulo: titulo.trim() || `Dia ${diaNumero}`,
      itens,
      atividades: itens.map(descreverItem)
    },
    { onConflict: "dia_numero" }
  );

  revalidatePath(PATH);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  return { ok: !error };
}

export async function removerDiaTrilha(diaNumero: number) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("trilha_dias").delete().eq("dia_numero", diaNumero);

  revalidatePath(PATH);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  return { ok: !error };
}
