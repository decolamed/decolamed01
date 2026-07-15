import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/button";
import type { Plano } from "@/types/database";

function formatPreco(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PlanosPage() {
  const supabase = createClient();
  const { data: planos } = await supabase
    .from("planos")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  const lista = (planos as Plano[]) ?? [];

  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-center font-display text-3xl font-extrabold text-white">Escolha seu plano</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-white/70">
        Todos os planos incluem cronograma, questões, simulados e acompanhamento de desempenho.
      </p>

      {lista.length === 0 ? (
        <p className="mt-12 text-center text-white/60">
          Nenhum plano ativo no momento. Cadastre planos pelo painel administrativo em{" "}
          <code className="text-orange">/admin/planos</code>.
        </p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((plano) => (
            <div key={plano.id} className="flex flex-col rounded-3xl bg-white p-6 text-navy-dark shadow-xl">
              <h2 className="font-display text-xl font-bold">{plano.nome}</h2>
              {plano.descricao && <p className="mt-1 text-sm text-navy-dark/70">{plano.descricao}</p>}
              <p className="mt-4 font-display text-3xl font-extrabold text-orange">
                {formatPreco(plano.preco_centavos)}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {(plano.beneficios ?? []).map((beneficio) => (
                  <li key={beneficio} className="flex gap-2">
                    <span className="text-orange">✓</span>
                    <span>{beneficio}</span>
                  </li>
                ))}
              </ul>
              <LinkButton href={`/matricula?plano=${plano.slug}`} className="mt-6">
                Quero este plano
              </LinkButton>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
