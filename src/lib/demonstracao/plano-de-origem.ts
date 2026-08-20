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
