import { createAdminClient } from "@/lib/supabase/server";
import { PLANO_DO_ALUNO } from "@/lib/supabase/vinculos";

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
  // O vínculo é explícito porque `profiles` e `planos` têm duas chaves
  // estrangeiras entre si (ver lib/supabase/vinculos.ts). Aqui a ambiguidade
  // seria especialmente cara: sem plano nenhum na resposta, esta função
  // devolveria `false` para TODO aluno — o Copiloto pararia de rodar e o
  // briefing sumiria da conta de quem paga por ele.
  const { data, error } = await supabase
    .from("profiles")
    .select(`${PLANO_DO_ALUNO}(tem_copiloto)`)
    .eq("id", alunoId)
    .maybeSingle();

  if (error) {
    // Um "false" por falha de consulta é indistinguível de um "false" por
    // plano sem Copiloto, e some sem deixar rastro. O log é o rastro.
    console.error("Falha ao verificar o Copiloto do aluno:", alunoId, error.message);
    return false;
  }
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
  const { data, error } = await supabase.from("profiles").select("plano_id").eq("id", alunoId).maybeSingle();
  // Mesma razão de `alunoTemCopiloto` acima: um `null` por falha de consulta é
  // indistinguível de um aluno sem plano, e o aluno passa a ver o conteúdo de
  // "nenhum curso" com a conta em dia.
  if (error) {
    console.error("Falha ao ler o plano do aluno:", alunoId, error.message);
    return null;
  }
  return ((data as { plano_id?: string | null } | null)?.plano_id) ?? null;
}
