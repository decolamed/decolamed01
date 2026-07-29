"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { rodarCopiloto } from "@/lib/copiloto/motor";

export async function registrarRevisao(flashcardId: string, lembrou: boolean) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { error } = await supabase.from("flashcard_revisoes").insert({
    aluno_id: profile.id,
    flashcard_id: flashcardId,
    lembrou
  });

  rodarCopiloto({ alunoId: profile.id, ultimaAcao: "flashcard" }).catch((e) =>
    console.error("[copiloto] falha no ponto de entrada de flashcard:", e)
  );

  // Devolve o resultado pra tela poder avisar. Ela NÃO volta o card ao
  // falhar — o aluno já seguiu para o próximo, e rebobinar o baralho no
  // meio da revisão confundiria mais do que ajuda. O aviso existe pra ele
  // saber que aquela revisão não entrou no XP nem nas estatísticas.
  return { ok: !error };
}
