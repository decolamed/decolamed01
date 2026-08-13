"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { rodarCopiloto } from "@/lib/copiloto/motor";

export interface ItemGabaritoAtividade {
  questaoId: string;
  enunciado: string;
  alternativas: { id: string; texto: string }[];
  respostaCorreta: string;
  escolhida: string | null;
  correta: boolean;
  explicacao: string | null;
  imagens: { url: string; legenda: string | null; ordem: number }[];
}

export interface ResultadoAtividade {
  acertos: number;
  total: number;
  nota: number; // 0-100
  pesoFacape: number;
  gabarito: ItemGabaritoAtividade[];
  // false quando a tentativa não pôde ser gravada. A correção acontece em
  // memória, então o aluno vê o resultado de qualquer jeito — mas sem este
  // sinal ele não teria como saber que a atividade não entrou no histórico
  // nem no XP, e só perceberia depois, procurando o registro que sumiu.
  salvo: boolean;
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
      .select("questao_id, ordem, questoes(enunciado, alternativas, resposta_correta, explicacao, imagens)")
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
      explicacao: item.questoes.explicacao,
      imagens: item.questoes.imagens ?? []
    };
  });

  const total = lista.length;
  const nota = total > 0 ? Math.round((acertos / total) * 1000) / 10 : 0;
  const pesoFacape = Number(atividade?.peso_facape ?? 1);

  const { error: erroTentativa } = await supabase.from("atividade_tentativas").insert({
    aluno_id: profile.id,
    atividade_id: atividadeId,
    respostas,
    acertos,
    total,
    nota,
    finalizado_em: new Date().toISOString()
  });

  // Cada resposta também vira uma linha em `respostas_aluno`, exatamente como
  // no Banco de Questões.
  //
  // Sem isto, tudo que o aluno respondia dentro de uma Atividade era invisível
  // para o resto da plataforma: `atividade_tentativas` guarda só os totais,
  // sem matéria, então o Copiloto não enxergava esses erros, o Raio-X não os
  // contava e a adaptação continuava baseada apenas nas questões avulsas. Um
  // aluno que só fizesse atividades aparecia para o algoritmo como alguém que
  // nunca respondeu nada.
  const linhasResposta = gabarito
    .filter((g) => g.escolhida !== null)
    .map((g) => ({
      aluno_id: profile.id,
      questao_id: g.questaoId,
      alternativa_escolhida: g.escolhida as string,
      correta: g.correta
    }));

  if (linhasResposta.length > 0) {
    const { error: erroRespostas } = await supabase.from("respostas_aluno").insert(linhasResposta);
    // Não derruba o resultado: a nota da atividade já está correta e gravada.
    if (erroRespostas) console.error("Atividade: falha ao registrar as respostas:", erroRespostas.message);
  }

  // O desempenho acabou de mudar — o Copiloto reavalia agora, como já fazia
  // depois de um simulado ou de uma questão avulsa.
  rodarCopiloto({ alunoId: profile.id, ultimaAcao: "questao" }).catch((e) =>
    console.error("[copiloto] falha no ponto de entrada de atividade:", e)
  );

  const resultado: ResultadoAtividade = { acertos, total, nota, pesoFacape, gabarito, salvo: !erroTentativa };
  return resultado;
}
