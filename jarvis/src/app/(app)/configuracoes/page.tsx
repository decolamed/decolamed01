import { criarClienteServidor } from "@/lib/supabase/servidor";
import { motoresDisponiveis } from "@/lib/ia";
import { MOTORES, NOME_DO_MOTOR, type Motor } from "@/lib/ia/tipos";
import { BotaoEnviar, CAMPO, FormularioSimples, ROTULO } from "@/components/formulario-simples";
import { EscolhaDoMotor } from "@/components/escolha-do-motor";
import { esquecerMemoria, salvarNome } from "../acoes";
import type { Memoria, Perfil } from "@/types/banco";

export const dynamic = "force-dynamic";

const DESCRICAO: Record<Motor, string> = {
  claude:
    "Escreve melhor texto longo e estruturado, e é mais fiel às fontes que leu. É o mais indicado para os resumos.",
  gemini:
    "Mais rápido e mais barato por conversa. Bom para tirar dúvida solta; tende a produzir resumo mais raso."
};

export default async function PaginaConfiguracoes() {
  const supabase = criarClienteServidor();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [perfil, memorias] = await Promise.all([
    supabase.from("perfis").select("*").eq("id", user!.id).maybeSingle<Perfil>(),
    supabase
      .from("memorias")
      .select("*")
      .order("criado_em", { ascending: false })
      .returns<Memoria[]>()
  ]);

  const disponiveis = motoresDisponiveis();
  const escolhido = perfil.data?.motor_ia ?? "claude";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-tinta-950">Configurações</h1>

      <section className="rounded-xl border border-tinta-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-tinta-900">Seu nome</h2>
        <p className="mb-4 mt-1 text-xs text-tinta-500">É como o Jarvis vai te chamar.</p>
        <FormularioSimples acao={salvarNome} className="flex items-end gap-3">
          <div className="flex-1">
            <label className={ROTULO} htmlFor="nome">
              Nome
            </label>
            <input id="nome" name="nome" className={CAMPO} defaultValue={perfil.data?.nome ?? ""} required />
          </div>
          <BotaoEnviar variante="discreto" carregando="Salvando…">
            Salvar
          </BotaoEnviar>
        </FormularioSimples>
      </section>

      <section className="rounded-xl border border-tinta-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-tinta-900">Motor de IA</h2>
        <p className="mb-4 mt-1 text-xs text-tinta-500">
          Quem pensa e escreve as respostas. Muda a qualidade e o custo — a busca no PubMed é a
          mesma nos dois.
        </p>

        {disponiveis.length === 0 ? (
          <p className="rounded-lg bg-alerta-100 px-4 py-3 text-sm text-alerta-600">
            Nenhum motor está configurado neste servidor. Defina <code>ANTHROPIC_API_KEY</code> ou{" "}
            <code>GEMINI_API_KEY</code> nas variáveis de ambiente e reinicie.
          </p>
        ) : (
          <EscolhaDoMotor
            escolhido={escolhido}
            opcoes={MOTORES.map((m) => ({
              motor: m,
              nome: NOME_DO_MOTOR[m],
              descricao: DESCRICAO[m],
              disponivel: disponiveis.includes(m)
            }))}
          />
        )}
      </section>

      <section className="rounded-xl border border-tinta-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-tinta-900">O que o Jarvis lembra de você</h2>
        <p className="mb-4 mt-1 text-xs text-tinta-500">
          Ele anota isto sozinho durante as conversas e usa em todas as tutorias. Se algo estiver
          errado ou desatualizado, apague — ele reanota quando o assunto voltar.
        </p>

        {(memorias.data ?? []).length === 0 ? (
          <p className="text-sm text-tinta-500">
            Nada anotado ainda. Ele começa a anotar conforme vocês conversam.
          </p>
        ) : (
          <ul className="divide-y divide-tinta-200">
            {memorias.data!.map((m) => (
              <li key={m.id} className="flex items-start gap-3 py-2.5">
                <span className="flex-1 text-sm leading-snug text-tinta-700">{m.fato}</span>
                {/* Server action ligada direto no form: apagar uma memória não
                    precisa de JavaScript no cliente para funcionar. */}
                <form action={esquecerMemoria.bind(null, m.id)}>
                  <button
                    type="submit"
                    className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-tinta-400 transition hover:bg-alerta-100 hover:text-alerta-600"
                  >
                    Esquecer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-tinta-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-tinta-900">Conta</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-tinta-500">E-mail</dt>
            <dd className="text-tinta-900">{perfil.data?.email}</dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-tinta-200 pt-4 text-xs leading-relaxed text-tinta-500">
          Algo não está funcionando? A{" "}
          <a href="/diagnostico" className="font-semibold text-ciano-600 hover:underline">
            tela de diagnóstico
          </a>{" "}
          testa banco, IA e PubMed e diz qual dos três está com problema.
        </p>
      </section>
    </div>
  );
}
