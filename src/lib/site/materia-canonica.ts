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

// Variações que significam Linguagens. Comparadas já normalizadas
// (minúsculas, sem acento), então "PORTUGUÊS" e "portugues" entram aqui.
const SINONIMOS: Record<string, string> = {
  portugues: MATERIA_LINGUAGENS,
  "lingua portuguesa": MATERIA_LINGUAGENS,
  "linguas portuguesa": MATERIA_LINGUAGENS,
  linguagens: MATERIA_LINGUAGENS,
  "linguagens e codigos": MATERIA_LINGUAGENS,
  "portugues/literatura": MATERIA_LINGUAGENS,
  "portugues e literatura": MATERIA_LINGUAGENS
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
