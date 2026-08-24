import { TourDaDemonstracao, ChamadaDeCompraCompacta } from "@/components/demonstracao/tour";
import { destinoDaCompra, levaAComprar } from "@/lib/demonstracao/destino-da-compra";
import { createClient } from "@/lib/supabase/server";
import { textoConfig } from "@/lib/site/configuracoes";

// ============================================================================
// A DEMONSTRAÇÃO — A PLATAFORMA, SEM CONTA
//
// Tela pública e estável, feita para ser colada num WhatsApp (/demo/<slug>). Fica FORA do
// grupo (site): aquele layout tem cabeçalho e rodapé de página de vendas, e o
// ponto aqui é o contrário — a pessoa precisa sentir que abriu a plataforma,
// não uma página sobre a plataforma. Por isso o fundo é o mesmo `app-bg` do
// app do aluno.
//
// Não recebe `searchParams` de dado nenhum além de `voltar` e não tem server
// action. Todo o CONTEÚDO da demonstração sai de `lib/demonstracao/dados.ts`
// — nada de aluno, questão, cronograma ou métrica real aparece aqui.
//
// A única leitura do banco é uma linha de `configuracoes`: o link de compra
// que o administrador escreve no painel. É configuração pública do site (a
// mesma tabela do WhatsApp e do Instagram do rodapé; os segredos ficam em
// `configuracoes_secretas`, protegida por is_admin). Leitura, uma chave, sem
// sessão — a demonstração continua sem alcançar dado de aluno e sem escrever
// nada.
// ============================================================================


/**
 * A demonstração inteira, com a origem já resolvida por quem chamou.
 *
 * Existem dois endereços para ela — `/demo/<slug>`, que é o bonito, e
 * `/demonstracao?voltar=…`, que é o antigo e continua valendo. Os dois
 * terminam aqui, então não há duas versões da tela para divergirem.
 */
export async function PaginaDaDemonstracao({ origem }: { origem: string | null }) {

  // O link que o administrador configurou. Vale quando NÃO há plano de
  // origem — o caso do link repassado no WhatsApp, que antes caía em
  // /contato. Ver lib/demonstracao/destino-da-compra.ts para a precedência.
  const supabase = createClient();
  const { data: config } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", "demonstracao.link_compra")
    .maybeSingle();

  const linkConfigurado = textoConfig(config?.valor);
  const destino = destinoDaCompra(origem, linkConfigurado);
  const ehCompra = levaAComprar(origem, linkConfigurado);

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
          {/* A saída para a compra fica visível desde o primeiro segundo e
              acompanha a rolagem, mas em tamanho de etiqueta: quem ainda está
              conhecendo a plataforma não deve ser empurrado, e quem já se
              decidiu no meio do caminho não deveria ter de chegar ao fim para
              conseguir comprar. O CTA de peso fica no encerramento. */}
          <div className="ml-auto">
            <ChamadaDeCompraCompacta destino={destino} ehCompra={ehCompra} />
          </div>
        </div>
      </div>

      <header className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        {/* O título fala com quem chegou pelo WhatsApp sem saber o que é
            isto. "Assim funciona a Decola MED" descrevia a página, não o
            convite — e prometia explicação, quando o que a tela oferece é
            uso.

            O subtítulo dizia "um dia de estudo, do jeito que ele acontece" —
            promessa grande demais para quatro telas. Isto aqui é uma AMOSTRA,
            e chamá-la de dia de estudo faz o visitante esperar mais do que vai
            receber. A contagem de passos voltou porque agora ela é fixa e a
            barra de progresso mostra os mesmos cinco. */}
        <h1 className="font-display text-2xl font-extrabold text-app-txt sm:text-3xl">
          Experimente a Decola MED
        </h1>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-app-sub">
          Uma amostra rápida da plataforma, em cinco passos: você vê o painel, assiste a um trecho de aula,
          responde uma questão e revisa um flashcard. Sem cadastro.
        </p>
      </header>

      <TourDaDemonstracao destino={destino} ehCompra={ehCompra} />
    </main>
  );
}
