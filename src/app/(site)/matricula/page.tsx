import { createClient } from "@/lib/supabase/server";
import type { Plano } from "@/types/database";
import { MatriculaForm } from "@/components/site/matricula-form";

export default async function MatriculaPage({
  searchParams
}: {
  searchParams: { plano?: string };
}) {
  const supabase = createClient();
  const { data: planos } = await supabase.from("planos").select("*").eq("ativo", true).order("ordem");

  const lista = (planos as Plano[]) ?? [];
  const planoSelecionado = lista.find((p) => p.slug === searchParams.plano) ?? lista[0];

  return (
    <section className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-display text-3xl font-extrabold text-white">Matrícula</h1>
      <p className="mt-2 text-white/70">
        Preencha seus dados para gerar a cobrança. Após a confirmação do pagamento, você recebe um e-mail
        para criar sua senha e acessar a plataforma.
      </p>

      {!planoSelecionado ? (
        <p className="mt-8 text-white/60">Nenhum plano disponível no momento.</p>
      ) : (
        <MatriculaForm planos={lista} planoInicialId={planoSelecionado.id} />
      )}
    </section>
  );
}
