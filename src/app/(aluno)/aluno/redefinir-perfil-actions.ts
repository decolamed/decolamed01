"use server";

import { revalidatePath } from "next/cache";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { rodarCopiloto } from "@/lib/copiloto/motor";

/**
 * Zera o histórico de estudo do aluno e reconstrói o perfil a partir do
 * briefing.
 *
 * Apaga: respostas, revisões de flashcards, tentativas de simulado e de
 * atividade, progresso de itens, missões, e tudo que o Copiloto tinha
 * adaptado (recomendações, eventos, check-ins, produções de IA).
 *
 * Preserva: cadastro, matrícula, plano, créditos de redação, relatos — e o
 * briefing, que é justamente a base usada para gerar o perfil de novo.
 *
 * A remoção acontece dentro de uma função no banco (redefinir_perfil_aluno)
 * para ser atômica: apagar metade das tabelas deixaria o aluno num estado
 * pior do que o de antes.
 */
export async function redefinirPerfilAluno(): Promise<{ ok: true } | { ok: false; erro: string }> {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { error } = await supabase.rpc("redefinir_perfil_aluno", { p_aluno_id: profile.id });

  if (error) {
    console.error("Falha ao redefinir perfil do aluno:", error.message);
    return { ok: false, erro: "Não foi possível redefinir seu perfil. Tente de novo." };
  }

  // Com o histórico zerado, o Copiloto remonta as missões a partir do
  // briefing. Se falhar, o perfil continua zerado e válido — a próxima
  // rodada do Copiloto reconstrói —, então não é motivo para dizer ao aluno
  // que a redefinição não funcionou.
  try {
    await rodarCopiloto({ alunoId: profile.id });
  } catch (e) {
    console.error("Copiloto não conseguiu regerar o perfil agora:", e);
  }

  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  return { ok: true };
}
