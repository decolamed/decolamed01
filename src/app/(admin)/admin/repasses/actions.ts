"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

// Dar baixa é registro financeiro: quando falha, o admin precisa saber, em vez
// de supor que deu certo porque a página recarregou. Por isso toda ação daqui
// termina num redirect com mensagem — nenhuma volta em silêncio.

/** Para onde voltar depois de dar baixa, com os filtros da tela preservados. */
function comFiltros(base: string, formData: FormData, mensagem: { erro?: string; sucesso?: string }): string {
  const params = new URLSearchParams();
  for (const chave of ["de", "ate", "beneficiarioId", "tipo", "status"]) {
    const valor = String(formData.get(chave) ?? "");
    if (valor) params.set(chave, valor);
  }
  if (mensagem.erro) params.set("erro", mensagem.erro);
  if (mensagem.sucesso) params.set("sucesso", mensagem.sucesso);
  return `${base}?${params.toString()}`;
}

/** Baixa de UMA comissão. */
export async function marcarRepassePago(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createAdminClient();
  // `.eq("status", "pendente")` de propósito: dar baixa duas vezes na mesma
  // comissão não pode reescrever a data do primeiro pagamento.
  const { error } = await supabase
    .from("comissoes_parceiro")
    .update({ status: "paga", data_pagamento: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pendente");

  revalidatePath("/admin/repasses");
  revalidatePath("/admin/vendas");
  redirect(
    comFiltros(
      "/admin/repasses",
      formData,
      error
        ? { erro: "Não foi possível dar baixa nesta comissão." }
        : { sucesso: "Comissão marcada como paga." }
    )
  );
}

/**
 * Baixa de TODAS as comissões pendentes de uma pessoa no período filtrado.
 *
 * É o gesto real do repasse: ninguém paga comissão a comissão, paga o total do
 * mês para a pessoa e depois quita a lista. Os ids vêm da própria tela, já
 * filtrados — a ação não recalcula o período, senão uma venda confirmada entre
 * a renderização e o clique entraria numa baixa que o admin não conferiu.
 */
export async function marcarRepasseDaPessoaPago(formData: FormData) {
  await requireAdmin();
  const ids = String(formData.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("comissoes_parceiro")
    .update({ status: "paga", data_pagamento: new Date().toISOString() })
    .in("id", ids)
    .eq("status", "pendente");

  revalidatePath("/admin/repasses");
  revalidatePath("/admin/vendas");
  redirect(
    comFiltros(
      "/admin/repasses",
      formData,
      error
        ? { erro: "Não foi possível dar baixa nas comissões." }
        : { sucesso: `${ids.length} comissão(ões) marcada(s) como paga(s).` }
    )
  );
}

/** Desfaz uma baixa feita por engano. */
export async function desfazerRepasse(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("comissoes_parceiro")
    .update({ status: "pendente", data_pagamento: null })
    .eq("id", id)
    .eq("status", "paga");

  revalidatePath("/admin/repasses");
  revalidatePath("/admin/vendas");
  redirect(
    comFiltros(
      "/admin/repasses",
      formData,
      error ? { erro: "Não foi possível desfazer a baixa." } : { sucesso: "Baixa desfeita." }
    )
  );
}
