import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { SubmitButton } from "@/components/admin/submit-button";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import { TabelaResponsiva } from "@/components/admin/tabela-responsiva";
import { AdminAlert } from "@/components/admin/admin-alert";
import { PageHeader, StatCard, Badge } from "@/components/admin/card";
import { createAdminClient } from "@/lib/supabase/server";
import { formatarData } from "@/lib/formatacao";
import type { MatriculaStatus } from "@/types/database";

const PATH = "/admin/matriculas";

const STATUS_TOM: Record<string, "green" | "red" | "orange" | "neutral"> = {
  ativa: "green",
  pendente: "orange",
  bloqueada: "red",
  cancelada: "neutral"
};

const STATUS_LABEL: Record<string, string> = {
  ativa: "Ativa",
  pendente: "Pendente",
  bloqueada: "Bloqueada",
  cancelada: "Cancelada"
};

const ORIGEM_LABEL: Record<string, string> = {
  asaas: "Compra pelo site",
  manual: "Liberada à mão",
  cortesia: "Cortesia/bolsa"
};

interface LinhaDeMatricula {
  id: string;
  status: MatriculaStatus;
  created_at: string;
  origem_pagamento: string | null;
  acesso_expira_em: string | null;
  aluno: { id: string; nome: string | null; email: string | null; telefone: string | null } | null;
  planos: { nome: string } | null;
}

async function alterarStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const { error } = await supabase
    .from("matriculas")
    .update({
      status,
      acesso_liberado_manualmente: status === "ativa",
      acesso_liberado_em: status === "ativa" ? new Date().toISOString() : null
    })
    .eq("id", id);
  revalidatePath(PATH);

  // Essa ação controla de verdade se o aluno consegue acessar a plataforma
  // (ver lib/matricula/acesso.ts) — um erro silencioso aqui já causou
  // confusão real, por isso agora sempre avisa o admin explicitamente.
  if (error) {
    redirect(`${PATH}?erro=${encodeURIComponent("Não foi possível atualizar o status da matrícula.")}`);
  }
  redirect(`${PATH}?sucesso=${encodeURIComponent("Status da matrícula atualizado.")}`);
}

export default async function AdminMatriculasPage({
  searchParams
}: {
  searchParams: { planoId?: string; erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  // O nome do vínculo precisa ser explícito: `matriculas` tem DUAS chaves
  // estrangeiras para `profiles` — `aluno_id` (de quem é a matrícula) e
  // `criado_por` (quem a liberou à mão, migração 005). Pedir só
  // `profiles(...)` deixa o PostgREST sem saber qual das duas seguir, e ele
  // recusa a consulta inteira (PGRST201) em vez de escolher uma. Como o erro
  // era descartado aqui, a falha aparecia como "Nenhuma matrícula ainda"
  // mesmo com matrículas ativas no banco.
  let query = supabase
    .from("matriculas")
    .select(
      "id, status, created_at, origem_pagamento, acesso_expira_em, aluno:profiles!matriculas_aluno_id_fkey(id, nome, email, telefone), planos(nome)"
    )
    .order("created_at", { ascending: false });

  if (searchParams.planoId) {
    query = query.eq("plano_id", searchParams.planoId);
  }

  const { data: matriculas, error } = await query;
  const lista = (matriculas as unknown as LinhaDeMatricula[] | null) ?? [];

  const porStatus = (alvo: MatriculaStatus) => lista.filter((m) => m.status === alvo).length;

  return (
    <div>
      <PageHeader
        title="Matrículas"
        subtitle="Quem tem acesso à plataforma, em qual plano e desde quando. É aqui que se libera, bloqueia ou cancela o acesso de um aluno."
      />
      <AdminAlert
        erro={
          error
            ? `Não foi possível carregar as matrículas: ${error.message}`
            : searchParams.erro
        }
        sucesso={searchParams.sucesso}
      />

      {searchParams.planoId && (
        <Link href="/admin/matriculas" className="mt-1 inline-block text-sm font-semibold text-navy hover:underline">
          Filtrando por plano — limpar filtro
        </Link>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Ativas" value={porStatus("ativa")} tone="green" />
        <StatCard label="Pendentes" value={porStatus("pendente")} tone="orange" />
        <StatCard label="Bloqueadas" value={porStatus("bloqueada")} />
        <StatCard label="Canceladas" value={porStatus("cancelada")} />
      </div>

      <div className="mt-5">
        <TabelaResponsiva<LinhaDeMatricula>
          linhas={lista}
          chave={(m) => m.id}
          vazio={
            error
              ? "Não foi possível carregar as matrículas — veja o aviso acima."
              : "Nenhuma matrícula ainda."
          }
          colunas={[
            {
              titulo: "Aluno",
              principal: true,
              celula: (m) => (
                <div>
                  {m.aluno?.id ? (
                    <Link href={`/admin/usuarios/${m.aluno.id}`} className="text-navy-dark hover:underline">
                      {m.aluno.nome ?? "—"}
                    </Link>
                  ) : (
                    <p className="text-navy-dark/50">Sem aluno vinculado</p>
                  )}
                  <p className="break-all text-xs font-semibold text-navy-dark/50">{m.aluno?.email}</p>
                  <div className="mt-1.5">
                    <WhatsappButton telefone={m.aluno?.telefone ?? null} nome={m.aluno?.nome ?? "Aluno"} />
                  </div>
                </div>
              )
            },
            { titulo: "Plano", celula: (m) => m.planos?.nome ?? "—" },
            { titulo: "Origem", celula: (m) => ORIGEM_LABEL[m.origem_pagamento ?? ""] ?? "—" },
            { titulo: "Desde", celula: (m) => formatarData(m.created_at) },
            {
              titulo: "Acesso até",
              celula: (m) => (m.acesso_expira_em ? formatarData(m.acesso_expira_em) : "Sem prazo")
            },
            {
              titulo: "Status",
              celula: (m) => (
                <Badge tone={STATUS_TOM[m.status] ?? "neutral"}>{STATUS_LABEL[m.status] ?? m.status}</Badge>
              )
            }
          ]}
          acoes={(m) => (
            <form action={alterarStatus} className="flex flex-wrap gap-3 text-xs font-bold">
              <input type="hidden" name="id" value={m.id} />
              <SubmitButton name="status" value="ativa" pendingText="..." className="text-green hover:underline">Liberar</SubmitButton>
              <SubmitButton name="status" value="bloqueada" pendingText="..." className="text-red hover:underline">Bloquear</SubmitButton>
              <SubmitButton name="status" value="cancelada" pendingText="..." className="text-navy-dark/60 hover:underline">Cancelar</SubmitButton>
            </form>
          )}
        />
      </div>
    </div>
  );
}
