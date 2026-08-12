"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { rodarCopiloto } from "@/lib/copiloto/motor";
import { resolverCronograma } from "@/lib/trilha/resolver";
import { regerarRotaDoAluno } from "@/lib/trilha/rota-persistencia";
import { hojeISO } from "@/lib/site/data";
import type { TrilhaDia } from "@/types/database";

const SENTIMENTOS_VALIDOS = new Set(["Domínio", "Atenção", "Turbulência"]);

// Item 15: a prova tem 5 questões de língua estrangeira e o aluno faz UMA
// das duas. Sem essa escolha registrada, a plataforma não consegue entregar
// só o idioma certo — e é por isso que ela é obrigatória no briefing.
const IDIOMAS_VALIDOS = new Set(["ingles", "espanhol"]);

/**
 * Faz de fato o upsert do briefing — sem redirect, pra poder ser chamada
 * tanto pelo formulário dedicado (/aluno/briefing, que redireciona ao
 * concluir) quanto pelo app gamificado (decola-app.tsx, que chama a Server
 * Action direto por um método de classe e precisa só do resultado, sem
 * navegação — redirect() só funciona de verdade quando disparado a partir
 * de uma submissão de <form>, não de uma chamada direta).
 * Espera:
 *   data_prova, inicio_estudos, dias_por_semana, horas_por_dia,
 *   sentimento_<Materia> = "Domínio" | "Atenção" | "Turbulência"
 */
async function salvarBriefingCore(formData: FormData): Promise<{ ok: true } | { ok: false; erro: string }> {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const dataProva = String(formData.get("data_prova") ?? "").trim();
  const inicioEstudos = String(formData.get("inicio_estudos") ?? "").trim() || null;
  const diasPorSemana = Number(formData.get("dias_por_semana") ?? 5);
  const horasPorDia = Number(formData.get("horas_por_dia") ?? 3);
  const observacoes = String(formData.get("observacoes") ?? "").trim() || null;

  // sentimentos por matéria
  const sentimentos: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("sentimento_")) continue;
    const materia = k.replace("sentimento_", "");
    const valor = String(v);
    if (SENTIMENTOS_VALIDOS.has(valor)) sentimentos[materia] = valor;
  }

  const idiomaBruto = String(formData.get("idioma_prova") ?? "").trim().toLowerCase();
  const idiomaProva = IDIOMAS_VALIDOS.has(idiomaBruto) ? idiomaBruto : null;

  if (!dataProva) return { ok: false, erro: "Informe a data da prova." };
  if (diasPorSemana < 1 || diasPorSemana > 7) return { ok: false, erro: "Dias por semana precisa estar entre 1 e 7." };
  if (horasPorDia < 1 || horasPorDia > 12) return { ok: false, erro: "Horas por dia precisa estar entre 1 e 12." };
  if (!idiomaProva) return { ok: false, erro: "Escolha o idioma que você fará na prova (Inglês ou Espanhol)." };

  // Compatibilidade com colunas antigas (dias_estuda / horas_por_dia_semana /
  // horas_por_dia_fim_semana): guardamos o mesmo número em ambos e todos os
  // dias marcados, pra não quebrar código que já lê essas colunas.
  const DIAS_ORDEM = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  // seleciona os N primeiros dias úteis: seg, ter, qua, qui, sex, sab, dom
  const ORDEM_ESTUDO = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
  const diasEstuda = ORDEM_ESTUDO.slice(0, diasPorSemana);
  void DIAS_ORDEM;

  const { error } = await supabase.from("aluno_briefing").upsert(
    {
      aluno_id: profile.id,
      data_prova: dataProva,
      inicio_estudos: inicioEstudos,
      horas_por_dia_semana: horasPorDia,
      horas_por_dia_fim_semana: horasPorDia,
      dias_estuda: diasEstuda,
      idioma_prova: idiomaProva,
      sentimentos,
      observacoes
    },
    { onConflict: "aluno_id" }
  );

  if (error) {
    console.error("Falha ao salvar aluno_briefing:", error);
    return { ok: false, erro: "Não foi possível salvar o briefing." };
  }

  await reprojetarJornada(profile.id, dataProva);

  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  revalidatePath("/aluno/copiloto");
  return { ok: true };
}

