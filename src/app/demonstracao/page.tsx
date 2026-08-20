import type { Metadata } from "next";
import Link from "next/link";
import { TourDaDemonstracao } from "@/components/demonstracao/tour";
import { planoDeOrigem } from "@/lib/demonstracao/plano-de-origem";

// ============================================================================
// /demonstracao — A PLATAFORMA, SEM CONTA
//
// Rota pública e estável, feita para ser colada num WhatsApp. Fica FORA do
// grupo (site): aquele layout tem cabeçalho e rodapé de página de vendas, e o
// ponto aqui é o contrário — a pessoa precisa sentir que abriu a plataforma,
// não uma página sobre a plataforma. Por isso o fundo é o mesmo `app-bg` do
// app do aluno.
//
// Não recebe `searchParams` de dado nenhum além de `voltar`, não toca no
// Supabase e não tem server action. A rota é renderizada por requisição
// (por causa do `voltar`), mas não consulta nada: todo o conteúdo sai de
// `lib/demonstracao/dados.ts`. Um visitante não alcança nada real daqui.
// ============================================================================

export const metadata: Metadata = {
  title: "Demonstração — Decola MED",
  description:
    "Veja por dentro como funciona a Decola MED: painel do aluno, questões com resolução, cronograma e o Copiloto. Sem precisar criar conta.",
  robots: { index: true, follow: true }
};

export default function DemonstracaoPage({ searchParams }: { searchParams: { voltar?: string } }) {
  // O plano de origem, para o botão "Quero começar" levar de volta para a
  // inscrição que a pessoa estava vendo. O valor vem da URL, então é
  // validado: só uma página de inscrição passa, e qualquer outra coisa vira
  // null (ver lib/demonstracao/plano-de-origem.ts).
  const voltarPara = planoDeOrigem(searchParams.voltar);

  return (
    <main className="min-h-screen bg-app-bg font-body">
      {/* A faixa é fixa: role para onde rolar, continua claro que é uma
          demonstração. É a exigência de "identificar sem prejudicar a
          experiência" — ocupa 36px e não cobre nada. */}
      <div className="sticky top-0 z-20 border-b border-app-line bg-app-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-2 sm:px-6">
          <span className="rounded-full bg-orange px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
            Modo demonstração
          </span>
          <span className="hidden text-[11px] font-semibold text-app-sub sm:inline">
            Dados de exemplo — esta não é uma conta real
          </span>
          <Link
            href="/contato"
            className="ml-auto text-[11px] font-bold text-app-sub underline hover:text-app-txt"
          >
            Falar com a equipe
          </Link>
        </div>
      </div>

      <header className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        <h1 className="font-display text-2xl font-extrabold text-app-txt sm:text-3xl">
          Assim funciona a Decola MED
        </h1>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-app-sub">
          Três passos, dois minutos. Você vê o painel de um aluno, responde uma questão de verdade e conhece
          o Copiloto.
        </p>
      </header>

      <TourDaDemonstracao voltarPara={voltarPara} />
    </main>
  );
}
