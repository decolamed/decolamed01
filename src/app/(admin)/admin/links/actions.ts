"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

const PATH = "/admin/links";

export async function criarLink(titulo: string, url: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim() || !url.trim()) return { ok: false as const, erro: "Preencha título e URL." };
  const { error } = await supabase.from("links_externos").insert({ titulo: titulo.trim(), url: url.trim(), ativo: true, criado_por: admin.id });
  revalidatePath(PATH);
  if (error) return { ok: false as const, erro: "Não foi possível criar o link." };
  return { ok: true as const };
}

// Edição de conteúdo já cadastrado. Sem isso, corrigir um título com erro
// de digitação ou uma URL trocada exigia excluir e cadastrar de novo — o
// que, além de trabalhoso, quebra qualquer dia do cronograma que já aponte
// para aquele item pelo ref_id.
export async function atualizarLink(id: string, titulo: string, url: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim() || !url.trim()) return { ok: false as const, erro: "Preencha título e URL." };
  const { error } = await supabase
    .from("links_externos")
    .update({ titulo: titulo.trim(), url: url.trim() })
    .eq("id", id);
  revalidatePath(PATH);
  revalidatePath("/aluno");
  if (error) return { ok: false as const, erro: "Não foi possível salvar as alterações." };
  return { ok: true as const };
}

// Devolve o resultado (em vez de void) porque a tela faz atualização
// otimista: ela já pinta o novo estado antes da resposta. Sem saber que a
// gravação falhou, o admin via o botão trocar, acreditava ter desativado o
// item e só descobria o contrário no próximo carregamento da página.
export async function alternarAtivoLink(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("links_externos").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(PATH);
  revalidatePath("/aluno");
  return { ok: !error };
}

export async function excluirLink(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("links_externos").delete().eq("id", id);
  revalidatePath(PATH);
  return { ok: !error };
}
