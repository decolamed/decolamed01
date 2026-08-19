import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { CopiarLinkButton } from "@/components/admin/copiar-link-button";
import { TabelaResponsiva } from "@/components/admin/tabela-responsiva";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { slugificar } from "@/lib/site/slugificar";
import { ehSlugDuplicado, mensagemDeSlugDuplicado } from "@/lib/site/erro-de-plano";
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
    creditos_redacao: Number(formData.get("creditos_redacao") ?? 0),
    tem_copiloto: formData.get("tem_copiloto") === "on",
    beneficios,
    ativo: true,
    ordem: Number(formData.get("ordem") ?? 0)
  });

  revalidatePath("/admin/planos");
  revalidatePath("/planos");

  if (error) {
    // O motivo real vai para o log: sem ele, um erro fora do caso conhecido
    // vira "Não foi possível criar o plano." e não sobra pista nenhuma.
    console.error("Falha ao criar plano:", error.code, error.message);

    let mensagem = "Não foi possível criar o plano.";
    if (ehSlugDuplicado(error)) {
      const { data: dono } = await supabase.from("planos").select("nome").eq("slug", slug).maybeSingle();
      mensagem = mensagemDeSlugDuplicado(slug, dono?.nome);
    }
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
      <h1 className="font-display text-xl font-bold text-navy-dark sm:text-2xl">Planos</h1>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <div className="mt-6">
        <TabelaResponsiva
          linhas={lista}
          chave={(plano) => plano.id}
          vazio="Nenhum plano cadastrado."
          colunas={[
            { titulo: "Nome", principal: true, celula: (plano) => plano.nome },
            {
              titulo: "Preço",
              celula: (plano) =>
                (plano.preco_centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            },
            { titulo: "Duração", celula: (plano) => (plano.duracao_meses ? `${plano.duracao_meses} meses` : "Ilimitado") },
            { titulo: "Link público", celula: (plano) => <CopiarLinkButton path={`/inscricao/${plano.slug}`} /> },
            { titulo: "Status", celula: (plano) => (plano.ativo ? "Ativo" : "Inativo") }
          ]}
          acoes={(plano) => (
            <>
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
                <button className="text-red hover:underline">Excluir</button>
              </form>
            </>
          )}
        />
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
            <Field
              label="Créditos de redação incluídos"
              name="creditos_redacao"
              type="number"
              defaultValue="0"
            />
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-navy/10 bg-navy/5 p-3 text-sm">
            <input type="checkbox" name="tem_copiloto" />
            <span>
              <strong>Ativar Copiloto adaptativo</strong> — este plano terá cronograma inteligente que se
              adapta ao desempenho do aluno.
            </span>
          </label>
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
