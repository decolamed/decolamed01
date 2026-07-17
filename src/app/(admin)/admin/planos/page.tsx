import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { CopiarLinkButton } from "@/components/admin/copiar-link-button";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { slugificar } from "@/lib/site/slugificar";
import type { Plano } from "@/types/database";

async function criarPlano(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const beneficios = String(formData.get("beneficios") ?? "")
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  const duracao = String(formData.get("duracao_meses") ?? "");
  // Nunca salva o slug exatamente como foi digitado — sempre normalizado
  // (minúsculo, sem espaço/acento) para nunca gerar um link quebrado.
  const slug = slugificar(String(formData.get("slug") ?? ""));

  if (!slug) {
    redirect(`/admin/planos?erro=${encodeURIComponent("Informe um slug válido (ex.: plano-intensivo).")}`);
  }

  const { error } = await supabase.from("planos").insert({
    nome: String(formData.get("nome")),
    slug,
    descricao: String(formData.get("descricao") ?? ""),
    preco_centavos: Math.round(Number(formData.get("preco")) * 100),
    duracao_meses: duracao ? Number(duracao) : null,
    beneficios,
    ativo: true,
    ordem: Number(formData.get("ordem") ?? 0)
  });

  revalidatePath("/admin/planos");
  revalidatePath("/planos");

  if (error) {
    const mensagem = error.message.includes("duplicate")
      ? "Já existe um plano com esse slug. Escolha outro."
      : "Não foi possível criar o plano.";
    redirect(`/admin/planos?erro=${encodeURIComponent(mensagem)}`);
  }
  redirect("/admin/planos?sucesso=Plano criado com sucesso.");
}

async function alternarAtivo(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const ativo = formData.get("ativo") === "true";
  const { error } = await supabase.from("planos").update({ ativo: !ativo }).eq("id", id);
  revalidatePath("/admin/planos");
  revalidatePath("/planos");
  if (error) redirect(`/admin/planos?erro=${encodeURIComponent("Não foi possível alterar o status do plano.")}`);
}

async function excluirPlano(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("planos").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/planos");
  revalidatePath("/planos");
  if (error) {
    // Ex: plano com matrículas vinculadas (FK) não pode ser excluído — só desativado.
    redirect(
      `/admin/planos?erro=${encodeURIComponent("Não foi possível excluir: este plano já tem inscritos. Desative-o em vez de excluir.")}`
    );
  }
}

export default async function AdminPlanosPage({
  searchParams
}: {
  searchParams: { erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: planos } = await supabase.from("planos").select("*").order("ordem");
  const lista = (planos as Plano[]) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Planos</h1>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Duração</th>
              <th className="p-3">Link público</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((plano) => (
              <tr key={plano.id} className="border-t">
                <td className="p-3">{plano.nome}</td>
                <td className="p-3">
                  {(plano.preco_centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="p-3">{plano.duracao_meses ? `${plano.duracao_meses} meses` : "Ilimitado"}</td>
                <td className="p-3">
                  <CopiarLinkButton path={`/inscricao/${plano.slug}`} />
                </td>
                <td className="p-3">{plano.ativo ? "Ativo" : "Inativo"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/admin/planos/${plano.id}/editar`} className="text-navy hover:underline">
                      Editar
                    </Link>
                    <Link href={`/admin/matriculas?planoId=${plano.id}`} className="text-navy hover:underline">
                      Ver inscritos
                    </Link>
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
                  </div>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-navy-dark/50">Nenhum plano cadastrado.</td>
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
            <Field
              label="Duração do acesso (meses, vazio = ilimitado)"
              name="duracao_meses"
              type="number"
              placeholder="Ex: 12"
            />
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
          <SubmitButton pendingText="Cadastrando...">Cadastrar plano</SubmitButton>
        </form>
      </div>
    </div>
  );
}

export function Field({
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
