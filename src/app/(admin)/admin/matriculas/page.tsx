import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

async function alterarStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await supabase
    .from("matriculas")
    .update({
      status,
      acesso_liberado_manualmente: status === "ativa",
      acesso_liberado_em: status === "ativa" ? new Date().toISOString() : null
    })
    .eq("id", id);
  revalidatePath("/admin/matriculas");
}

export default async function AdminMatriculasPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: matriculas } = await supabase
    .from("matriculas")
    .select("id, status, created_at, profiles(nome, email), planos(nome)")
    .order("created_at", { ascending: false });

  const lista = matriculas ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Matrículas</h1>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Aluno</th>
              <th className="p-3">Plano</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((m: any) => (
              <tr key={m.id} className="border-t">
                <td className="p-3">
                  <p>{m.profiles?.nome ?? "—"}</p>
                  <p className="text-xs text-navy-dark/50">{m.profiles?.email}</p>
                </td>
                <td className="p-3">{m.planos?.nome}</td>
                <td className="p-3 capitalize">{m.status}</td>
                <td className="p-3">
                  <form action={alterarStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={m.id} />
                    <button name="status" value="ativa" className="text-green-700 hover:underline">Liberar</button>
                    <button name="status" value="bloqueada" className="text-red-600 hover:underline">Bloquear</button>
                  </form>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-navy-dark/50">Nenhuma matrícula ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
