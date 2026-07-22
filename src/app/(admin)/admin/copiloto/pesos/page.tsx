import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";

const PATH = "/admin/copiloto/pesos";

async function salvarPeso(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const materia = String(formData.get("materia") ?? "").trim();
  const peso = Number(formData.get("peso") ?? 1);
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!materia) redirect(`${PATH}?erro=${encodeURIComponent("Informe o nome da matéria.")}`);
  if (isNaN(peso) || peso < 0) redirect(`${PATH}?erro=${encodeURIComponent("O peso precisa ser um número maior ou igual a 0.")}`);

  const { error } = await supabase.from("materias_peso").upsert(
    { materia, peso, observacao },
    { onConflict: "materia" }
  );
  revalidatePath(PATH);
  if (error) redirect(`${PATH}?erro=${encodeURIComponent("Não foi possível salvar o peso.")}`);
  redirect(`${PATH}?sucesso=${encodeURIComponent(`Peso de ${materia} salvo.`)}`);
}

async function excluirPeso(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("materias_peso").delete().eq("materia", String(formData.get("materia")));
  revalidatePath(PATH);
}

export default async function AdminPesosPage({
  searchParams
}: {
  searchParams: { erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.from("materias_peso").select("*").order("peso", { ascending: false });
  const lista = data ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Pesos oficiais da FACAPE</h1>
      <p className="mt-1 text-sm text-navy-dark/60">
        Esses pesos são usados pelo Copiloto (e no cálculo de nota do simulado) para priorizar o que o aluno
        deve revisar. Consulte a tabela oficial mais recente da FACAPE e mantenha os valores atualizados.
      </p>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Matéria</th>
              <th className="p-3">Peso</th>
              <th className="p-3">Observação</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p: any) => (
              <tr key={p.materia} className="border-t">
                <td className="p-3 font-semibold">{p.materia}</td>
                <td className="p-3">{p.peso}</td>
                <td className="p-3 text-navy-dark/60">{p.observacao ?? "—"}</td>
                <td className="p-3">
                  <form action={excluirPeso}>
                    <input type="hidden" name="materia" value={p.materia} />
                    <SubmitButton pendingText="..." className="text-red-600 hover:underline">Excluir</SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-navy-dark/50">Nenhum peso configurado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Adicionar / atualizar peso</h2>
        <p className="mt-1 text-xs text-navy-dark/50">
          Se a matéria já existir, o peso será atualizado; senão, criada.
        </p>
        <form action={salvarPeso} className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-semibold" htmlFor="materia">Matéria</label>
            <input id="materia" name="materia" required placeholder="Biologia" className="mt-1 w-full rounded-lg border p-3" />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="peso">Peso (ex: 2.0)</label>
            <input id="peso" name="peso" type="number" step="0.1" min="0" defaultValue="1.0" required className="mt-1 w-full rounded-lg border p-3" />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="observacao">Observação (opcional)</label>
            <input id="observacao" name="observacao" className="mt-1 w-full rounded-lg border p-3" />
          </div>
          <SubmitButton
            pendingText="Salvando..."
            className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
          >
            Salvar peso
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
