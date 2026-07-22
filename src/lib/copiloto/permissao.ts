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
