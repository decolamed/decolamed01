import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

async function resetarSenha(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const email = String(formData.get("email"));
  // Envia e-mail de recuperação — o próprio usuário define a nova senha.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha`
  });
  revalidatePath("/admin/usuarios");
}

async function alterarPlano(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("profiles")
    .update({ plano_id: String(formData.get("planoId")) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/usuarios");
}

export default async function AdminUsuariosPage({
  searchParams
}: {
  searchParams: { q?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase.from("profiles").select("*, planos(nome)").order("created_at", { ascending: false });
  if (searchParams.q) {
    query = query.or(`nome.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`);
  }
  const { data: usuarios } = await query;
  const { data: planos } = await supabase.from("planos").select("id, nome").eq("ativo", true);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Usuários</h1>

      <form className="mt-4" action="/admin/usuarios">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Buscar por nome ou e-mail"
          className="w-full max-w-sm rounded-lg border p-3"
        />
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Plano</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(usuarios ?? []).map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.nome}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <form action={alterarPlano} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="planoId" defaultValue={u.plano_id ?? ""} className="rounded border p-1">
                      {(planos ?? []).map((p: any) => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                    <button className="text-orange-dark hover:underline">Salvar</button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={resetarSenha}>
                    <input type="hidden" name="email" value={u.email} />
                    <button className="text-navy hover:underline">Resetar senha</button>
                  </form>
                </td>
              </tr>
            ))}
            {(usuarios ?? []).length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-navy-dark/50">Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
