"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { rodarCopiloto } from "@/lib/copiloto/motor";

export interface ItemGabarito {
  questaoId: string;
  enunciado: string;
  materia: string;
  assunto: string | null;
  alternativas: { id: string; texto: string }[];
  respostaCorreta: string;
  escolhida: string | null;
  correta: boolean;
  explicacao: string | null;
}

export interface DesempenhoMateria {
  materia: string;
  peso: number;
  acertos: number;
  total: number;
  precisao: number; // 0-100
}

export interface ResultadoSimulado {
  acertos: number;
  total: number;
  nota: number;          // % simples de acerto (mantida pra compatibilidade)
  notaFacape: number;    // % ponderado pelos pesos oficiais (0-100)
  gabarito: ItemGabarito[];
  desempenhoPorMateria: DesempenhoMateria[];
}

/**
 * Corrige o simulado inteiro no servidor:
 *  - busca as questões de verdade (com resposta_correta) direto no banco
 *  - compara com o que o aluno escolheu (nunca confia no navegador)
 *  - agrupa acertos por matéria e por assunto
 *  - calcula a nota simples (% de acerto) E a nota FACAPE (média ponderada
 *    da precisão em cada matéria pelo peso oficial)
 *
 * Como a nota FACAPE é calculada:
 *   nota = soma(precisao_materia × peso_materia) / soma(peso_materia)
 *
 * Isso é o mesmo que a FACAPE faz: matérias com peso maior contam mais na
 * nota final. Se o aluno só respondeu questão de uma matéria, a nota FACAPE
 * é a precisão daquela matéria (peso vira 100% do total).
 */
export async function submeterSimulado(simuladoId: string, respostas: Record<string, string>) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { data: itens } = await supabase
    .from("simulado_questoes")
    .select("questao_id, ordem, questoes(enunciado, alternativas, resposta_correta, explicacao, materia, assunto)")
    .eq("simulado_id", simuladoId)
    .order("ordem");

  const lista = itens ?? [];
  let acertos = 0;

  // Agrupa por matéria pra calcular precisão e depois pesar
  const contadoresMateria = new Map<string, { acertos: number; total: number }>();

  const gabarito: ItemGabarito[] = lista.map((item: any) => {
    const escolhida = respostas[item.questao_id] ?? null;
    const correta = escolhida !== null && escolhida === item.questoes.resposta_correta;
    if (correta) acertos++;

    const materia = item.questoes.materia ?? "Sem matéria";
    const atual = contadoresMateria.get(materia) ?? { acertos: 0, total: 0 };
    atual.total++;
    if (correta) atual.acertos++;
    contadoresMateria.set(materia, atual);

    return {
      questaoId: item.questao_id,
      enunciado: item.questoes.enunciado,
      materia,
      assunto: item.questoes.assunto,
      alternativas: item.questoes.alternativas,
      respostaCorreta: item.questoes.resposta_correta,
      escolhida,
      correta,
      explicacao: item.questoes.explicacao
    };
  });

  const total = lista.length;
  const nota = total > 0 ? Math.round((acertos / total) * 1000) / 10 : 0;

  // Busca os pesos das matérias envolvidas — só as matérias que apareceram
  // na prova (evita puxar a tabela inteira sem necessidade)
  const materiasDaProva = Array.from(contadoresMateria.keys());
  const { data: pesosData } = materiasDaProva.length > 0
    ? await supabase.from("materias_peso").select("materia, peso").in("materia", materiasDaProva)
    : { data: [] };

  const pesos = new Map<string, number>();
  (pesosData ?? []).forEach((p: any) => pesos.set(p.materia, Number(p.peso)));

  // Monta o desempenho por matéria e calcula a nota FACAPE ponderada
  const desempenhoPorMateria: DesempenhoMateria[] = [];
  let somaPonderada = 0;
  let somaPesos = 0;
  contadoresMateria.forEach((dados, materia) => {
    const precisao = dados.total > 0 ? (dados.acertos / dados.total) * 100 : 0;
    // Se a matéria não tem peso cadastrado, usa peso 1 (neutro) — não
    // desconsidera a matéria, apenas trata como peso mínimo. Evita que
    // esquecer de cadastrar um peso quebre a nota do aluno.
    const peso = pesos.get(materia) ?? 1;
    desempenhoPorMateria.push({
      materia,
      peso,
      acertos: dados.acertos,
      total: dados.total,
      precisao: Math.round(precisao * 10) / 10
    });
    somaPonderada += precisao * peso;
    somaPesos += peso;
  });
  const notaFacape = somaPesos > 0 ? Math.round((somaPonderada / somaPesos) * 10) / 10 : 0;

  // Grava a tentativa com todos os campos calculados
  // (o formato do desempenho_por_materia é o que o Raio-X vai consumir)
  const desempenhoJson: Record<string, { peso: number; acertos: number; total: number; precisao: number }> = {};
  desempenhoPorMateria.forEach((d) => {
    desempenhoJson[d.materia] = { peso: d.peso, acertos: d.acertos, total: d.total, precisao: d.precisao };
  });

  await supabase.from("simulado_tentativas").insert({
    aluno_id: profile.id,
    simulado_id: simuladoId,
    respostas,
    acertos,
    total,
    nota,
    nota_facape: notaFacape,
    desempenho_por_materia: desempenhoJson,
    finalizado_em: new Date().toISOString()
  });

  rodarCopiloto({ alunoId: profile.id, ultimaAcao: "simulado" }).catch((e) =>
    console.error("[copiloto] falha no ponto de entrada de simulado:", e)
  );

  const resultado: ResultadoSimulado = { acertos, total, nota, notaFacape, gabarito, desempenhoPorMateria };
  return resultado;
}

/**
 * Reconstrói o gabarito comentado de uma tentativa já finalizada (histórico
 * de simulados), sem recalcular nem gravar nada — só busca as questões de
 * verdade no servidor e cruza com as respostas já salvas na tentativa.
 */
export async function buscarGabaritoTentativa(tentativaId: string): Promise<ItemGabarito[] | null> {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { data: tentativa } = await supabase
    .from("simulado_tentativas")
    .select("simulado_id, respostas")
    .eq("id", tentativaId)
    .eq("aluno_id", profile.id)
    .maybeSingle();
  if (!tentativa) return null;

  const { data: itens } = await supabase
    .from("simulado_questoes")
    .select("questao_id, ordem, questoes(enunciado, alternativas, resposta_correta, explicacao, materia, assunto)")
    .eq("simulado_id", tentativa.simulado_id)
    .order("ordem");

  const respostas = (tentativa.respostas as Record<string, string>) ?? {};
  return (itens ?? []).map((item: any) => {
    const escolhida = respostas[item.questao_id] ?? null;
    const correta = escolhida !== null && escolhida === item.questoes.resposta_correta;
    return {
      questaoId: item.questao_id,
      enunciado: item.questoes.enunciado,
      materia: item.questoes.materia,
      assunto: item.questoes.assunto,
      alternativas: item.questoes.alternativas,
      respostaCorreta: item.questoes.resposta_correta,
      escolhida,
      correta,
      explicacao: item.questoes.explicacao
    };
  });
}
