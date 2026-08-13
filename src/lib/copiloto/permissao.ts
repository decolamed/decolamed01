import { createAdminClient } from "@/lib/supabase/server";

/**
 * Retorna true se o aluno tem acesso ao Copiloto adaptativo (definido por
 * `planos.tem_copiloto`, editado no cadastro do plano — não pelo NOME do
 * plano, pra evitar acoplar código a texto do admin).
 *
 * Usa createAdminClient pra funcionar tanto em Server Components quanto em
 * server actions/webhooks (nunca depende de sessão do lado do navegador).
 */
export async function alunoTemCopiloto(alunoId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("planos(tem_copiloto)")
    .eq("id", alunoId)
    .maybeSingle();
  return Boolean((data as any)?.planos?.tem_copiloto);
}

/**
 * O curso (plano) do aluno. Mesma chave que decide o acesso ao Copiloto —
 * `profiles.plano_id` —, para a plataforma não passar a ter duas maneiras
 * diferentes de responder "de que curso é este aluno".
 *
 * Já houve o defeito de decidir plano por `nome.includes("guiado")`: quebra
 * no dia em que o admin renomeia o plano, e em silêncio.
 */
export async function planoDoAluno(alunoId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("profiles").select("plano_id").eq("id", alunoId).maybeSingle();
  return ((data as { plano_id?: string | null } | null)?.plano_id) ?? null;
}
