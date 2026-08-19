// Para onde o aluno vai depois que o link do e-mail é aceito.
//
// O destino chega pela URL (`?next=...`), então é entrada não confiável: sem
// restrição viraria redirecionamento aberto — bastaria mandar um link de
// recuperação apontando para `?next=https://outro-site` para levar alguém
// autenticado embora da plataforma. Só caminhos internos passam.
//
// Vive num módulo próprio porque a regra é aplicada em dois lugares que
// rodam em ambientes diferentes: o route handler de /auth/callback (servidor)
// e a página /auth/finalizar (navegador). Duas cópias divergiriam.

/** Destino padrão quando o pedido não é um caminho interno válido. */
export const DESTINO_PADRAO = "/redefinir-senha";

export function destinoDoLink(pedido: string | null | undefined): string {
  const valor = String(pedido ?? "");

  // Precisa começar com uma única barra: "//outro-site.com" é URL absoluta
  // protocolo-relativa, e o navegador a trata como domínio externo.
  if (!/^\/[a-z0-9]/i.test(valor)) return DESTINO_PADRAO;

  // Só letras, números, hífen e barra. Corta "\", ":", "@" e o resto do que
  // aparece em endereço externo, além de query e fragmento — o destino é uma
  // rota da plataforma, não um endereço arbitrário.
  if (!/^[a-z0-9\-/]+$/i.test(valor)) return DESTINO_PADRAO;

  return valor;
}
