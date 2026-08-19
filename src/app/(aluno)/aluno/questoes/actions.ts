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

  // O erro deste insert era descartado. Quando ele falha, o aluno vê
  // "acertou/errou" e a explicação normalmente, mas a resposta não existe no
  // banco: XP, precisão, Raio X, ranking e o histórico do Copiloto passam a
  // contar uma questão a menos, sem nenhum sinal na tela nem no log. É a
  // falha silenciosa mais cara da plataforma, porque corrompe justamente os
  // números em que aluno e mentor confiam para decidir o que estudar.
  const { error: erroDoRegistro } = await supabase.from("respostas_aluno").insert({
    aluno_id: profile.id,
    questao_id: questaoId,
    alternativa_escolhida: alternativaEscolhida,
    correta
  });

  if (erroDoRegistro) {
    console.error(
      `Resposta não registrada (aluno ${profile.id}, questão ${questaoId}):`,
      erroDoRegistro.code,
      erroDoRegistro.message
    );
  }

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
    // A correção da questão vale mesmo se a gravação falhou — o aluno
    // respondeu e merece ver o resultado. Mas quem chama passa a SABER se a
    // resposta entrou na contagem, em vez de supor que sim.
    registrada: !erroDoRegistro,
    correta,
    respostaCorreta: questao.resposta_correta as string,
    explicacao: questao.explicacao as string | null,
    materia: questao.materia as string,
    assunto: (questao.assunto as string | null) ?? null
  };
}

/**
 * Houve mesmo uma revisão criada para este erro?
 *
 * O Copiloto roda em segundo plano (a resposta do aluno não pode esperar o
 * motor inteiro), então a tela não tem como saber na hora se ele agiu. Em vez
 * de supor, ela pergunta: existe recomendação PENDENTE para esta matéria e
 * este assunto criada depois da resposta?
 *
 * Só o que está gravado conta. Uma recomendação antiga não serve — seria
 * anunciar como novidade algo que já existia — e, no pior caso, a resposta é
 * "não" e a tela simplesmente não mostra o aviso. Prometer uma revisão que o
 * aluno não vai encontrar é o único erro que não pode acontecer aqui.
 */
export async function revisaoCriadaApos(
  materia: string,
  assunto: string | null,
  desdeISO: string
): Promise<boolean> {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  let consulta = supabase
    .from("copiloto_recomendacoes")
    .select("id", { count: "exact", head: true })
    .eq("aluno_id", profile.id)
    .eq("status", "pendente")
    .eq("materia", materia)
    .gte("gerado_em", desdeISO);

  consulta = assunto ? consulta.eq("assunto", assunto) : consulta.is("assunto", null);

  const { count, error } = await consulta;
  if (error) return false;
  return (count ?? 0) > 0;
}
