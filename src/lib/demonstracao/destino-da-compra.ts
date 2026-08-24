// ============================================================================
// PARA ONDE VAI O BOTÃO "ADQUIRA JÁ"
//
// São duas origens possíveis, e a ordem entre elas importa:
//
//   1. O PLANO DE ONDE A PESSOA VEIO. Quem clicou em "Ver demonstração" na
//      página do VOO GUIADO tem de voltar para o VOO GUIADO — mandar essa
//      pessoa para um link genérico seria perder a venda que já estava
//      encaminhada. Vem da URL (`?voltar=`), validada em `plano-de-origem`.
//
//   2. O LINK CONFIGURADO NO PAINEL. É o caso do link repassado no WhatsApp:
//      a pessoa abre `/demonstracao` sem nenhuma origem, e antes disso o
//      botão caía em `/contato` — que redireciona para o LOGIN. Agora o
//      administrador escreve ali o link de compra que quiser (a própria
//      página de um plano, um checkout externo, o que for).
//
// Sem nenhum dos dois, o WhatsApp é o fim de linha: é melhor
// falar com a equipe do que um botão que não leva a lugar nenhum.
//
// O link do painel é texto livre digitado por uma pessoa, e vai parar num
// `href`. Por isso passa por validação aqui e não direto para a tela: um
// `javascript:` colado nesse campo viraria código executando no navegador de
// todo visitante da demonstração.
// ============================================================================

/**
 * Quando não há plano de origem nem link configurado, o fim de linha é o
 * WHATSAPP da plataforma — não uma página do site.
 *
 * O valor anterior era `/contato`, e isso mandava o visitante para a tela de
 * LOGIN: aquela página foi descontinuada e hoje só faz `redirect("/login")`.
 * O efeito era o pior possível numa demonstração — a pessoa que clicou em
 * "falar com a equipe" queria justamente falar com alguém para COMPRAR, e
 * caía num formulário de acesso de uma conta que ela ainda não tem.
 *
 * O WhatsApp resolve isso porque é onde a conversa de venda acontece de
 * verdade, e porque não exige conta nenhuma para começar.
 */

/**
 * O link do painel, pronto para usar — ou null se não dá para confiar nele.
 *
 * Aceita endereço completo (`https://...`) e também caminho interno da própria
 * plataforma (`/inscricao/voo-guiado`), que é o que o administrador vai colar
 * na maioria das vezes. Recusa o resto.
 */
export function linkDeCompraValido(bruto: string | null | undefined): string | null {
  const texto = (bruto ?? "").trim();
  if (!texto) return null;

  // Caminho interno: uma barra só, e nunca `//` — `//outro.site` é endereço
  // externo disfarçado de caminho relativo, e o navegador o trata como tal.
  if (texto.startsWith("/")) {
    return texto.startsWith("//") || texto.startsWith("/\\") ? null : texto;
  }

  // Endereço completo: só http e https. `javascript:`, `data:` e afins ficam
  // de fora — são as formas de transformar um campo de texto do painel em
  // código rodando no navegador de quem visita a demonstração.
  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    // Não é URL completa nem caminho. Pode ser "decolamed.online/planos",
    // que é o que uma pessoa escreve naturalmente — completamos o protocolo.
    return /^[\w-]+(\.[\w-]+)+(\/|$)/.test(texto) ? `https://${texto}` : null;
  }

  return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
}

/**
 * O destino final do botão, com a precedência resolvida.
 *
 * `planoDeOrigem` já vem validado de `lib/demonstracao/plano-de-origem`.
 */
export function destinoDaCompra(
  planoDeOrigem: string | null,
  linkConfigurado: string | null | undefined,
  linkDeUltimoRecurso: string
): string {
  return planoDeOrigem ?? linkDeCompraValido(linkConfigurado) ?? linkDeUltimoRecurso;
}

/**
 * O botão leva mesmo a uma compra?
 *
 * Muda o texto na tela: prometer "Adquira já a plataforma" e abrir um
 * formulário de contato seria enganar quem clicou.
 */
export function levaAComprar(planoDeOrigem: string | null, linkConfigurado: string | null | undefined): boolean {
  return Boolean(planoDeOrigem ?? linkDeCompraValido(linkConfigurado));
}
