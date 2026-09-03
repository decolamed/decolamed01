import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { criarSituacaoProblema } from "../../acoes";
import { BotaoEnviar, CAMPO, FormularioSimples, ROTULO } from "@/components/formulario-simples";
import type { SituacaoProblema, Tutoria } from "@/types/banco";

export const dynamic = "force-dynamic";

interface SpComContagens extends SituacaoProblema {
  objetivos: Array<{ count: number }>;
  resumos: Array<{ count: number }>;
}

export default async function PaginaTutoria({ params }: { params: { id: string } }) {
  const supabase = criarClienteServidor();

  const [tutoria, sps] = await Promise.all([
    supabase.from("tutorias").select("*").eq("id", params.id).maybeSingle<Tutoria>(),
    supabase
      .from("situacoes_problema")
      .select("*, objetivos(count), resumos(count)")
      .eq("tutoria_id", params.id)
      .order("ordem")
      .returns<SpComContagens[]>()
  ]);

  // A RLS já filtra por dono, então "não encontrado" cobre tanto o id que não
  // existe quanto o que existe e é de outra pessoa — e é assim que deve ser:
  // um 403 aqui confirmaria a existência da pasta alheia.
  if (!tutoria.data) notFound();

  const lista = sps.data ?? [];

  return (
    <div>
      <Link href="/tutorias" className="text-sm text-tinta-500 transition hover:text-ciano-600">
        ← Tutorias
      </Link>

      <header className="mt-3">
        {tutoria.data.modulo ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-tinta-500">
            {tutoria.data.modulo}
          </p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-tinta-950">
          Tutoria {tutoria.data.numero} — {tutoria.data.titulo}
        </h1>
      </header>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-tinta-900">Situações-problema</h2>

          {lista.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-tinta-200 bg-white/60 px-6 py-12 text-center">
              <p className="text-sm font-medium text-tinta-700">Nenhuma SP nesta tutoria ainda.</p>
              <p className="mt-1 text-sm text-tinta-500">
                Crie a SP {tutoria.data.numero}.1 ao lado e cole o enunciado — é dele que o Jarvis
                tira os objetivos.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {lista.map((sp) => {
                const objetivos = sp.objetivos?.[0]?.count ?? 0;
                const resumos = sp.resumos?.[0]?.count ?? 0;
                return (
                  <li key={sp.id}>
                    <Link
                      href={`/sp/${sp.id}`}
                      className="group flex items-start gap-4 rounded-xl border border-tinta-200 bg-white p-4 transition hover:border-ciano-500 hover:shadow-carta"
                    >
                      <span className="mt-0.5 shrink-0 rounded-md bg-tinta-950 px-2.5 py-1 font-mono text-xs font-semibold text-ciano-400">
                        SP {tutoria.data!.numero}.{sp.ordem}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold leading-snug text-tinta-900 group-hover:text-ciano-600">
                          {sp.titulo}
                        </span>
                        <span className="mt-1 block text-xs text-tinta-500">
                          {objetivos === 0 ? "sem objetivos" : `${objetivos} objetivo${objetivos > 1 ? "s" : ""}`}
                          {" · "}
                          {resumos === 0 ? "nenhum resumo" : `${resumos} resumo${resumos > 1 ? "s" : ""}`}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-tinta-200 bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold text-tinta-900">Nova situação-problema</h2>
            <p className="mb-4 text-xs text-tinta-500">
              Será a SP {tutoria.data.numero}.{lista.length + 1}.
            </p>
            <FormularioSimples acao={criarSituacaoProblema} className="space-y-3.5" limparAoSucesso>
              <input type="hidden" name="tutoria_id" value={params.id} />
              <div>
                <label className={ROTULO} htmlFor="titulo">
                  Tema da SP
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  className={CAMPO}
                  placeholder="Homem de 58 anos com dor precordial"
                  required
                />
              </div>
              <div>
                <label className={ROTULO} htmlFor="enunciado">
                  Enunciado <span className="normal-case text-tinta-400">(cole aqui)</span>
                </label>
                <textarea
                  id="enunciado"
                  name="enunciado"
                  rows={6}
                  className={`${CAMPO} resize-y font-normal`}
                  placeholder="Cole o texto da situação-problema como você recebeu. É o contexto mais importante que o Jarvis recebe."
                />
              </div>
              <BotaoEnviar carregando="Criando…">Criar situação-problema</BotaoEnviar>
            </FormularioSimples>
          </div>
        </aside>
      </div>
    </div>
  );
}
