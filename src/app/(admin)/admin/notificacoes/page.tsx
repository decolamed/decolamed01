import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/admin/card";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";

const PATH = "/admin/notificacoes";

async function enviarNotificacao(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const destino = String(formData.get("destino") ?? "todos");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const mensagem = String(formData.get("mensagem") ?? "").trim();

  if (!titulo || !mensagem) {
    redirect(`${PATH}?erro=${encodeURIComponent("Preencha o título e a mensagem.")}`);
  }

  let usuarioIds: string[];
  if (destino === "todos") {
    const { data: alunos } = await supabase.from("profiles").select("id").eq("role", "aluno");
    usuarioIds = (alunos ?? []).map((a: any) => a.id);
  } else {
    usuarioIds = [destino];
  }

  if (usuarioIds.length === 0) {
    redirect(`${PATH}?erro=${encodeURIComponent("Nenhum destinatário encontrado.")}`);
  }

  const linhas = usuarioIds.map((usuarioId) => ({ usuario_id: usuarioId, titulo, mensagem, lida: false }));
  const { error } = await supabase.from("notificacoes").insert(linhas);

  if (error) {
    redirect(`${PATH}?erro=${encodeURIComponent("Não foi possível enviar a notificação.")}`);
  }
  redirect(`${PATH}?sucesso=${encodeURIComponent(`Notificação enviada para ${usuarioIds.length} aluno(s).`)}`);
}

export default async function AdminNotificacoesPage({
  searchParams
}: {
  searchParams: { erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: alunosData } = await supabase.from("profiles").select("id, nome").eq("role", "aluno").order("nome");
  const alunos = alunosData ?? [];

  return (
    <div>
      <PageHeader title="Notificações" subtitle="Envie um aviso para um aluno específico ou para todos de uma vez" />
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <Card className="mt-4 max-w-xl">
        <form action={enviarNotificacao} className="space-y-3">
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40" htmlFor="destino">Destinatário</label>
            <select id="destino" name="destino" defaultValue="todos" className="mt-1.5 w-full rounded-[10px] border border-navy-dark/15 px-3 py-2.5 text-xs font-bold text-navy-dark outline-none focus:border-navy">
              <option value="todos">Todos os alunos</option>
              {alunos.map((a: any) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40" htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" required placeholder="Simulado disponível!" className="mt-1.5 w-full rounded-[10px] border border-navy-dark/15 px-3 py-2.5 text-xs font-bold text-navy-dark outline-none focus:border-navy" />
          </div>
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40" htmlFor="mensagem">Mensagem</label>
            <textarea id="mensagem" name="mensagem" required rows={3} className="mt-1.5 w-full resize-y rounded-[10px] border border-navy-dark/15 px-3 py-2.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy" />
          </div>
          <SubmitButton
            pendingText="Enviando..."
            className="rounded-[11px] bg-orange px-6 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-orange-dark"
          >
            Enviar notificação
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
