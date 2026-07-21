"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

/**
 * Registra a resposta do aluno e diz se acertou — a checagem sempre roda
 * aqui no servidor, buscando a resposta_correta de verdade no banco. O
 * client component nunca recebe qual é a alternativa certa antes de
 * responder, e não há como "trapacear" alterando o JavaScript no navegador.
 */
export async function registrarResposta(questaoId: string, alternativaEscolhida: string) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { data: questao } = await supabase
    .from("questoes")
    .select("resposta_correta, explicacao")
    .eq("id", questaoId)
    .single();

  if (!questao) {
    return { ok: false as const };
  }

  const correta = questao.resposta_correta === alternativaEscolhida;

  await supabase.from("respostas_aluno").insert({
    aluno_id: profile.id,
    questao_id: questaoId,
    alternativa_escolhida: alternativaEscolhida,
    correta
  });

  return {
    ok: true as const,
    correta,
    respostaCorreta: questao.resposta_correta as string,
    explicacao: questao.explicacao as string | null
  };
}