/**
 * Faz os novos dados do briefing valerem de verdade no resto da plataforma.
 *
 * Item 18: até aqui o Recalibrar Voo gravava o formulário e parava. O aluno
 * mudava a data da prova, confirmava, e cronograma, missões e Copiloto
 * seguiam com os parâmetros antigos — o formulário mostrava o dado novo e o
 * comportamento continuava o velho.
 *
 * Três coisas acontecem aqui:
 *
 *   1. A ROTA é regerada do zero com os novos parâmetros e SUBSTITUI a
 *      anterior em `aluno_rota_dias`. Não é fusão nem remendo: a rota antiga
 *      é apagada. Duas rotas convivendo é como um cronograma acaba com dois
 *      "Dia 12" e com datas que não batem com nada.
 *   2. Missões FUTURAS geradas pelo Copiloto sob os parâmetros antigos são
 *      removidas. Só as do Copiloto, só as não concluídas e só as de hoje em
 *      diante — o histórico do aluno e o que o admin agendou à mão ficam
 *      intactos, como pede o item 18.3.
 *   3. O Copiloto roda de novo e remonta as missões extras com a nova janela,
 *      as novas dificuldades e o novo idioma. Como ele parte do desempenho já
 *      registrado, conteúdo concluído não volta por padrão; volta como
 *      revisão só quando os erros indicarem (item 18.4).
 */
async function reprojetarJornada(alunoId: string, dataProva: string): Promise<void> {
  const supabase = createClient();
  // Fuso da plataforma, não UTC: das 21h à meia-noite o UTC já é o dia
  // seguinte, e a rota nasceria começando amanhã.
  const hoje = hojeISO();

  // ---- 1. Rota nova, no lugar da antiga -------------------------------
  try {
    const [{ data: briefingAtual }, { data: trilha }] = await Promise.all([
      supabase.from("aluno_briefing").select("*").eq("aluno_id", alunoId).maybeSingle(),
      supabase.from("trilha_dias").select("*").order("dia_numero")
    ]);
    const template = await resolverCronograma((trilha as TrilhaDia[]) ?? []);
    await regerarRotaDoAluno(supabase, alunoId, { briefing: briefingAtual as any, template, hoje });
  } catch (e) {
    // A rota também é regerada na próxima leitura de tela (rotaDoAluno
    // compara a assinatura), então isto atrasa, não perde.
    console.error("Recalibragem: falha ao regerar a rota do aluno:", e);
  }

  const { error: erroLimpeza } = await supabase
    .from("aluno_missoes")
    .delete()
    .eq("aluno_id", alunoId)
    .eq("origem", "copiloto")
    .eq("concluida", false)
    .gte("data", hoje);

  if (erroLimpeza) {
    // Não impede o resto: uma missão antiga sobrando é bem menos grave do
    // que abortar a recalibração depois de o briefing já ter sido gravado.
    console.error("Recalibragem: falha ao limpar missões antigas do Copiloto:", erroLimpeza.message);
  }

  try {
    await rodarCopiloto({ alunoId });
  } catch (e) {
    // O briefing já está salvo e o cronograma já reflete a nova janela; a
    // próxima rodada do Copiloto recompõe as missões.
    console.error("Recalibragem: Copiloto não conseguiu remontar a rota agora:", e);
  }

  // Missão agendada para depois da prova não faz sentido — pode existir se o
  // aluno ANTECIPOU a data. O gatilho do banco já barra criação no dia da
  // prova; aqui limpamos o que ficou além dela.
  const { error: erroPosProva } = await supabase
    .from("aluno_missoes")
    .delete()
    .eq("aluno_id", alunoId)
    .eq("concluida", false)
    .gte("data", dataProva);

  if (erroPosProva) {
    console.error("Recalibragem: falha ao remover missões após a data da prova:", erroPosProva.message);
  }
}

// Usada pelo <form action={...}> de /aluno/briefing — redireciona de
// verdade porque é uma submissão de formulário real.
export async function salvarBriefing(formData: FormData) {
  const resultado = await salvarBriefingCore(formData);
  if (!resultado.ok) {
    redirect(`/aluno/briefing?erro=${encodeURIComponent(resultado.erro)}`);
  }
  redirect("/aluno/tutorial");
}

// Usada pelo app gamificado (decola-app.tsx) — chamada direta de um método
// de classe, sem <form> nem navegação de página; o componente decide o que
// fazer com o resultado (mostrar erro, trocar de tela internamente etc.).
export async function salvarBriefingApp(formData: FormData) {
  return salvarBriefingCore(formData);
}
