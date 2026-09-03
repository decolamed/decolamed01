import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { autoresAbreviados, renderizar } from "@/lib/resumo/renderizar";
import { BotaoImprimir } from "@/components/botao-imprimir";
import { codigoDaSp, type Resumo, type SituacaoProblema, type Tutoria } from "@/types/banco";

export const dynamic = "force-dynamic";

type ResumoCompleto = Resumo & {
  situacao: SituacaoProblema & { tutoria: Tutoria };
};

export default async function PaginaResumo({ params }: { params: { id: string } }) {
  const supabase = criarClienteServidor();

  const { data: resumo } = await supabase
    .from("resumos")
    .select("*, situacao:situacoes_problema(*, tutoria:tutorias(*))")
    .eq("id", params.id)
    .maybeSingle<ResumoCompleto>();

  if (!resumo) notFound();

  const { html, citadas, citacoesOrfas } = renderizar(resumo.corpo, resumo.referencias ?? []);
  const codigo = codigoDaSp(resumo.situacao.tutoria, resumo.situacao);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="nao-imprimir mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/sp/${resumo.sp_id}`}
          className="text-sm text-tinta-500 transition hover:text-ciano-600"
        >
          ← SP {codigo} — {resumo.situacao.titulo}
        </Link>
        <BotaoImprimir />
      </div>

      <article className="area-de-impressao rounded-2xl border border-tinta-200 bg-white px-8 py-10 shadow-carta sm:px-12">
        <header className="mb-8 border-b-2 border-tinta-950 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ciano-600">
            {resumo.situacao.tutoria.modulo ? `${resumo.situacao.tutoria.modulo} · ` : ""}
            Tutoria {resumo.situacao.tutoria.numero} · SP {codigo}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-tinta-950">
            {resumo.titulo}
          </h1>
          <p className="mt-2 text-xs text-tinta-500">
            {resumo.situacao.titulo} · salvo em{" "}
            {new Date(resumo.criado_em).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric"
            })}
          </p>
        </header>

        {/* Seguro por construção: `renderizar` escapa todo o texto de entrada
            antes de montar a marcação, e só emite as tags dele mesmo. */}
        <div className="resumo max-w-leitura" dangerouslySetInnerHTML={{ __html: html }} />

        {citadas.length > 0 ? (
          <section className="mt-12 border-t-2 border-tinta-200 pt-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-tinta-500">
              Fontes
            </h2>
            <ol className="space-y-3">
              {citadas.map((r, i) => (
                <li
                  key={r.pmid}
                  id={`fonte-${r.pmid}`}
                  className="fonte flex gap-3 px-1.5 py-1 text-sm leading-snug"
                >
                  <span className="shrink-0 font-mono text-xs font-semibold text-ciano-600">
                    {i + 1}.
                  </span>
                  <span className="text-tinta-700">
                    {autoresAbreviados(r.autores)}
                    {r.autores.length > 0 ? ". " : ""}
                    <span className="font-medium text-tinta-900">{r.titulo}</span>{" "}
                    <span className="italic">{r.revista}</span>
                    {r.ano ? `. ${r.ano}` : ""}.{" "}
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap text-ciano-600 hover:underline"
                    >
                      PMID {r.pmid}
                    </a>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* Não deveria acontecer: `salvar_resumo` recusa um resumo com citação
            órfã. Se aparecer, é porque uma referência foi removida depois — e
            é melhor o aluno ver o aviso do que ler um número que não leva a
            fonte nenhuma. */}
        {citacoesOrfas.length > 0 ? (
          <p className="mt-6 rounded-lg bg-alerta-100 px-4 py-3 text-sm text-alerta-600">
            Atenção: as citações {citacoesOrfas.join(", ")} não têm fonte registrada neste
            resumo. Não confie nelas sem conferir.
          </p>
        ) : null}
      </article>
    </div>
  );
}
