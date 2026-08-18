import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { rodarCopiloto } from "@/lib/copiloto/motor";
import { resolverCronograma } from "@/lib/trilha/resolver";
import { regerarRotaDoAluno } from "@/lib/trilha/rota-persistencia";
import { hojeISO } from "@/lib/site/data";
import { lerSentimentos } from "@/lib/site/sentimentos";
import type { TrilhaDia } from "@/types/database";

// ============================================================================
// SALVAR O BRIEFING — o núcleo, sem dono fixo
//
// Este código morava dentro de `(aluno)/aluno/briefing/actions.ts` e começava
// com `requireAcessoAluno()`, o que o amarrava ao aluno logado. Agora o
// briefing inicial do Voo Guiado é preenchido pelo MENTOR no painel, depois
// da mentoria — e a recalibração continua sendo do aluno.
//
// São dois chamadores com permissões diferentes e UM só motor. Por isso o
// núcleo passou a receber `alunoId` e a checagem de permissão ficou em cada
// server action: `requireAcessoAluno()` no caminho do aluno,
// `requireAdmin()` no caminho do mentor.
//
// Nada aqui mudou de comportamento: mesmos campos, mesma validação, mesmo
// upsert em `aluno_briefing`, mesma `reprojetarJornada` — que é quem chama
// `regerarRotaDoAluno` (o motor de sempre) e o Copiloto. Não existe segundo
// motor de cronograma, e é de propósito.
//
// Este arquivo NÃO é "use server": ele é uma biblioteca importada pelas duas
// server actions. Exportá-lo como server action deixaria qualquer cliente
// chamar com um `alunoId` arbitrário.
// ============================================================================

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
 *   sentimento_materia_<i> / sentimento_valor_<i> (ver lib/site/sentimentos.ts)
 */
export async function salvarBriefingDoAluno(
  alunoId: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const supabase = createClient();

  const dataProva = String(formData.get("data_prova") ?? "").trim();
  const inicioEstudos = String(formData.get("inicio_estudos") ?? "").trim() || null;
  const diasPorSemana = Number(formData.get("dias_por_semana") ?? 5);
  const horasPorDia = Number(formData.get("horas_por_dia") ?? 3);
  const observacoes = String(formData.get("observacoes") ?? "").trim() || null;

  // Autoavaliação por matéria. A matéria chega como VALOR de um campo de nome
  // ASCII (lib/site/sentimentos.ts): usá-la como NOME de campo corrompia as
  // acentuadas no cabeçalho do multipart, e o Copiloto perdia a resposta.
  const sentimentos = lerSentimentos(formData);

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
      aluno_id: alunoId,
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

  await reprojetarJornada(alunoId, dataProva);

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

