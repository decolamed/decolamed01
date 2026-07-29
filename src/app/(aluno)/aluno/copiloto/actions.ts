"use server";

import { revalidatePath } from "next/cache";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

// Devolve o resultado: a tela remove o cartão da lista assim que o aluno
// toca em "Já revisei"/"Dispensar". Se a gravação falhar sem ninguém olhar,
// a recomendação reaparece no próximo carregamento como se o toque nunca
// tivesse acontecido.
export async function marcarRecomendacao(id: string, novoStatus: "concluida" | "descartada") {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const { error } = await supabase
    .from("copiloto_recomendacoes")
    .update({
      status: novoStatus,
      concluida_em: novoStatus === "concluida" ? new Date().toISOString() : null
    })
    .eq("id", id)
    .eq("aluno_id", profile.id); // dupla proteção junto com a RLS
  revalidatePath("/aluno/copiloto");
  revalidatePath("/aluno");
  return { ok: !error };
}

// Versão para `<form action={...}>`, que exige Promise<void>. A página do
// Copiloto (Server Component) não faz atualização otimista: o cartão só sai
// da lista depois do revalidatePath, então uma falha já se mostra sozinha —
// a recomendação continua ali.
export async function marcarRecomendacaoViaForm(id: string, novoStatus: "concluida" | "descartada") {
  await marcarRecomendacao(id, novoStatus);
}
