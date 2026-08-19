import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { SubmitButton } from "@/components/admin/submit-button";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import { TabelaResponsiva } from "@/components/admin/tabela-responsiva";
import { AdminAlert } from "@/components/admin/admin-alert";
import { createAdminClient } from "@/lib/supabase/server";

const PATH = "/admin/matriculas";

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
  let query = supabase
    .from("matriculas")
    .select("id, status, created_at, profiles(nome, email, telefone), planos(nome)")
    .order("created_at", { ascending: false });

  if (searchParams.planoId) {
    query = query.eq("plano_id", searchParams.planoId);
  }

  const { data: matriculas } = await query;
  const lista = matriculas ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Matrículas</h1>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />
      {searchParams.planoId && (
        <Link href="/admin/matriculas" className="mt-1 inline-block text-sm text-navy hover:underline">
          Filtrando por plano — limpar filtro
        </Link>
      )}

      <div className="mt-6">
        <TabelaResponsiva
          linhas={lista as any[]}
          chave={(m) => m.id}
          vazio="Nenhuma matrícula ainda."
          colunas={[
            {
              titulo: "Aluno",
              principal: true,
              celula: (m) => (
                <div>
                  <p>{m.profiles?.nome ?? "—"}</p>
                  <p className="break-all text-xs text-navy-dark/50">{m.profiles?.email}</p>
                  <div className="mt-1">
                    <WhatsappButton telefone={m.profiles?.telefone ?? null} nome={m.profiles?.nome ?? "Aluno"} />
                  </div>
                </div>
              )
            },
            { titulo: "Plano", celula: (m) => m.planos?.nome },
            { titulo: "Status", celula: (m) => <span className="capitalize">{m.status}</span> }
          ]}
          acoes={(m) => (
            <form action={alterarStatus} className="flex flex-wrap gap-3">
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
