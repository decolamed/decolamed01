"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { rodarCopiloto } from "@/lib/copiloto/motor";

export async function registrarResposta(questaoId: string, alternativaEscolhida: string) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  // Busca a questão com matéria e assunto — necessários para o Gatilho 0
  // (revisão imediata após erro), que precisa saber exatamente qual assunto
  // o aluno acabou de errar, sem esperar thresholds.
  const { data: questao } = await supabase
    .from("questoes")
    .select("resposta_correta, explicacao, materia, assunto")
    .eq("id", questaoId)
    .single();

  if (!questao) return { ok: false as const };

  const correta = questao.resposta_correta === alternativaEscolhida;

  await supabase.from("respostas_aluno").insert({
    aluno_id: profile.id,
    questao_id: questaoId,
    alternativa_escolhida: alternativaEscolhida,
    correta
  });

  // Passa os dados da questão para o Copiloto — o Gatilho 0 usa isso para
  // criar imediatamente uma recomendação de revisão quando há erro, sem
  // precisar re-consultar o banco para saber qual assunto foi.
  rodarCopiloto({
    alunoId: profile.id,
    ultimaAcao: "questao",
    ultimaResposta: {
      questaoId,
      correta,
      materia: questao.materia,
      assunto: questao.assunto ?? null
    }
  }).catch((e) => console.error("[copiloto] falha no ponto de entrada de questão:", e));

  return {
    ok: true as const,
    correta,
    respostaCorreta: questao.resposta_correta as string,
    explicacao: questao.explicacao as string | null
  };
}
