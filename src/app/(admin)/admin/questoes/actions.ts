"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

const PATH = "/admin/questoes";
const LETRAS = ["a", "b", "c", "d", "e"] as const;
const DIFICULDADE_PARA_BANCO: Record<string, string> = { Fácil: "facil", Média: "media", Difícil: "dificil" };

export interface QuestaoForm {
  id?: string;
  enunciado: string;
  materia: string;
  assunto: string;
  dificuldade: "Fácil" | "Média" | "Difícil";
  gabarito: string;
  comentario: string;
  fonte?: string;
  alternativas: Record<string, string>; // { a: "texto", b: "texto", ... }
  // Imagens da questão (gráficos, mapas, trechos de prova). Antes o
  // formulário simplesmente não tinha esse campo: dava para editar
  // enunciado e alternativas, mas a imagem ficava intocável — não havia
  // como trocar, remover nem acrescentar uma pelo painel, só direto no
  // banco. As 92 questões que já têm imagem dependem disso.
  imagens?: { url: string; legenda: string | null }[];
}

// Tira/devolve a questão de circulação sem apagá-la. A lista já mostrava o
// selo "Inativa", mas não havia como chegar nesse estado nem sair dele: para
// tirar uma questão errada do ar, a única saída era excluir de vez — o que é
// irreversível e ainda é bloqueado quando ela já está em algum simulado ou
// atividade. Todo o resto do conteúdo (aulas, PDFs, links, banners) já tinha
// esse liga/desliga.
export async function alternarAtivoQuestao(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("questoes").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(PATH);
  revalidatePath("/aluno");
  return { ok: !error };
}

export async function salvarQuestao(form: QuestaoForm) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const alternativas = LETRAS.map((letra) => ({ id: letra, texto: (form.alternativas[letra] ?? "").trim() })).filter(
    (a) => a.texto.length > 0
  );

  if (!form.enunciado.trim()) return { ok: false as const, erro: "Preencha o enunciado." };
  if (alternativas.length < 2) return { ok: false as const, erro: "Cadastre pelo menos 2 alternativas." };
  if (!alternativas.some((a) => a.id === form.gabarito)) {
    return { ok: false as const, erro: "O gabarito precisa ser uma das alternativas preenchidas." };
  }

  const payload = {
    enunciado: form.enunciado.trim(),
    materia: form.materia,
    assunto: form.assunto.trim() || null,
    dificuldade: DIFICULDADE_PARA_BANCO[form.dificuldade] ?? "media",
    resposta_correta: form.gabarito,
    explicacao: form.comentario.trim() || null,
    fonte: form.fonte?.trim() || null,
    alternativas,
    // `ordem` é derivada da posição na lista, então reordenar no formulário
    // já reordena para o aluno.
    imagens: (form.imagens ?? [])
      .map((img, i) => ({ url: img.url.trim(), legenda: img.legenda?.trim() || null, ordem: i }))
      .filter((img) => img.url.length > 0)
  };

  const { error } = form.id
    ? await supabase.from("questoes").update(payload).eq("id", form.id)
    : await supabase.from("questoes").insert({ ...payload, ativo: true, criado_por: admin.id });

  revalidatePath(PATH);
  if (error) return { ok: false as const, erro: "Não foi possível salvar a questão." };
  return { ok: true as const };
}

// Importação em massa (via texto colado ou PDF — ver parse-questoes.ts e
// pdf-actions.ts): reaproveita a mesma validação/insert de salvarQuestao(),
// uma linha por vez, retornando quantas entraram e quantas falharam.
export async function salvarQuestoesEmLote(forms: QuestaoForm[]) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  let sucesso = 0;
  let falha = 0;
  for (const form of forms) {
    const alternativas = LETRAS.map((letra) => ({ id: letra, texto: (form.alternativas[letra] ?? "").trim() })).filter(
      (a) => a.texto.length > 0
    );
    if (!form.enunciado.trim() || alternativas.length < 2 || !alternativas.some((a) => a.id === form.gabarito)) {
      falha++;
      continue;
    }
    const { error } = await supabase.from("questoes").insert({
      enunciado: form.enunciado.trim(),
      materia: form.materia,
      assunto: form.assunto.trim() || null,
      dificuldade: DIFICULDADE_PARA_BANCO[form.dificuldade] ?? "media",
      resposta_correta: form.gabarito,
      explicacao: form.comentario.trim() || null,
      fonte: form.fonte?.trim() || null,
      alternativas,
      ativo: true,
      criado_por: admin.id
    });
    if (error) falha++;
    else sucesso++;
  }

  revalidatePath(PATH);
  return { sucesso, falha };
}

export async function excluirQuestao(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("questoes").delete().eq("id", id);
  revalidatePath(PATH);
  if (error) return { ok: false as const, erro: "Não foi possível excluir (pode ter respostas de alunos vinculadas)." };
  return { ok: true as const };
}
