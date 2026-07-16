import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";

const CAMPOS = [
  { chave: "site.hero.titulo", label: "Título de destaque da home" },
  { chave: "site.contato.whatsapp", label: "WhatsApp (somente números, com DDI)" },
  { chave: "site.contato.instagram", label: "Usuário do Instagram" }
];

async function salvarConfiguracoes(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  await Promise.all(
    CAMPOS.map((campo) =>
      supabase
        .from("configuracoes")
        .upsert(
          { chave: campo.chave, valor: JSON.stringify(String(formData.get(campo.chave) ?? "")) },
          { onConflict: "chave" }
        )
    )
  );

  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
  revalidatePath("/contato");
  redirect("/admin/configuracoes?sucesso=Configurações salvas com sucesso.");
}

export default async function AdminConfiguracoesPage({
  searchParams
}: {
  searchParams: { sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: config } = await supabase.from("configuracoes").select("chave, valor");

  const valores = new Map((config ?? []).map((c) => [c.chave, c.valor as string]));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Configurações do site</h1>
      <p className="mt-2 text-navy-dark/70">
        Textos e informações institucionais exibidos no site público — nada fica fixo no código.
      </p>
      <AdminAlert sucesso={searchParams.sucesso} />

      <form action={salvarConfiguracoes} className="mt-6 max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow">
        {CAMPOS.map((campo) => (
          <div key={campo.chave}>
            <label className="text-sm font-semibold" htmlFor={campo.chave}>{campo.label}</label>
            <input
              id={campo.chave}
              name={campo.chave}
              defaultValue={valores.get(campo.chave) ?? ""}
              className="mt-1 w-full rounded-lg border p-3"
            />
          </div>
        ))}
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
