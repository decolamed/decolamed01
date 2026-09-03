import Link from "next/link";
import { avisoDoPubmed, bancoConfigurado, faltaParaAIa } from "@/lib/config";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { buscar } from "@/lib/pubmed/client";
import { motoresDisponiveis } from "@/lib/ia";
import { NOME_DO_MOTOR } from "@/lib/ia/tipos";
import { TesteDeMotor } from "@/components/teste-de-motor";

export const dynamic = "force-dynamic";

type Estado = "ok" | "erro" | "aviso";

interface Checagem {
  nome: string;
  estado: Estado;
  detalhe: string;
  comoResolver?: string;
}

// ---------------------------------------------------------------------------
// Banco
// ---------------------------------------------------------------------------
const BANCO = "Banco de dados (Supabase)";

/**
 * Traduz uma falha do banco para algo acionável.
 *
 * Ela precisa existir separada porque a mesma falha chega por dois caminhos: o
 * supabase-js DEVOLVE erro de rede dentro de `{ error }` em vez de lançá-lo,
 * então tratar só no `catch` deixaria o caso mais comum — endereço errado ou
 * projeto pausado — escapando como "TypeError: fetch failed", que não diz nada
 * a quem está montando o projeto pela primeira vez.
 */
function explicarFalhaDoBanco(bruto: string, codigo?: string): Checagem {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(vazia)";

  if (/fetch failed|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|getaddrinfo/i.test(bruto)) {
    return {
      nome: BANCO,
      estado: "erro",
      detalhe: `Não consegui alcançar ${url} — o endereço não respondeu.`,
      comoResolver:
        "Confira se a Project URL está copiada inteira (começa com https:// e termina em .supabase.co). " +
        "Se estiver certa, veja no painel do Supabase se o projeto não está pausado — no plano gratuito " +
        "ele pausa após uma semana sem uso, e basta clicar em Restore para voltar."
    };
  }

  // 42P01 = "relation does not exist". É de longe o erro mais comum de quem
  // está montando: as chaves foram coladas, mas o schema.sql nunca rodou.
  if (codigo === "42P01") {
    return {
      nome: BANCO,
      estado: "erro",
      detalhe: "Conectou no Supabase, mas as tabelas não existem.",
      comoResolver:
        "Abra o SQL Editor do Supabase, cole o conteúdo de supabase/schema.sql e clique em Run."
    };
  }

  if (/API key|JWT|Invalid|401/i.test(bruto)) {
    return {
      nome: BANCO,
      estado: "erro",
      detalhe: `O Supabase respondeu, mas recusou a chave: ${bruto}`,
      comoResolver:
        "Copie de novo a chave pública (anon / publishable) em Project Settings → API. " +
        "Cuidado para não pegar a service_role por engano — ela é outra, e não é a desta variável."
    };
  }

  return {
    nome: BANCO,
    estado: "erro",
    detalhe: `${bruto}${codigo ? ` (código ${codigo})` : ""}`,
    comoResolver: "Confira a URL e a chave pública em Project Settings → API."
  };
}

async function checarBanco(): Promise<Checagem> {
  if (!bancoConfigurado()) {
    return {
      nome: BANCO,
      estado: "erro",
      detalhe: "As chaves do Supabase não estão no .env.local.",
      comoResolver: "Siga os passos em /comece-aqui."
    };
  }

  try {
    // Consulta de propósito trivial. Sem sessão, a RLS devolve zero linhas —
    // e zero linhas é sucesso: prova que a URL, a chave e a tabela existem.
    // O que interessa aqui é o ERRO, não o dado.
    const { error } = await criarClienteServidor().from("perfis").select("id").limit(1);

    if (!error) {
      return { nome: BANCO, estado: "ok", detalhe: "Conectado, e as tabelas existem." };
    }
    return explicarFalhaDoBanco(error.message, error.code);
  } catch (e) {
    return explicarFalhaDoBanco(e instanceof Error ? e.message : String(e));
  }
}

