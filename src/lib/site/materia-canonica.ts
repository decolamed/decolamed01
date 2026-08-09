// Nome canônico de matéria — fonte única de verdade.
//
// A plataforma cresceu com dois nomes para a mesma coisa: parte dela grava
// "Português" (banco de questões, flashcards, pesos) e parte procura por
// "Linguagens" (missões do Copiloto, cronograma). Como a busca é por
// igualdade exata de string, o lado que procurava "Linguagens" simplesmente
// não encontrava nada — e o aluno via missão sem conteúdo, filtro sem
// resultado e estatística zerada, sem erro nenhum aparecendo.
//
// A partir daqui o nome oficial é "Linguagens". Este módulo existe para que
// nenhuma tela precise saber disso: tudo compara por `mesmaMateria()`, que
// normaliza os dois lados antes de comparar. Assim, mesmo que sobre um
// registro antigo em algum canto (ou que alguém digite "português" na mão no
// admin), a busca continua encontrando.

export const MATERIA_LINGUAGENS = "Linguagens";
export const MATERIA_INGLES = "Inglês";
export const MATERIA_ESPANHOL = "Espanhol";

/**
 * Nome antigo da matéria conjunta de língua estrangeira.
 *
 * Nunca deve virar a matéria de um conteúdo: `materia` é o critério de
 * seleção em revisões, atividades e cronograma, então um conteúdo marcado
 * assim entrega Espanhol para quem estuda Inglês. Cada idioma tem a sua
 * própria matéria; a escolha de qual deles vale para cada aluno vive no
 * briefing, não no rótulo do conteúdo.
 */
export const MATERIA_IDIOMA_CONJUNTA = "Inglês/Espanhol";

/** É a matéria conjunta que não deve mais existir? */
export function ehMateriaIdiomaConjunta(materia: string | null | undefined): boolean {
  const c = chaveMateria(materia);
  return c === "ingles/espanhol" || c === "ingles / espanhol" || c === "espanhol/ingles";
}

/** É uma das duas línguas estrangeiras? */
export function ehMateriaIdioma(materia: string | null | undefined): boolean {
  const c = chaveMateria(materiaCanonica(materia));
  return c === "ingles" || c === "espanhol";
}

// Variações que significam Linguagens. Comparadas já normalizadas
// (minúsculas, sem acento), então "PORTUGUÊS" e "portugues" entram aqui.
//
// Literatura entra junto: não existe como matéria própria em materias_peso,
// então um conteúdo de Literatura não casava com peso nenhum e ficava fora
// da autoavaliação do aluno em Linguagens.
const SINONIMOS: Record<string, string> = {
  portugues: MATERIA_LINGUAGENS,
  "lingua portuguesa": MATERIA_LINGUAGENS,
  "linguas portuguesa": MATERIA_LINGUAGENS,
  linguagens: MATERIA_LINGUAGENS,
  "linguagens e codigos": MATERIA_LINGUAGENS,
  "portugues/literatura": MATERIA_LINGUAGENS,
  "portugues e literatura": MATERIA_LINGUAGENS,
  literatura: MATERIA_LINGUAGENS,
  // Idiomas: normaliza a grafia, mas NÃO junta os dois — são matérias
  // distintas de propósito (ver MATERIA_IDIOMA_CONJUNTA).
  ingles: MATERIA_INGLES,
  "lingua inglesa": MATERIA_INGLES,
  english: MATERIA_INGLES,
  espanhol: MATERIA_ESPANHOL,
  "lingua espanhola": MATERIA_ESPANHOL,
  espanol: MATERIA_ESPANHOL
};

/** minúsculas, sem acento e sem espaço sobrando — só para comparar. */
export function chaveMateria(materia: string | null | undefined): string {
  return (materia ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Nome oficial da matéria. Sinônimos conhecidos viram o canônico; qualquer
 * outro nome é devolvido como veio (só com espaços aparados) — matéria nova
 * cadastrada pelo admin não pode ser descartada nem renomeada.
 */
export function materiaCanonica(materia: string | null | undefined): string {
  const bruto = (materia ?? "").trim();
  if (!bruto) return "";
  return SINONIMOS[chaveMateria(bruto)] ?? bruto;
}

/** Duas matérias são a mesma? Use SEMPRE isto no lugar de `a === b`. */
export function mesmaMateria(a: string | null | undefined, b: string | null | undefined): boolean {
  const ca = chaveMateria(materiaCanonica(a));
  const cb = chaveMateria(materiaCanonica(b));
  return ca !== "" && ca === cb;
}

/** Remove duplicatas que só diferiam no nome, preservando a ordem. */
export function materiasUnicas(lista: (string | null | undefined)[]): string[] {
  const vistos = new Set<string>();
  const saida: string[] = [];
  lista.forEach((m) => {
    const nome = materiaCanonica(m);
    if (!nome) return;
    const chave = chaveMateria(nome);
    if (vistos.has(chave)) return;
    vistos.add(chave);
    saida.push(nome);
  });
  return saida;
}
