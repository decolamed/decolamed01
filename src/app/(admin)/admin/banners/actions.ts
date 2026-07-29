"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

const PATH = "/admin/banners";

export async function salvarBanner(id: string | null, titulo: string, link: string, bg: string, ativo: boolean) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim()) return { ok: false as const, erro: "Informe o título." };
  const payload = { titulo: titulo.trim(), link: link.trim(), bg, ativo };
  const { error } = id
    ? await supabase.from("banners").update(payload).eq("id", id)
    : await supabase.from("banners").insert({ ...payload, criado_por: admin.id });
  revalidatePath(PATH);
  if (error) return { ok: false as const, erro: "Não foi possível salvar o banner." };
  return { ok: true as const };
}

// Devolve o resultado (em vez de void) porque a tela faz atualização
// otimista: ela já pinta o novo estado antes da resposta. Sem saber que a
// gravação falhou, o admin via o botão trocar, acreditava ter desativado o
// item e só descobria o contrário no próximo carregamento da página.
export async function alternarAtivoBanner(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("banners").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(PATH);
  revalidatePath("/aluno");
  return { ok: !error };
}

export async function excluirBanner(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  revalidatePath(PATH);
  return { ok: !error };
}
