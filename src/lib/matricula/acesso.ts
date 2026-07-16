import type { SupabaseClient } from "@supabase/supabase-js";

export type MotivoAcessoBloqueado = "sem_matricula" | "pendente" | "bloqueada" | "cancelada" | "expirada";

export interface StatusAcesso {
  liberado: boolean;
  motivo?: MotivoAcessoBloqueado;
  mensagem?: string;
}

export const MENSAGENS_ACESSO_BLOQUEADO: Record<MotivoAcessoBloqueado, string> = {
  sem_matricula: "Não encontramos nenhuma matrícula vinculada à sua conta. Entre em contato com o suporte.",
  pendente: "Sua matrícula ainda está com o pagamento pendente de confirmação.",
  bloqueada: "Seu acesso foi bloqueado pelo administrador. Entre em contato com o suporte.",
  cancelada: "Sua matrícula foi cancelada. Entre em contato com o suporte para mais informações.",
  // Texto exigido literalmente pela spec — não alterar sem atualizar a spec.
  expirada: "Seu acesso expirou. Renove seu plano para continuar estudando."
};

/**
 * Decide se um aluno pode acessar conteúdo protegido, 100% no servidor.
 *
 * Por quê isso não pode ser burlado alterando dados no navegador:
 * - `supabase` aqui é sempre o client com cookies de sessão (nunca a service
 *   role key), então a query já roda sob RLS: a policy
 *   "matriculas_select_own_or_admin" só deixa o próprio aluno enxergar a
 *   PRÓPRIA matrícula (`aluno_id = auth.uid()`), usando o `auth.uid()`
 *   resolvido a partir do JWT da sessão — não de nada enviado pelo cliente.
 * - A comparação de data usa `new Date()` do servidor (Node/Edge), nunca o
 *   relógio do navegador.
 * - Não existe nenhum caminho no front-end que grave `status` ou
 *   `acesso_expira_em` — essas colunas só são escritas por server actions do
 *   admin (`createAdminClient`, que ignora RLS de propósito) ou pelo webhook
 *   do Asaas.
 *
 * Considera a matrícula mais recente do aluno (created_at desc) — é a mesma
 * noção de "matrícula atual" já usada em /admin/matriculas e no dashboard de
 * vendas.
 */
export async function verificarAcessoMatricula(
  supabase: SupabaseClient,
  alunoId: string
): Promise<StatusAcesso> {
  const { data: matricula } = await supabase
    .from("matriculas")
    .select("status, acesso_expira_em")
    .eq("aluno_id", alunoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!matricula) {
    return { liberado: false, motivo: "sem_matricula", mensagem: MENSAGENS_ACESSO_BLOQUEADO.sem_matricula };
  }
  if (matricula.status === "bloqueada") {
    return { liberado: false, motivo: "bloqueada", mensagem: MENSAGENS_ACESSO_BLOQUEADO.bloqueada };
  }
  if (matricula.status === "cancelada") {
    return { liberado: false, motivo: "cancelada", mensagem: MENSAGENS_ACESSO_BLOQUEADO.cancelada };
  }
  if (matricula.status === "pendente") {
    return { liberado: false, motivo: "pendente", mensagem: MENSAGENS_ACESSO_BLOQUEADO.pendente };
  }
  // status === "ativa" a partir daqui — só falta checar o prazo.
  // acesso_expira_em null = acesso ilimitado (mesma convenção de planos.duracao_meses).
  if (matricula.acesso_expira_em && new Date(matricula.acesso_expira_em) < new Date()) {
    return { liberado: false, motivo: "expirada", mensagem: MENSAGENS_ACESSO_BLOQUEADO.expirada };
  }

  return { liberado: true };
}
