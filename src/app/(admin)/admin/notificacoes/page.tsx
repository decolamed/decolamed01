import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader, Card, Th, Td } from "@/components/admin/card";
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

  // Histórico: agrupa por (título, created_at) — cada envio insere N linhas
  // (uma por destinatário) com o mesmo timestamp, então isso reconstrói a
  // "campanha" sem precisar de uma tabela própria de envios.
  const { data: notifData } = await supabase
    .from("notificacoes")
    .select("titulo, mensagem, created_at, lida")
    .order("created_at", { ascending: false })
    .limit(500);
  const campanhas = new Map<string, { titulo: string; mensagem: string; created_at: string; total: number; lidas: number }>();
  (notifData ?? []).forEach((n: any) => {
    const chave = n.titulo + "||" + n.created_at;
    const atual = campanhas.get(chave) ?? { titulo: n.titulo, mensagem: n.mensagem, created_at: n.created_at, total: 0, lidas: 0 };
    atual.total++;
    if (n.lida) atual.lidas++;
    campanhas.set(chave, atual);
  });
  const historico = Array.from(campanhas.values()).slice(0, 50);

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

      <h2 className="mt-8 font-display text-lg font-bold text-navy-dark">Histórico de envios</h2>
      <Card className="mt-3 !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <Th>Título</Th>
                <Th>Mensagem</Th>
                <Th>Enviado em</Th>
                <Th>Destinatários</Th>
                <Th>Lidas</Th>
              </tr>
            </thead>
            <tbody>
              {historico.map((c, i) => (
                <tr key={i} className="border-t border-navy-dark/10">
                  <Td className="font-bold text-navy-dark">{c.titulo}</Td>
                  <Td className="max-w-xs truncate text-navy-dark/70">{c.mensagem}</Td>
                  <Td>{new Date(c.created_at).toLocaleString("pt-BR")}</Td>
                  <Td>{c.total}</Td>
                  <Td>{c.lidas} / {c.total}</Td>
                </tr>
              ))}
              {historico.length === 0 && (
                <tr>
                  <Td className="text-navy-dark/50">Nenhuma notificação enviada ainda.</Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
