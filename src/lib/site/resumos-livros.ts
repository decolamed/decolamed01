import type { TrilhaItem } from "@/types/database";
import { textoConfig } from "@/lib/site/configuracoes";

// ============================================================================
// RESUMOS DOS LIVROS — uma fonte só para os quatro links
//
// O cronograma tem quatro itens obrigatórios de leitura ("Leitura do resumo
// do Livro 1" … "Livro 4"). Todos os quatro estavam com `url` nula no banco,
// e `abrirItemTrilha` tinha esta linha explícita:
//
//     // "leitura" e "livre" não abrem nada
//
// Ou seja: o aluno via o item, marcava como concluído, e não havia para onde
// ir. Não era um link errado — era a ausência de link.
//
// Agora os quatro endereços moram em `configuracoes`, sob as chaves
// `livros.resumo_1_url` … `livros.resumo_4_url`, e TODO lugar que mostra um
// resumo de livro resolve o endereço por aqui. Trocar o link no painel muda
// o destino em todos eles ao mesmo tempo, sem republicar nada.
//
// O reconhecimento é pelo NÚMERO no título, não pelo texto exato: o título
// pode ser "Leitura do resumo do Livro 4 (dia livre de aulas)", "Resumo do
// Livro 2" ou "Bagagem Essencial — Livro 3", e os três apontam para o mesmo
// lugar. Preso ao texto exato, qualquer ajuste de redação no admin quebraria
// o vínculo em silêncio.
// ============================================================================

export const TOTAL_DE_LIVROS = 4;

/** Chave em `configuracoes` do resumo de um livro. */
export function chaveDoResumo(numero: number): string {
  return `livros.resumo_${numero}_url`;
}

/** As quatro chaves, na ordem — para ler tudo numa consulta só. */
export const CHAVES_DOS_RESUMOS: string[] = Array.from({ length: TOTAL_DE_LIVROS }, (_, i) =>
  chaveDoResumo(i + 1)
);

/** Os links, indexados pelo número do livro. */
export type LinksDosResumos = Record<number, string>;

/**
 * Número do livro citado no título, ou null.
 *
 * Aceita "Livro 3", "livro 3", "LIVRO 3" e o número por extenso não — só o
 * algarismo, que é como todos os títulos do template estão escritos. Fora do
 * intervalo 1..4 devolve null: "Livro 7" não é um dos resumos obrigatórios.
 */
export function numeroDoLivro(titulo: string | null | undefined): number | null {
  const m = /\blivros?\s*0*(\d{1,2})\b/i.exec(titulo ?? "");
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_DE_LIVROS ? n : null;
}

/**
 * Este item do cronograma é um dos resumos obrigatórios?
 *
 * Exige as duas coisas: ser item de leitura E nomear um dos quatro livros.
 * Só o número não basta — uma aula chamada "Livro didático 2" não é resumo.
 */
export function ehResumoDeLivro(item: { tipo?: string | null; titulo?: string | null }): boolean {
  return (item.tipo ?? "") === "leitura" && numeroDoLivro(item.titulo) !== null;
}

/** O endereço cadastrado para aquele livro, ou null quando não há. */
export function urlDoResumo(numero: number | null, links: LinksDosResumos): string | null {
  if (numero === null) return null;
  const url = (links[numero] ?? "").trim();
  return url || null;
}

/**
 * Devolve os itens com a URL dos resumos preenchida a partir das
 * configurações.
 *
 * A configuração TEM PRECEDÊNCIA sobre a URL guardada no item. É o ponto do
 * pedido: "não deixar nenhuma ocorrência com link fixo, link antigo ou
 * endereço diferente do cadastrado". Um item que carregue um endereço antigo
 * copiado passa a apontar para o atual.
 *
 * Itens que não são resumo de livro voltam intactos — inclusive os de leitura
 * que não citam um dos quatro (uma leitura avulsa que o admin criar).
 */
export function aplicarLinksDosResumos<T extends TrilhaItem>(itens: T[], links: LinksDosResumos): T[] {
  return itens.map((item) => {
    if (!ehResumoDeLivro(item)) return item;
    const url = urlDoResumo(numeroDoLivro(item.titulo), links);
    if (!url || url === item.url) return item;
    return { ...item, url };
  });
}

/**
 * Monta o mapa de links a partir das linhas de `configuracoes`.
 * Aceita a lista crua ({chave, valor}) para quem já leu a tabela.
 */
export function lerLinksDosResumos(linhas: { chave: string; valor: unknown }[] | null | undefined): LinksDosResumos {
  const links: LinksDosResumos = {};
  (linhas ?? []).forEach(({ chave, valor }) => {
    const m = /^livros\.resumo_(\d+)_url$/.exec(chave);
    if (!m) return;
    const n = Number(m[1]);
    if (n < 1 || n > TOTAL_DE_LIVROS) return;
    // `configuracoes.valor` é jsonb e algumas linhas antigas da tabela estão
    // com aspas a mais (ver o cabeçalho de lib/site/configuracoes.ts). Sem
    // desembrulhar, o link viraria `"https://…"` e o botão abriria um
    // endereço inválido — foi exatamente o que aconteceu com a Base de Temas.
    const limpo = textoConfig(valor).trim();
    if (limpo) links[n] = limpo;
  });
  return links;
}
