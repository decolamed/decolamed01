"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import type { AlunoMissaoTipo } from "@/types/database";

// Cronograma individual de um aluno específico (aluno_missoes) — não mexe
// em trilha_dias (o cronograma geral, compartilhado por todo mundo sem
// Copiloto). decola-app.tsx passa a usar essas missões em vez do
// cronograma compartilhado assim que o aluno tiver pelo menos uma (ver scrPlano()).
export async function adicionarMissaoIndividual(alunoId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const data = String(formData.get("data") ?? "").trim();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "livre") as AlunoMissaoTipo;
  const materia = String(formData.get("materia") ?? "").trim() || null;
  const assunto = String(formData.get("assunto") ?? "").trim() || null;
  const duracao = Number(formData.get("duracao") ?? 30) || 30;

  // O CONTEÚDO da missão — o que faltava.
  //
  // A missão manual gravava só data/título/tipo/matéria/duração e nunca
  // preenchia `ref_id`, que é justamente a coluna que `navMissao` usa para
  // abrir o material. Uma missão de aula criada pelo admin caía no fallback
  // por título e, não achando nada, avisava "ainda não há aulas publicadas".
  //
  // Duas formas de anexar, e as duas terminam no MESMO lugar
  // (`conteudos_biblioteca`), que é a estrutura que o app do aluno já sabe
  // abrir. Não existe um segundo cadastro de material.
  const conteudoId = String(formData.get("conteudo_id") ?? "").trim() || null;
  const urlNova = String(formData.get("url") ?? "").trim();

  const erro = (msg: string) =>
    redirect(`/admin/usuarios/${alunoId}?erro=${encodeURIComponent(msg)}`);

  if (!data || !titulo) erro("Informe a data e o título da missão.");
  if (urlNova && !/^https?:\/\//i.test(urlNova)) {
    erro("O link precisa começar com http:// ou https://.");
  }

  let refId: string | null = conteudoId;

  // Link novo: vira um material da biblioteca e a missão aponta para ele.
  // Assim o material fica reutilizável em outros cronogramas e o aluno o abre
  // pelo mesmo visualizador interno de sempre.
  if (!refId && urlNova) {
    const { data: criado, error: erroConteudo } = await supabase
      .from("conteudos_biblioteca")
      .insert({
        tipo: "link",
        titulo,
        materia,
        assunto,
        url: urlNova,
        ativo: true
      })
      .select("id")
      .single();
    if (erroConteudo || !criado) erro("Não foi possível salvar o link do material.");
    refId = criado!.id as string;
  }

  const { error } = await supabase.from("aluno_missoes").insert({
    aluno_id: alunoId,
    data,
    titulo,
    tipo,
    materia,
    assunto,
    ref_id: refId,
    duracao_minutos: duracao,
    duracao_estimada_min: duracao,
    prioridade: 1,
    origem: "admin",
    concluida: false
  });

  revalidatePath(`/admin/usuarios/${alunoId}`);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  if (error) erro("Não foi possível adicionar a missão.");
  redirect(`/admin/usuarios/${alunoId}?sucesso=${encodeURIComponent("Missão adicionada ao cronograma individual.")}`);
}

export async function excluirMissaoIndividual(alunoId: string, missaoId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("aluno_missoes").delete().eq("id", missaoId).eq("aluno_id", alunoId);
  revalidatePath(`/admin/usuarios/${alunoId}`);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  // Antes o redirect anunciava "Missão removida." mesmo quando a exclusão
  // falhava: o admin lia a confirmação e a missão continuava na lista logo
  // abaixo, no mesmo carregamento.
  if (error) {
    redirect(`/admin/usuarios/${alunoId}?erro=${encodeURIComponent("Não foi possível remover a missão.")}`);
  }
  redirect(`/admin/usuarios/${alunoId}?sucesso=${encodeURIComponent("Missão removida.")}`);
}
