import Link from "next/link";
import { linkDaDemonstracao } from "@/lib/demonstracao/plano-de-origem";
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
    <section className="mx-auto max-w-xl px-5 py-10 sm:py-12">
      <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-orange">Inscrição</p>
      <h1 className="mt-2 text-center font-display text-[32px] font-extrabold leading-tight text-white sm:text-4xl">
        {p.nome}
      </h1>

      {/* A descrição fica alinhada à esquerda, não centralizada.
          Parágrafo centralizado com cinco linhas dá dois lados irregulares e
          obriga o olho a procurar onde cada linha começa — era o que deixava
          este bloco desalinhado no celular. Com a borda esquerda reta, o olho
          volta sempre para o mesmo ponto.
          Justificado seria pior aqui: numa coluna de celular cabem ~40
          caracteres, e esticar a linha até a margem abre buracos brancos no
          meio das frases ("rios"), porque não há espaço para redistribuir.
          `text-pretty` evita a última linha com uma palavra sozinha. */}
      {p.descricao && (
        <p className="mx-auto mt-4 max-w-[38ch] text-pretty text-left text-[15px] leading-relaxed text-white/75">
          {p.descricao}
        </p>
      )}

      {/* Preço e benefícios num cartão só: antes flutuavam soltos sobre o
          fundo azul, sem nada que dissesse onde a oferta começa e termina. */}
      <div className="mx-auto mt-7 max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="text-center">
          <p className="font-display text-[40px] font-extrabold leading-none text-white sm:text-5xl">{preco}</p>
          {p.duracao_meses && (
            <p className="mt-1.5 text-[13px] font-semibold text-white/55">
              Acesso por {p.duracao_meses} {p.duracao_meses === 1 ? "mês" : "meses"}
            </p>
          )}
        </div>

        {p.beneficios.length > 0 && (
          <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5">
            {p.beneficios.map((beneficio) => (
              // Grid em vez de flex: a coluna do ✓ tem largura fixa, então a
              // segunda linha de um benefício longo ("4 correções de redação
              // particulares com feedback detalhado") continua alinhada com a
              // primeira em vez de escorregar para debaixo do símbolo.
              <li key={beneficio} className="grid grid-cols-[18px_1fr] gap-2.5 text-[15px] leading-snug text-white/90">
                <span aria-hidden className="mt-[3px] text-sm font-bold text-orange">✓</span>
                <span>{beneficio}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* A demonstração é um caminho paralelo à compra, não um concorrente
          dela: fica acima do formulário, com peso visual de link secundário,
          para quem ainda não se convenceu ter o que ver antes de desistir.
          O link é curto de propósito (/demo/<slug>) — é ele que vai parar
          num WhatsApp — e o slug traz a pessoa de volta para ESTE plano no fim
          do tour. */}
      <Link
        href={linkDaDemonstracao(params.slug)}
        className="mx-auto mt-4 flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 font-display text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10"
      >
        <span aria-hidden>▶</span>
        Ver demonstração da plataforma
      </Link>

      <InscricaoForm plano={p} />
    </section>
  );
}
