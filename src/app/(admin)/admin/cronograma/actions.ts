"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import type { CronogramaItem } from "@/types/database";

const PATH = "/admin/cronograma";

const LABEL_TIPO: Record<CronogramaItem["tipo"], string> = {
  aula: "Aula",
  pdf: "PDF",
  link: "Link",
  questoes: "Questões",
  simulado: "Simulado",
  flashcards: "Flashcards"
};

// Deriva o texto simples exibido nos lugares que só leem `atividades`
// (compatibilidade) a partir dos itens estruturados.
function descreverItem(item: CronogramaItem): string {
  const materia = item.materia ? ` · ${item.materia}` : "";
  return `${LABEL_TIPO[item.tipo]} · ${item.titulo}${item.tipo === "questoes" || item.tipo === "flashcards" ? materia : ""}`;
}

export async function salvarDiaComItens(diaSemana: number, titulo: string, itens: CronogramaItem[]) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("cronograma_dias").upsert(
    {
      dia_semana: diaSemana,
      titulo: titulo.trim() || "Missão do dia",
      itens,
      atividades: itens.map(descreverItem)
    },
    { onConflict: "dia_semana" }
  );

  revalidatePath(PATH);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  return { ok: !error };
}
