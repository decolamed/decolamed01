// Fallback usado apenas se a configuração "site.contato.whatsapp" ainda não
// tiver sido definida em /admin/configuracoes (ex.: banco recém-criado).
const WHATSAPP_FALLBACK = "558791741532";

/**
 * Monta o link do wa.me a partir do valor salvo em `configuracoes`.
 * Remove qualquer caractere que não seja dígito (espaços, parênteses,
 * traços, "+") para evitar links quebrados quando o número é digitado
 * com formatação no painel admin.
 */
export function montarLinkWhatsapp(valorConfig: string | null | undefined): string {
  const apenasDigitos = (valorConfig ?? "").replace(/\D/g, "");
  return `https://wa.me/${apenasDigitos || WHATSAPP_FALLBACK}`;
}
