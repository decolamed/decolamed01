// ============================================================================
// DE QUAL PLANO A PESSOA VEIO
//
// A página do plano manda `/demonstracao?voltar=/inscricao/<slug>` para que o
// botão do fim da demonstração devolva a pessoa à compra que ela estava
// vendo. O valor vem da URL, então é entrada não confiável: precisa ser
// validado antes de virar destino de um link.
//
// Por que não reusar `destinoDoLink` (que já valida destinos internos): o
// fallback dele é `/redefinir-senha`, que faz sentido para links de e-mail de
// autenticação e nenhum sentido aqui. Um `voltar` malformado ofereceria a um
// visitante um botão "Quero começar" que abre uma tela de redefinir senha.
// Aqui o fallback correto é "não sei de onde você veio" — ou seja, null, e a
// demonstração mostra o caminho de contato.
//
// A regra é estreita de propósito: só aceita exatamente uma página de
// inscrição. Não é um validador de URL genérico, é o reconhecimento de um
// endereço específico.
// ============================================================================

/** O formato de um slug de plano, igual ao aceito em /inscricao/[slug]. */
const CAMINHO_DE_INSCRICAO = /^\/inscricao\/[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;

/**
 * O caminho da página de inscrição de onde a pessoa veio, ou null.
 *
 * Devolver null é uma resposta legítima e esperada: é o caso de quem abriu o
 * link da demonstração direto do WhatsApp, sem passar por plano nenhum.
 */
export function planoDeOrigem(voltar: string | null | undefined): string | null {
  const valor = String(voltar ?? "").trim();
  if (!CAMINHO_DE_INSCRICAO.test(valor)) return null;
  return valor;
}

// ============================================================================
// O LINK CURTO
//
// `/demonstracao?voltar=%2Finscricao%2Fvooguiado` funciona, mas é o tipo de
// endereço que ninguém cola num WhatsApp com orgulho: 58 caracteres, um ponto
// de interrogação, um sinal de igual e dois `%2F` no meio.
//
// `/demo/vooguiado` diz a mesma coisa. O plano de origem vira um pedaço do
// caminho em vez de um parâmetro codificado — mesma informação, sem símbolo
// nenhum. E `/demo` sozinho continua valendo para o link solto, que usa o
// endereço de compra configurado no painel.
//
// Não virou um `/demo` fixo apontando para um plano no next.config: a
// demonstração é aberta a partir da página de CADA plano, e cada uma precisa
// devolver a pessoa ao plano dela. Um destino fixo em arquivo de configuração
// também quebraria calado no dia em que o slug mudasse — aqui o slug vem do
// próprio link que a página do plano montou.
// ============================================================================

/** Um slug de plano, no mesmo formato aceito por /inscricao/[slug]. */
const SLUG = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;

/**
 * O caminho de inscrição correspondente a um slug vindo de `/demo/<slug>`.
 *
 * Devolve null para qualquer coisa que não seja um slug — inclusive as
 * tentativas de escapar do caminho (`..`, barras, esquemas). O `/demo` sem
 * slug nenhum também cai aqui e devolve null, que é o caso legítimo do link
 * repassado sem plano de origem.
 */
export function planoDoCaminho(segmentos: string[] | undefined): string | null {
  if (!segmentos || segmentos.length !== 1) return null;
  const slug = String(segmentos[0] ?? "").trim();
  if (!SLUG.test(slug)) return null;
  return `/inscricao/${slug}`;
}

/**
 * O link curto da demonstração para a página de um plano.
 *
 * É o que a página de inscrição usa no botão "Ver demonstração".
 */
export function linkDaDemonstracao(slug: string): string {
  return SLUG.test(slug.trim()) ? `/demo/${slug.trim()}` : "/demo";
}

/**
 * Para onde mandar quem chegou pelo endereço antigo.
 *
 * `/demonstracao?voltar=/inscricao/x` vira `/demo/x`. Links já enviados
 * continuam funcionando, e quem clicar neles passa a ver o endereço bonito na
 * barra do navegador.
 */
export function enderecoCurto(voltar: string | null | undefined): string {
  const origem = planoDeOrigem(voltar);
  return origem ? `/demo/${origem.slice("/inscricao/".length)}` : "/demo";
}
