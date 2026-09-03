import Link from "next/link";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { criarTutoria } from "../acoes";
import { BotaoEnviar, CAMPO, FormularioSimples, ROTULO } from "@/components/formulario-simples";
import type { Tutoria } from "@/types/banco";

export const dynamic = "force-dynamic";

interface TutoriaComContagem extends Tutoria {
  situacoes_problema: Array<{ count: number }>;
}

export default async function PaginaTutorias() {
  const supabase = criarClienteServidor();

  const { data } = await supabase
    .from("tutorias")
    .select("*, situacoes_problema(count)")
    .eq("arquivada", false)
    .order("modulo")
    .order("numero")
    .returns<TutoriaComContagem[]>();

  const tutorias = data ?? [];

  // Agrupa por módulo preservando a ordem que veio do banco. Um Map serve
  // melhor que um objeto aqui: ele garante a ordem de inserção mesmo quando o
  // nome do módulo é numérico, caso em que um objeto reordenaria sozinho.
  const porModulo = new Map<string, TutoriaComContagem[]>();
  for (const t of tutorias) {
    const chave = t.modulo || "Sem módulo";
    porModulo.set(chave, [...(porModulo.get(chave) ?? []), t]);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tinta-950">Suas tutorias</h1>
        <p className="mt-1.5 text-sm text-tinta-500">
          Cada tutoria é uma pasta. Dentro dela ficam as situações-problema, e dentro de cada
          situação-problema fica a conversa com o Jarvis e os resumos que sobraram do estudo.
        </p>

        {tutorias.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-tinta-200 bg-white/60 px-6 py-12 text-center">
            <p className="text-sm font-medium text-tinta-700">Nenhuma tutoria ainda.</p>
            <p className="mt-1 text-sm text-tinta-500">
              Crie a primeira ao lado — depois é só abrir e conversar.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {[...porModulo.entries()].map(([modulo, lista]) => (
              <section key={modulo}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-tinta-500">
                  {modulo}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {lista.map((t) => {
                    const quantas = t.situacoes_problema?.[0]?.count ?? 0;
                    return (
                      <li key={t.id}>
                        <Link
                          href={`/tutorias/${t.id}`}
                          className="group block h-full rounded-xl border border-tinta-200 bg-white p-4 transition hover:border-ciano-500 hover:shadow-carta"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wider text-ciano-600">
                            Tutoria {t.numero}
                          </p>
                          <p className="mt-1 font-semibold leading-snug text-tinta-900 group-hover:text-ciano-600">
                            {t.titulo}
                          </p>
                          <p className="mt-2 text-xs text-tinta-500">
                            {/* O plural é irregular: "situações-problema", não
                                "situação-problemas". */}
                            {quantas === 0
                              ? "nenhuma situação-problema"
                              : quantas === 1
                                ? "1 situação-problema"
                                : `${quantas} situações-problema`}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-tinta-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-tinta-900">Nova tutoria</h2>
          <FormularioSimples acao={criarTutoria} className="space-y-3.5">
            <div>
              <label className={ROTULO} htmlFor="modulo">
                Módulo <span className="normal-case text-tinta-400">(opcional)</span>
              </label>
              <input id="modulo" name="modulo" className={CAMPO} placeholder="Saúde da Mulher" />
            </div>
            <div>
              <label className={ROTULO} htmlFor="numero">
                Número <span className="normal-case text-tinta-400">(em branco = o próximo)</span>
              </label>
              <input id="numero" name="numero" type="number" min={1} className={CAMPO} placeholder="1" />
            </div>
            <div>
              <label className={ROTULO} htmlFor="titulo">
                Tema
              </label>
              <input id="titulo" name="titulo" className={CAMPO} placeholder="Dor torácica" required />
            </div>
            <BotaoEnviar carregando="Criando…">Criar tutoria</BotaoEnviar>
          </FormularioSimples>
        </div>
      </aside>
    </div>
  );
}
