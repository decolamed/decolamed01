import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { Conversa } from "@/components/conversa";
import { PainelObjetivos } from "@/components/painel-objetivos";
import { BotaoEnviar, CAMPO, FormularioSimples } from "@/components/formulario-simples";
import { salvarEnunciado } from "../../acoes";
import { codigoDaSp, type Mensagem, type Objetivo, type SituacaoProblema, type Tutoria } from "@/types/banco";

export const dynamic = "force-dynamic";

// A conversa inteira não é carregada: uma SP estudada por semanas acumula
// centenas de mensagens, e renderizar todas travaria a página para ler as
// últimas cinco. O que ficou para trás está nos resumos — que é justamente o
// que os resumos são: a conversa destilada e permanente.
const MENSAGENS_NA_TELA = 60;

export default async function PaginaSp({ params }: { params: { id: string } }) {
  const supabase = criarClienteServidor();

  const { data: sp } = await supabase
    .from("situacoes_problema")
    .select("*, tutoria:tutorias(*)")
    .eq("id", params.id)
    .maybeSingle<SituacaoProblema & { tutoria: Tutoria }>();

  if (!sp) notFound();

  const [objetivos, mensagens, resumos] = await Promise.all([
    supabase.from("objetivos").select("*").eq("sp_id", params.id).order("ordem").returns<Objetivo[]>(),
    supabase
      .from("mensagens")
      .select("*")
      .eq("sp_id", params.id)
      .order("criado_em", { ascending: false })
      .limit(MENSAGENS_NA_TELA)
      .returns<Mensagem[]>(),
    supabase
      .from("resumos")
      .select("id, titulo, criado_em, referencias")
      .eq("sp_id", params.id)
      .order("criado_em", { ascending: false })
      .returns<Array<{ id: string; titulo: string; criado_em: string; referencias: unknown[] }>>()
  ]);

  const codigo = codigoDaSp(sp.tutoria, sp);
  const historico = [...(mensagens.data ?? [])].reverse();

  return (
    <div>
      <Link
        href={`/tutorias/${sp.tutoria_id}`}
        className="text-sm text-tinta-500 transition hover:text-ciano-600"
      >
        ← Tutoria {sp.tutoria.numero} — {sp.tutoria.titulo}
      </Link>

      <header className="mt-3 flex flex-wrap items-baseline gap-3">
        <span className="rounded-md bg-tinta-950 px-2.5 py-1 font-mono text-sm font-semibold text-ciano-400">
          SP {codigo}
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-tinta-950">{sp.titulo}</h1>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_21rem]">
        <Conversa spId={params.id} iniciais={historico} codigo={codigo} />

        <aside className="space-y-5">
          <section className="rounded-xl border border-tinta-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-tinta-900">Objetivos de aprendizagem</h2>
            <PainelObjetivos objetivos={objetivos.data ?? []} />
          </section>

          <section className="rounded-xl border border-tinta-200 bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold text-tinta-900">Resumos salvos</h2>
            <p className="mb-3 text-xs text-tinta-500">
              É o que sobra do estudo. Peça ao Jarvis: “salva isso como resumo”.
            </p>

            {(resumos.data ?? []).length === 0 ? (
              <p className="text-sm text-tinta-500">Nenhum resumo ainda.</p>
            ) : (
              <ul className="space-y-2">
                {resumos.data!.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/resumos/${r.id}`}
                      className="group block rounded-lg border border-tinta-200 px-3 py-2.5 transition hover:border-ciano-500 hover:bg-tinta-100"
                    >
                      <span className="block text-sm font-medium leading-snug text-tinta-900 group-hover:text-ciano-600">
                        {r.titulo}
                      </span>
                      <span className="mt-0.5 block text-xs text-tinta-500">
                        {new Date(r.criado_em).toLocaleDateString("pt-BR")}
                        {" · "}
                        {r.referencias.length} fonte{r.referencias.length === 1 ? "" : "s"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-tinta-200 bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold text-tinta-900">Enunciado da SP</h2>
            <p className="mb-3 text-xs text-tinta-500">
              O Jarvis lê isto em toda mensagem. Quanto mais fiel ao original, melhor.
            </p>
            <FormularioSimples acao={salvarEnunciado} className="space-y-3">
              <input type="hidden" name="sp_id" value={params.id} />
              <textarea
                name="enunciado"
                rows={7}
                defaultValue={sp.enunciado}
                placeholder="Cole aqui o texto da situação-problema."
                className={`${CAMPO} resize-y`}
              />
              <BotaoEnviar variante="discreto" carregando="Salvando…">
                Salvar enunciado
              </BotaoEnviar>
            </FormularioSimples>
          </section>
        </aside>
      </div>
    </div>
  );
}
