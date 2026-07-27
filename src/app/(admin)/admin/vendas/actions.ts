"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

// Marca uma comissão de parceiro como paga. `comissoes_parceiro` já existe
// desde a migração 005 (com trigger que gera a linha automaticamente a
// partir de `pagamentos`), mas não havia nenhuma UI pra dar baixa nela —
// toda comissão gerada ficava presa em "pendente" pra sempre.
export async function marcarComissaoPaga(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createAdminClient();
  await supabase
    .from("comissoes_parceiro")
    .update({ status: "paga", data_pagamento: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pendente");

  revalidatePath("/admin/vendas");
}
