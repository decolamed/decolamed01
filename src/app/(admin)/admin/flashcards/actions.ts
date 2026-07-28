"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

const PATH = "/admin/flashcards";

export interface FlashcardForm {
  id?: string;
  frente: string;
  verso: string;
  materia: string;
  assunto: string;
}

export async function salvarFlashcard(form: FlashcardForm) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  if (!form.frente.trim() || !form.verso.trim()) {
    return { ok: false as const, erro: "Preencha frente e verso." };
  }

  const payload = {
    materia: form.materia.trim() || "Geral",
    assunto: form.assunto.trim() || null,
    frente: form.frente.trim(),
    verso: form.verso.trim()
  };

  const { error } = form.id
    ? await supabase.from("flashcards").update(payload).eq("id", form.id)
    : await supabase.from("flashcards").insert({ ...payload, ativo: true, criado_por: admin.id });

  revalidatePath(PATH);
  if (error) return { ok: false as const, erro: "Não foi possível salvar o flashcard." };
  return { ok: true as const };
}

// Importação em massa (via texto colado ou PDF — ver parse-flashcards.ts e
// pdf-actions.ts), mesmo padrão de salvarQuestoesEmLote().
export async function salvarFlashcardsEmLote(forms: FlashcardForm[]) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  let sucesso = 0;
  let falha = 0;
  for (const form of forms) {
    if (!form.frente.trim() || !form.verso.trim()) {
      falha++;
      continue;
    }
    const { error } = await supabase.from("flashcards").insert({
      materia: form.materia.trim() || "Geral",
      assunto: form.assunto.trim() || null,
      frente: form.frente.trim(),
      verso: form.verso.trim(),
      ativo: true,
      criado_por: admin.id
    });
    if (error) falha++;
    else sucesso++;
  }

  revalidatePath(PATH);
  return { sucesso, falha };
}

export async function excluirFlashcard(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("flashcards").delete().eq("id", id);
  revalidatePath(PATH);
  if (error) return { ok: false as const, erro: "Não foi possível excluir (pode ter revisões de alunos vinculadas)." };
  return { ok: true as const };
}
