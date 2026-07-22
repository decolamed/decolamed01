"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

const PATH = "/admin/questoes";
const LETRAS = ["a", "b", "c", "d", "e"] as const;
const DIFICULDADE_PARA_BANCO: Record<string, string> = { Fácil: "facil", Média: "media", Difícil: "dificil" };

export interface QuestaoForm {
  id?: string;
  enunciado: string;
  materia: string;
  assunto: string;
  dificuldade: "Fácil" | "Média" | "Difícil";
  gabarito: string;
  comentario: string;
  fonte?: string;
  alternativas: Record<string, string>; // { a: "texto", b: "texto", ... }
}

export async function salvarQuestao(form: QuestaoForm) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const alternativas = LETRAS.map((letra) => ({ id: letra, texto: (form.alternativas[letra] ?? "").trim() })).filter(
    (a) => a.texto.length > 0
  );

  if (!form.enunciado.trim()) return { ok: false as const, erro: "Preencha o enunciado." };
  if (alternativas.length < 2) return { ok: false as const, erro: "Cadastre pelo menos 2 alternativas." };
  if (!alternativas.some((a) => a.id === form.gabarito)) {
    return { ok: false as const, erro: "O gabarito precisa ser uma das alternativas preenchidas." };
  }

  const payload = {
    enunciado: form.enunciado.trim(),
    materia: form.materia,
    assunto: form.assunto.trim() || null,
    dificuldade: DIFICULDADE_PARA_BANCO[form.dificuldade] ?? "media",
    resposta_correta: form.gabarito,
    explicacao: form.comentario.trim() || null,
    fonte: form.fonte?.trim() || null,
    alternativas
  };

  const { error } = form.id
    ? await supabase.from("questoes").update(payload).eq("id", form.id)
    : await supabase.from("questoes").insert({ ...payload, ativo: true, criado_por: admin.id });

  revalidatePath(PATH);
  if (error) return { ok: false as const, erro: "Não foi possível salvar a questão." };
  return { ok: true as const };
}

export async function excluirQuestao(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("questoes").delete().eq("id", id);
  revalidatePath(PATH);
  if (error) return { ok: false as const, erro: "Não foi possível excluir (pode ter respostas de alunos vinculadas)." };
  return { ok: true as const };
}
