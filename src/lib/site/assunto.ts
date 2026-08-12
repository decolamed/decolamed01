import { mesmaMateria } from "@/lib/site/materia-canonica";

// ============================================================================
// AFINIDADE DE ASSUNTO — o elo que faltava entre questão, revisão e flashcard
//
// A revisão de flashcards abria o hub geral porque a cadeia
// "questão errada → assunto → flashcards daquele assunto" nunca chegava ao
// fim. Medido neste banco:
//
//   questões  → "Reações Químicas · Oxirredução e Funções Inorgânicas"
//               "Físico-Química · Termoquímica e Combustão"
//               (texto livre, praticamente um assunto por questão)
//
//   flashcards→ "Termoquímica", "Funções Orgânicas", "Eletroquímica"
//               (temas curtos, às vezes com "· Continuação"/"· Aprofundamento")
//
// São dois vocabulários diferentes para a mesma matéria. Comparar por
// igualdade de string — que é o que o sistema fazia — dava zero acerto em 5
// dos 7 assuntos recomendados ao aluno. Não há tabela de assuntos nem id
// canônico: `assunto` é uma coluna de texto nos dois lados.
//
// A identidade canônica de um assunto passa a ser, então, o seu CONJUNTO DE
// TERMOS normalizado. "Termoquímica e Combustão" e "Termoquímica" partilham
// o termo que importa; "Continuação" e "Aprofundamento" não dizem nada sobre
// o tema e saem da conta. É uma regra só, válida para qualquer matéria e
// qualquer assunto — nada de `if (assunto === "Oxirredução")`.
// ============================================================================

/**
 * Palavras que não identificam assunto nenhum: conectivos, marcadores de
 * continuidade e os nomes das próprias matérias (um flashcard de Química
 * chamado "Química · Ligações" não deve casar com toda questão de Química
 * só por causa do "Química").
 */
const VAZIAS_EXATAS = new Set([
  "de", "da", "do", "das", "dos", "e", "ou", "a", "o", "as", "os", "em", "no", "na",
  "para", "por", "com", "sem", "ao", "aos", "um", "uma"
]);

/**
 * Radicais descartados. Comparados por prefixo porque a mesma palavra
 * aparece flexionada: "químico", "química", "químicas". Sem isso, "Reações
 * Químicas · Oxirredução" casava com "Equilíbrio Químico" só pelo "químic" —
 * duas coisas sem relação nenhuma unidas pelo nome da matéria.
 */
const RADICAIS_VAZIOS = [
  "continuac", "aprofundament", "revis", "parte", "geral", "basic", "avancad",
  "introduc", "conceit", "exercici", "questo", "topic",
  "biolog", "quimic", "fisic", "matematic", "histori", "geograf",
  "linguagen", "portugue", "ingles", "espanhol", "literatur"
];

function ehTermoVazio(t: string): boolean {
  return VAZIAS_EXATAS.has(t) || RADICAIS_VAZIOS.some((r) => t.startsWith(r));
}

/** minúsculas, sem acento, sem pontuação — a forma comparável de um termo. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Termos significativos de um assunto.
 *
 * "Reações Químicas · Oxirredução e Funções Inorgânicas"
 *   → ["reacoes", "oxirreducao", "funcoes", "inorganicas"]
 *
 * Termos com menos de 4 letras saem: "pH" e "uso" não discriminam nada e
 * fariam assuntos distintos casarem por acidente.
 */
export function termosDoAssunto(assunto: string | null | undefined): string[] {
  if (!assunto) return [];
  const vistos = new Set<string>();
  return normalizar(assunto)
    .split(" ")
    .filter((t) => t.length >= 4 && !ehTermoVazio(t))
    .filter((t) => {
      if (vistos.has(t)) return false;
      vistos.add(t);
      return true;
    });
}

/**
 * O quanto dois assuntos falam da mesma coisa, de 0 a 1.
 *
 * A nota é a MAIOR das duas coberturas: quanto do assunto procurado aparece
 * no candidato, e quanto do candidato aparece no procurado. Os dois lados
 * importam porque os vocabulários têm tamanhos diferentes — o flashcard
 * "Termoquímica" (um termo) cobre inteiramente a questão "Físico-Química ·
 * Termoquímica e Combustão" (três termos), e é exatamente o material certo,
 * embora cubra só um terço dos termos dela.
 *
 * Termos que só diferem no final contam como iguais ("reacoes"/"reacao",
 * "organica"/"organicas") — plural e gênero não deveriam separar assunto.
 */
export function afinidadeDeAssunto(procurado: string | null | undefined, candidato: string | null | undefined): number {
  const a = termosDoAssunto(procurado);
  const b = termosDoAssunto(candidato);
  if (a.length === 0 || b.length === 0) return 0;

  const casa = (x: string, y: string) => {
    if (x === y) return true;
    const menor = x.length <= y.length ? x : y;
    const maior = x.length <= y.length ? y : x;
    // Mesmo radical: "reacao" ⊂ "reacoes" não é prefixo, então compara o
    // início até a penúltima letra do menor.
    return menor.length >= 5 && maior.startsWith(menor.slice(0, menor.length - 1));
  };

  const doAlvoNoCandidato = a.filter((t) => b.some((o) => casa(t, o))).length / a.length;
  const doCandidatoNoAlvo = b.filter((t) => a.some((o) => casa(t, o))).length / b.length;
  return Math.max(doAlvoNoCandidato, doCandidatoNoAlvo);
}

/**
 * Abaixo disto, os assuntos não têm relação suficiente para virar revisão.
 *
 * Um terço: basta UM termo significativo em comum num assunto de três termos.
 * Como os termos genéricos (nomes de matéria, "continuação", conectivos) já
 * foram descartados, um termo compartilhado é sinal real — "Sintaxe · Período
 * Composto" e "Sintaxe · Orações Subordinadas" tratam da mesma coisa. Mais
 * exigente do que isso descartava casamentos legítimos; menos, aceitaria
 * qualquer coincidência.
 */
export const AFINIDADE_MINIMA = 1 / 3;

export interface ComAssunto {
  materia?: string | null;
  assunto?: string | null;
}

/**
 * Seleciona, dentro de uma matéria, os itens cujo assunto tem afinidade com o
 * assunto procurado — ordenados do mais próximo ao mais distante.
 *
 * A matéria é filtro DURO e canônico (`mesmaMateria`): uma revisão de Química
 * nunca devolve flashcard de Biologia, e Inglês nunca devolve Espanhol.
 * O assunto é o critério de ordenação e corte.
 *
 * Devolve lista VAZIA quando nada alcança o mínimo. Quem chama decide o que
 * fazer — e a decisão nunca pode ser "então mostra tudo".
 */
export function porAfinidadeDeAssunto<T extends ComAssunto>(
  itens: T[],
  alvo: { materia?: string | null; assunto?: string | null },
  minimo: number = AFINIDADE_MINIMA
): T[] {
  const daMateria = alvo.materia ? itens.filter((i) => mesmaMateria(i.materia, alvo.materia)) : itens;
  if (!alvo.assunto) return [];

  return daMateria
    .map((item) => ({ item, score: afinidadeDeAssunto(alvo.assunto, item.assunto) }))
    .filter((x) => x.score >= minimo)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}
