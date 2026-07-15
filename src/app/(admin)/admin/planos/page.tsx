import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import type { Plano } from "@/types/database";

async function criarPlano(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const beneficios = String(formData.get("beneficios") ?? "")
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  await supabase.from("planos").insert({
    nome: String(formData.get("nome")),
    slug: String(formData.get("slug")),
    descricao: String(formData.get("descricao") ?? ""),
    preco_centavos: Math.round(Number(formData.get("preco")) * 100),
    beneficios,
    ativo: true,
    ordem: Number(formData.get("ordem") ?? 0)
  });

  revalidatePath("/admin/planos");
  revalidatePath("/planos");
}

async function alternarAtivo(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const ativo = formData.get("ativo") === "true";
  await supabase.from("planos").update({ ativo: !ativo }).eq("id", id);
  revalidatePath("/admin/planos");
  revalidatePath("/planos");
}

async function excluirPlano(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("planos").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/planos");
  revalidatePath("/planos");
}

export default async function AdminPlanosPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: planos } = await supabase.from("planos").select("*").order("ordem");
  const lista = (planos as Plano[]) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Planos</h1>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((plano) => (
              <tr key={plano.id} className="border-t">
                <td className="p-3">{plano.nome}</td>
                <td className="p-3">{(plano.preco_centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="p-3">{plano.ativo ? "Ativo" : "Inativo"}</td>
                <td className="flex gap-3 p-3">
                  <form action={alternarAtivo}>
                    <input type="hidden" name="id" value={plano.id} />
                    <input type="hidden" name="ativo" value={String(plano.ativo)} />
                    <button className="text-orange-dark hover:underline">
                      {plano.ativo ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                  <form action={excluirPlano}>
                    <input type="hidden" name="id" value={plano.id} />
                    <button className="text-red-600 hover:underline">Excluir</button>
                  </form>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-navy-dark/50">Nenhum plano cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Novo plano</h2>
        <form action={criarPlano} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" name="nome" required />
            <Field label="Slug (para URL)" name="slug" required placeholder="plano-intensivo" />
            <Field label="Preço (R$)" name="preco" type="number" step="0.01" required />
            <Field label="Ordem de exibição" name="ordem" type="number" defaultValue="0" />
          </div>
          <div>
            <label className="text-sm font-semibold">Descrição</label>
            <textarea name="descricao" rows={2} className="mt-1 w-full rounded-lg border p-3" />
          </div>
          <div>
            <label className="text-sm font-semibold">Benefícios (um por linha)</label>
            <textarea name="beneficios" rows={4} className="mt-1 w-full rounded-lg border p-3" />
          </div>
          <button className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark">
            Cadastrar plano
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  step
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        step={step}
        className="mt-1 w-full rounded-lg border p-3"
      />
    </div>
  );
}
