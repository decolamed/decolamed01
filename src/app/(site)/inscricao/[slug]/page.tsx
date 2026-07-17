import { createClient } from "@/lib/supabase/server";
import { InscricaoForm } from "@/components/site/matricula-form";
import type { Plano } from "@/types/database";

// Página pública com URL permanente por plano (não expira, vários alunos
// podem comprar pelo mesmo link). O admin copia esse link em /admin/planos.
export default async function InscricaoPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: plano } = await supabase
    .from("planos")
    .select("*")
    .eq("slug", params.slug)
    .eq("ativo", true)
    .single();

  if (!plano) {
    // Mensagem própria (em vez do notFound() padrão do Next) — o 404 padrão
    // renderiza texto escuro, que ficava invisível sobre o fundo azul-escuro
    // deste layout, parecendo uma "página em branco" sem nenhuma explicação.
    return (
      <section className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-white">Link não encontrado</h1>
        <p className="mt-3 text-white/70">
          Não encontramos nenhum plano ativo com o endereço <span className="font-mono">/inscricao/{params.slug}</span>.
          Confira se o link foi copiado corretamente, ou se o plano ainda está ativo em /admin/planos.
        </p>
      </section>
    );
  }
  const p = plano as Plano;
  const preco = (p.preco_centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <section className="mx-auto max-w-xl px-5 py-12">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-orange">Inscrição</p>
      <h1 className="mt-2 text-center font-display text-3xl font-extrabold text-white">{p.nome}</h1>
      {p.descricao && <p className="mt-3 text-center text-white/80">{p.descricao}</p>}

      <p className="mt-4 text-center font-display text-2xl font-bold text-white">{preco}</p>
      {p.duracao_meses && (
        <p className="text-center text-sm text-white/60">Acesso por {p.duracao_meses} meses</p>
      )}

      {p.beneficios.length > 0 && (
        <ul className="mx-auto mt-6 max-w-md space-y-2 text-white/90">
          {p.beneficios.map((beneficio) => (
            <li key={beneficio} className="flex gap-2">
              <span className="text-orange">✓</span>
              <span>{beneficio}</span>
            </li>
          ))}
        </ul>
      )}

      <InscricaoForm plano={p} />
    </section>
  );
}
