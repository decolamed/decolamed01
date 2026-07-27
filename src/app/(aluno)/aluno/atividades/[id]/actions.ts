"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export interface ItemGabaritoAtividade {
  questaoId: string;
  enunciado: string;
  alternativas: { id: string; texto: string }[];
  respostaCorreta: string;
  escolhida: string | null;
  correta: boolean;
  explicacao: string | null;
}

export interface ResultadoAtividade {
  acertos: number;
  total: number;
  nota: number; // 0-100
  pesoFacape: number;
  gabarito: ItemGabaritoAtividade[];
}

// Corrige uma única questão na hora — usada só quando gabarito_modo é
// 'imediato' (mesma checagem seria feita de novo, sem gravar, quando a
// atividade inteira for enviada em submeterAtividade()).
export async function corrigirQuestaoAtividade(questaoId: string, alternativaEscolhida: string) {
  await requireAcessoAluno();
  const supabase = createClient();
  const { data: questao } = await supabase
    .from("questoes")
    .select("resposta_correta, explicacao")
    .eq("id", questaoId)
    .maybeSingle();
  if (!questao) return { ok: false as const };
  return {
    ok: true as const,
    correta: alternativaEscolhida === questao.resposta_correta,
    respostaCorreta: questao.resposta_correta as string,
    explicacao: questao.explicacao as string | null
  };
}

// Corrige a atividade inteira no servidor (nunca confia no navegador) e
// grava a tentativa — mesmo espírito de submeterSimulado(), mas numa tabela
// própria (atividade_tentativas), já que Atividades é um módulo separado de
// Simulados de propósito.
export async function submeterAtividade(atividadeId: string, respostas: Record<string, string>) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const [{ data: atividade }, { data: itens }] = await Promise.all([
    supabase.from("atividades").select("peso_facape").eq("id", atividadeId).maybeSingle(),
    supabase
      .from("atividade_questoes")
      .select("questao_id, ordem, questoes(enunciado, alternativas, resposta_correta, explicacao)")
      .eq("atividade_id", atividadeId)
      .order("ordem")
  ]);

  const lista = itens ?? [];
  let acertos = 0;

  const gabarito: ItemGabaritoAtividade[] = lista.map((item: any) => {
    const escolhida = respostas[item.questao_id] ?? null;
    const correta = escolhida !== null && escolhida === item.questoes.resposta_correta;
    if (correta) acertos++;
    return {
      questaoId: item.questao_id,
      enunciado: item.questoes.enunciado,
      alternativas: item.questoes.alternativas,
      respostaCorreta: item.questoes.resposta_correta,
      escolhida,
      correta,
      explicacao: item.questoes.explicacao
    };
  });

  const total = lista.length;
  const nota = total > 0 ? Math.round((acertos / total) * 1000) / 10 : 0;
  const pesoFacape = Number(atividade?.peso_facape ?? 1);

  await supabase.from("atividade_tentativas").insert({
    aluno_id: profile.id,
    atividade_id: atividadeId,
    respostas,
    acertos,
    total,
    nota,
    finalizado_em: new Date().toISOString()
  });

  const resultado: ResultadoAtividade = { acertos, total, nota, pesoFacape, gabarito };
  return resultado;
}
