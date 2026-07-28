"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

const SENTIMENTOS_VALIDOS = new Set(["Domínio", "Atenção", "Turbulência"]);
const MATERIAS_PADRAO = [
  "Biologia",
  "Química",
  "Física",
  "Matemática",
  "Português",
  "História",
  "Geografia"
];

/**
 * Salva o briefing do aluno (recebe todos os dados dos 3 passos de uma vez).
 * Espera:
 *   data_prova, inicio_estudos, dias_por_semana, horas_por_dia,
 *   sentimento_<Materia> = "Domínio" | "Atenção" | "Turbulência"
 */
export async function salvarBriefing(formData: FormData) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const dataProva = String(formData.get("data_prova") ?? "").trim();
  const inicioEstudos = String(formData.get("inicio_estudos") ?? "").trim() || null;
  const diasPorSemana = Number(formData.get("dias_por_semana") ?? 5);
  const horasPorDia = Number(formData.get("horas_por_dia") ?? 3);
  const observacoes = String(formData.get("observacoes") ?? "").trim() || null;

  // sentimentos por matéria
  const sentimentos: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("sentimento_")) continue;
    const materia = k.replace("sentimento_", "");
    const valor = String(v);
    if (SENTIMENTOS_VALIDOS.has(valor)) sentimentos[materia] = valor;
  }

  if (!dataProva) {
    redirect(`/aluno/briefing?erro=${encodeURIComponent("Informe a data da prova.")}`);
  }
  if (diasPorSemana < 1 || diasPorSemana > 7) {
    redirect(`/aluno/briefing?erro=${encodeURIComponent("Dias por semana precisa estar entre 1 e 7.")}`);
  }
  if (horasPorDia < 1 || horasPorDia > 12) {
    redirect(`/aluno/briefing?erro=${encodeURIComponent("Horas por dia precisa estar entre 1 e 12.")}`);
  }

  // Compatibilidade com colunas antigas (dias_estuda / horas_por_dia_semana /
  // horas_por_dia_fim_semana): guardamos o mesmo número em ambos e todos os
  // dias marcados, pra não quebrar código que já lê essas colunas.
  const DIAS_ORDEM = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  // seleciona os N primeiros dias úteis: seg, ter, qua, qui, sex, sab, dom
  const ORDEM_ESTUDO = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
  const diasEstuda = ORDEM_ESTUDO.slice(0, diasPorSemana);
  void DIAS_ORDEM;

  const { error } = await supabase.from("aluno_briefing").upsert(
    {
      aluno_id: profile.id,
      data_prova: dataProva,
      inicio_estudos: inicioEstudos,
      horas_por_dia_semana: horasPorDia,
      horas_por_dia_fim_semana: horasPorDia,
      dias_estuda: diasEstuda,
      sentimentos,
      observacoes
    },
    { onConflict: "aluno_id" }
  );

  if (error) {
    redirect(`/aluno/briefing?erro=${encodeURIComponent("Não foi possível salvar o briefing.")}`);
  }

  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  redirect("/aluno/tutorial");
}

export { MATERIAS_PADRAO };
