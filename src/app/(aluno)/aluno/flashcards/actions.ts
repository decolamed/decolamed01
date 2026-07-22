"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { rodarCopiloto } from "@/lib/copiloto/motor";

export async function registrarRevisao(flashcardId: string, lembrou: boolean) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  await supabase.from("flashcard_revisoes").insert({
    aluno_id: profile.id,
    flashcard_id: flashcardId,
    lembrou
  });

  rodarCopiloto({ alunoId: profile.id, ultimaAcao: "flashcard" }).catch((e) =>
    console.error("[copiloto] falha no ponto de entrada de flashcard:", e)
  );
}