// ---------------------------------------------------------------------------
// PubMed
// ---------------------------------------------------------------------------
async function checarPubmed(): Promise<Checagem> {
  try {
    const r = await buscar("aspirin myocardial infarction", { quantidade: 1 });
    const artigo = r.artigos[0];

    if (!artigo) {
      return {
        nome: "PubMed",
        estado: "erro",
        detalhe: "O PubMed respondeu, mas não devolveu nenhum artigo para uma busca que sempre tem resultado.",
        comoResolver: "Provavelmente instabilidade momentânea do NCBI. Tente de novo em alguns minutos."
      };
    }

    return {
      nome: "PubMed",
      estado: "ok",
      detalhe: `Buscou e leu um artigo real: "${artigo.titulo.slice(0, 80)}${artigo.titulo.length > 80 ? "…" : ""}" (PMID ${artigo.pmid}).`
    };
  } catch (e) {
    return {
      nome: "PubMed",
      estado: "erro",
      detalhe: e instanceof Error ? e.message : "Falha desconhecida.",
      comoResolver:
        "O PubMed não pede chave nenhuma, então quase sempre é rede: firewall, proxy ou internet fora."
    };
  }
}

// ---------------------------------------------------------------------------
const CORES: Record<Estado, string> = {
  ok: "border-ciano-500 bg-ciano-100",
  erro: "border-alerta-600 bg-alerta-100",
  aviso: "border-ambar-400 bg-ambar-100"
};

const ROTULOS: Record<Estado, string> = { ok: "OK", erro: "PROBLEMA", aviso: "ATENÇÃO" };

function Cartao({ c }: { c: Checagem }) {
  return (
    <li className={`rounded-xl border-l-4 border-y border-r border-tinta-200 p-4 ${CORES[c.estado]}`}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[0.65rem] font-bold uppercase tracking-wider text-tinta-700">
          {ROTULOS[c.estado]}
        </span>
        <span className="text-sm font-semibold text-tinta-900">{c.nome}</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-tinta-700">{c.detalhe}</p>
      {c.comoResolver ? (
        <p className="mt-2 text-xs leading-relaxed text-tinta-600">
          <span className="font-semibold">Como resolver: </span>
          {c.comoResolver}
        </p>
      ) : null}
    </li>
  );
}

export default async function PaginaDiagnostico() {
  // Em paralelo, e cada uma com o próprio try/catch: uma checagem que falha
  // não pode derrubar a página inteira, porque a página inteira é justamente
  // o que vai explicar a falha.
  const [banco, pubmed] = await Promise.all([checarBanco(), checarPubmed()]);

  const disponiveis = motoresDisponiveis();
  const aviso = avisoDoPubmed();

  const checagens: Checagem[] = [banco, pubmed];

  if (disponiveis.length === 0) {
    checagens.push({
      nome: "Motor de IA",
      estado: "erro",
      detalhe: faltaParaAIa()[0]?.nome ?? "Nenhuma chave de IA configurada.",
      comoResolver: faltaParaAIa()[0]?.ondeConseguir ?? "Preencha GEMINI_API_KEY ou ANTHROPIC_API_KEY."
    });
  }

  if (aviso) {
    checagens.push({ nome: "PubMed — política de uso", estado: "aviso", detalhe: aviso });
  }

  return (
    <main className="min-h-screen bg-tinta-100 px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-tinta-950">Diagnóstico</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-tinta-500">
            Três coisas precisam funcionar: o banco, o PubMed e a IA. Esta tela testa cada uma
            separadamente, para você saber qual das três está com problema em vez de só ver que
            &ldquo;não funciona&rdquo;.
          </p>
        </header>

        <ul className="space-y-3">
          {checagens.map((c) => (
            <Cartao key={c.nome} c={c} />
          ))}
        </ul>

        {disponiveis.length > 0 ? (
          <section className="mt-8 rounded-xl border border-tinta-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-tinta-900">Motor de IA</h2>
            <p className="mt-1 text-xs leading-relaxed text-tinta-500">
              Este teste é um botão, e não automático, porque cada clique faz uma chamada de
              verdade e gasta alguns centavos de token. É o único jeito de distinguir uma chave
              certa de uma chave com erro de digitação, de uma conta sem crédito, ou de um
              projeto do Google com a API desligada.
            </p>
            <div className="mt-4 space-y-3">
              {disponiveis.map((m) => (
                <TesteDeMotor key={m} motor={m} nome={NOME_DO_MOTOR[m]} />
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-8 text-center text-sm">
          <Link href="/tutorias" className="text-ciano-600 hover:underline">
            Ir para as tutorias
          </Link>
          <span className="mx-2 text-tinta-300">·</span>
          <Link href="/comece-aqui" className="text-ciano-600 hover:underline">
            Guia de instalação
          </Link>
        </p>
      </div>
    </main>
  );
}
