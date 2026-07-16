// Fallback usado apenas se a configuração "site.contato.whatsapp" ainda não
// tiver sido definida em /admin/configuracoes (ex.: banco recém-criado).
const WHATSAPP_FALLBACK = "558791741532";

/**
 * Monta o link do wa.me a partir do valor salvo em `configuracoes`.
 * Remove qualquer caractere que não seja dígito (espaços, parênteses,
 * traços, "+") para evitar links quebrados quando o número é digitado
 * com formatação no painel admin.
 *
 * `mensagem` é opcional — quando informada, pré-preenche o texto da
 * conversa no WhatsApp (útil para dar contexto, ex.: "quero renovar meu
 * plano"). Sem esse parâmetro o comportamento é o mesmo de sempre.
 */
export function montarLinkWhatsapp(valorConfig: string | null | undefined, mensagem?: string): string {
  const apenasDigitos = (valorConfig ?? "").replace(/\D/g, "");
  const base = `https://wa.me/${apenasDigitos || WHATSAPP_FALLBACK}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
