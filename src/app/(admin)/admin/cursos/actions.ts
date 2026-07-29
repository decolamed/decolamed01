"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

export async function criarConteudo(tipo: "aula" | "pdf", titulo: string, materia: string, assunto: string | null, url: string | null, duracao: number) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim() || !materia.trim()) return { ok: false as const, erro: "Preencha título e matéria." };
  const { error } = await supabase.from("conteudos_biblioteca").insert({
    tipo,
    titulo: titulo.trim(),
    materia: materia.trim(),
    assunto: assunto?.trim() || null,
    url: url?.trim() || null,
    duracao_minutos: duracao,
    ativo: true,
    criado_por: admin.id
  });
  revalidatePath(`/admin/cursos`);
  revalidatePath(`/admin/pdfs`);
  if (error) return { ok: false as const, erro: "Não foi possível criar." };
  return { ok: true as const };
}

// Importação em massa de aulas via YouTube — ver buscarInfoYoutube() em
// src/lib/importacao/youtube.ts, que já buscou título/matéria sugerida
// antes desta chamada. Mesmo padrão de retorno de salvarQuestoesEmLote().
export async function criarConteudosEmLote(
  itens: { titulo: string; materia: string; assunto: string | null; url: string; duracao: number }[]
) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  let sucesso = 0;
  let falha = 0;
  for (const item of itens) {
    if (!item.titulo.trim() || !item.materia.trim()) {
      falha++;
      continue;
    }
    const { error } = await supabase.from("conteudos_biblioteca").insert({
      tipo: "aula",
      titulo: item.titulo.trim(),
      materia: item.materia.trim(),
      assunto: item.assunto?.trim() || null,
      url: item.url.trim() || null,
      duracao_minutos: item.duracao,
      ativo: true,
      criado_por: admin.id
    });
    if (error) falha++;
    else sucesso++;
  }

  revalidatePath("/admin/cursos");
  revalidatePath("/admin/pdfs");
  return { sucesso, falha };
}

// Devolve o resultado (em vez de void) porque a tela faz atualização
// otimista: ela já pinta o novo estado antes da resposta. Sem saber que a
// gravação falhou, o admin via o botão trocar, acreditava ter desativado o
// item e só descobria o contrário no próximo carregamento da página.
export async function alternarAtivoConteudo(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("conteudos_biblioteca").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(`/admin/cursos`);
  revalidatePath(`/admin/pdfs`);
  revalidatePath("/aluno");
  return { ok: !error };
}

export async function excluirConteudo(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("conteudos_biblioteca").delete().eq("id", id);
  revalidatePath(`/admin/cursos`);
  revalidatePath(`/admin/pdfs`);
  return { ok: !error };
}
