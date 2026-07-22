import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { Field } from "@/app/(admin)/admin/planos/page";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { slugificar } from "@/lib/site/slugificar";
import type { Plano } from "@/types/database";

async function salvarPlano(id: string, formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const beneficios = String(formData.get("beneficios") ?? "")
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  const duracao = String(formData.get("duracao_meses") ?? "");
  const slug = slugificar(String(formData.get("slug") ?? ""));

  if (!slug) {
    redirect(`/admin/planos/${id}/editar?erro=${encodeURIComponent("Informe um slug válido (ex.: plano-intensivo).")}`);
  }

  const { error } = await supabase
    .from("planos")
    .update({
      nome: String(formData.get("nome")),
      slug,
      descricao: String(formData.get("descricao") ?? ""),
      preco_centavos: Math.round(Number(formData.get("preco")) * 100),
      duracao_meses: duracao ? Number(duracao) : null,
      creditos_redacao: Number(formData.get("creditos_redacao") ?? 0),
      tem_copiloto: formData.get("tem_copiloto") === "on",
      beneficios,
      ordem: Number(formData.get("ordem") ?? 0)
    })
    .eq("id", id);

  revalidatePath("/admin/planos");
  revalidatePath("/planos");

  if (error) {
    const mensagem = error.message.includes("duplicate")
      ? "Já existe um plano com esse slug. Escolha outro."
      : "Não foi possível salvar as alterações.";
    redirect(`/admin/planos/${id}/editar?erro=${encodeURIComponent(mensagem)}`);
  }

  redirect("/admin/planos?sucesso=Plano atualizado com sucesso.");
}

export default async function EditarPlanoPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { erro?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: plano } = await supabase.from("planos").select("*").eq("id", params.id).single();

  if (!plano) notFound();
  const p = plano as Plano;
  const salvarComId = salvarPlano.bind(null, p.id);

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold text-navy-dark">Editar plano</h1>
      <AdminAlert erro={searchParams.erro} />

      <form action={salvarComId} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" name="nome" required defaultValue={p.nome} />
          <Field label="Slug (para URL)" name="slug" required defaultValue={p.slug} />
          <Field label="Preço (R$)" name="preco" type="number" step="0.01" required defaultValue={String(p.preco_centavos / 100)} />
          <Field
            label="Duração do acesso (meses, vazio = ilimitado)"
            name="duracao_meses"
            type="number"
            defaultValue={p.duracao_meses ? String(p.duracao_meses) : ""}
          />
          <Field label="Ordem de exibição" name="ordem" type="number" defaultValue={String(p.ordem)} />
          <Field
            label="Créditos de redação incluídos"
            name="creditos_redacao"
            type="number"
            defaultValue={String(p.creditos_redacao ?? 0)}
          />
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-navy/10 bg-navy/5 p-3 text-sm">
          <input type="checkbox" name="tem_copiloto" defaultChecked={p.tem_copiloto ?? false} />
          <span>
            <strong>Ativar Copiloto adaptativo</strong> — este plano terá cronograma inteligente que se
            adapta ao desempenho do aluno.
          </span>
        </label>
        <div>
          <label className="text-sm font-semibold">Descrição</label>
          <textarea name="descricao" rows={2} defaultValue={p.descricao ?? ""} className="mt-1 w-full rounded-lg border p-3" />
        </div>
        <div>
          <label className="text-sm font-semibold">Benefícios (um por linha)</label>
          <textarea
            name="beneficios"
            rows={4}
            defaultValue={p.beneficios.join("\n")}
            className="mt-1 w-full rounded-lg border p-3"
          />
        </div>
        <SubmitButton
          pendingText="Salvando..."
          className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Salvar alterações
        </SubmitButton>
      </form>
    </div>
  );
}
