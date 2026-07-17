/**
 * Transforma um texto qualquer (o que o admin digitar no campo "Slug") num
 * slug de URL válido: minúsculo, sem espaço, sem acento, só letras/números/
 * hífen. Sem isso, um slug como "DECOLA FACAPE" (com espaço e maiúsculas)
 * virava uma URL quebrada em /inscricao/[slug] — espaço não é um caractere
 * válido em URL.
 *
 * Exemplos:
 *   "DECOLA FACAPE"      -> "decola-facape"
 *   "  Plano Intensivo " -> "plano-intensivo"
 *   "Turma 2027 — SP"    -> "turma-2027-sp"
 */
export function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos (á -> a, ç -> c, etc.)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // qualquer coisa que não for letra/número vira hífen
    .replace(/^-+|-+$/g, ""); // tira hífen sobrando no início/fim
}
