"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import type { EstudosBotaoTipo } from "@/types/database";

const PATH = "/admin/estudos";

export async function criarBotaoEstudos(
  titulo: string,
  icone: string,
  tipo: EstudosBotaoTipo,
  link: string,
  // null = todos os cursos. É o padrão seguro: esquecer de escolher publica
  // para todos, nunca esconde de todos.
  planoId: string | null = null
) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim() || !link.trim()) return { ok: false as const, erro: "Preencha nome e link." };
  const { error } = await supabase
    .from("estudos_botoes")
    .insert({ titulo: titulo.trim(), icone, tipo, link: link.trim(), ativo: true, plano_id: planoId, criado_por: admin.id });
  revalidatePath(PATH);
  revalidatePath("/aluno");
  if (error) return { ok: false as const, erro: "Não foi possível criar o botão." };
  return { ok: true as const };
}

// Edição de item já cadastrado. Sem isso, corrigir um nome ou um link
// trocado exigia excluir e cadastrar de novo.
export async function atualizarBotaoEstudos(
  id: string,
  titulo: string,
  icone: string,
  tipo: EstudosBotaoTipo,
  link: string,
  planoId: string | null = null
) {
  await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim() || !link.trim()) return { ok: false as const, erro: "Preencha nome e link." };
  const { error } = await supabase
    .from("estudos_botoes")
    .update({ titulo: titulo.trim(), icone, tipo, link: link.trim(), plano_id: planoId })
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
export async function alternarAtivoBotaoEstudos(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("estudos_botoes").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(PATH);
  revalidatePath("/aluno");
  return { ok: !error };
}

export async function excluirBotaoEstudos(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("estudos_botoes").delete().eq("id", id);
  revalidatePath(PATH);
  revalidatePath("/aluno");
  return { ok: !error };
}
