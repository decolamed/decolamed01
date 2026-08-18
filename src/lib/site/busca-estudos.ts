import { buscarNoCatalogo, type ItemCatalogo } from "@/lib/trilha/catalogo";
import { materiaCanonica } from "@/lib/site/materia-canonica";

// ============================================================================
// BUSCA DA TELA ESTUDOS
//
// O campo "Buscar conteúdo, assuntos..." era decorativo: um `<input>` sem
// `value`, sem `onChange` e sem nada na tela reagindo. O aluno digitava, via
// o texto aparecer e a tela continuava exatamente igual.
//
// Aqui o acervo do aluno vira uma lista pesquisável. A busca em si é a MESMA
// que o admin já usa para anexar conteúdo ao cronograma (`buscarNoCatalogo`):
// todos os termos precisam casar, acento e caixa não contam, e o resultado é
// ordenado pela qualidade do casamento — título que começa com o termo antes
// de título que só o contém, e este antes de casar apenas pela matéria.
// Reaproveitar significa que as duas telas encontram as mesmas coisas com as
// mesmas palavras, em vez de divergirem com o tempo.
//
// O aluno busca por conteúdo, não por tabela. Por isso entram na mesma lista:
// aulas, PDFs e links (da biblioteca E dos dias do cronograma), as matérias
// do banco de questões, os baralhos de flashcards, os simulados e os
// materiais avulsos que o admin publicou na tela.
// ============================================================================

/** Mínimo de caracteres para a busca valer a pena. */
export const MINIMO_PARA_BUSCAR = 2;

export interface AcervoDoAluno {
  conteudos: { id: string; tipo: string; titulo: string; materia: string | null; assunto?: string | null; url: string | null }[];
  /** Aulas/PDFs/links que só existem dentro dos dias do cronograma. */
  conteudosTrilha: { tipo: string; ref_id: string | null; url: string; titulo: string; materia: string | null }[];
  questoes: { materia: string; assunto?: string | null }[];
  flashcards: { materia: string; assunto?: string | null }[];
  simulados: { id: string; titulo: string; descricao?: string | null }[];
  botoes: { id: string; titulo: string }[];
}

/**
 * Tudo que o aluno pode encontrar pela busca, no formato do catálogo.
 *
 * As matérias entram AGRUPADAS (uma linha "Biologia · 82 questões", não 82
 * linhas de questão): o aluno procura por matéria e assunto, e despejar o
 * banco inteiro no resultado seria o mesmo problema que a tela de questões já
 * teve. Os assuntos de cada matéria viajam em `detalhe`, então buscar
 * "citologia" continua achando a matéria certa.
 */
export function acervoPesquisavel(a: AcervoDoAluno): ItemCatalogo[] {
  const itens: ItemCatalogo[] = [];

  // ---- Aulas, PDFs e links da biblioteca -----------------------------------
  a.conteudos.forEach((c) => {
    if (!c.url) return;
    itens.push({
      chave: `conteudo:${c.id}`,
      tipo: (c.tipo === "pdf" ? "pdf" : c.tipo === "link" ? "link" : "aula") as ItemCatalogo["tipo"],
      titulo: c.titulo,
      materia: c.materia,
      detalhe: c.assunto ?? null,
      ref_id: c.id,
      url: c.url,
      nota: null
    });
  });

  // ---- O material que só existe dentro dos dias do cronograma --------------
  // Sem isto a busca não encontraria quase nada: praticamente todo o acervo
  // de videoaulas desta plataforma mora em `trilha_dias.itens`, não em
  // `conteudos_biblioteca` (é o mesmo motivo pelo qual a aba Estudos já
  // recebe `conteudosTrilha`).
  const jaVistos = new Set(itens.map((i) => i.url));
  a.conteudosTrilha.forEach((c, i) => {
    if (!c.url || jaVistos.has(c.url)) return;
    jaVistos.add(c.url);
    itens.push({
      chave: `trilha:${c.ref_id ?? i}:${i}`,
      tipo: (c.tipo === "pdf" ? "pdf" : c.tipo === "link" ? "link" : "aula") as ItemCatalogo["tipo"],
      titulo: c.titulo,
      materia: c.materia,
      detalhe: null,
      ref_id: c.ref_id,
      url: c.url,
      nota: null
    });
  });

  // ---- Banco de questões, por matéria --------------------------------------
  itens.push(...porMateria(a.questoes, "questoes", "questão", "questões"));

  // ---- Flashcards, por ASSUNTO e por matéria -------------------------------
  //
  // Os dois entram. Quem procura "Citologia" quer o baralho de Citologia, não
  // "Biologia" — mas se não existir um baralho específico, a matéria continua
  // sendo uma resposta útil. Como a ordenação da busca dá mais peso a quem
  // casa no TÍTULO do que a quem casa só pela matéria, o assunto aparece na
  // frente sozinho, sem precisar de regra de desempate.
  itens.push(...porAssunto(a.flashcards));
  itens.push(...porMateria(a.flashcards, "flashcards", "flashcard", "flashcards"));

  // ---- Simulados ------------------------------------------------------------
  a.simulados.forEach((s) => {
    itens.push({
      chave: `simulado:${s.id}`,
      tipo: "simulado",
      titulo: s.titulo,
      materia: null,
      detalhe: s.descricao ?? null,
      ref_id: s.id,
      url: null,
      nota: null
    });
  });

  // ---- Materiais avulsos publicados pelo admin na tela ---------------------
  a.botoes.forEach((b) => {
    itens.push({
      chave: `botao:${b.id}`,
      tipo: "link",
      titulo: b.titulo,
      materia: null,
      detalhe: null,
      ref_id: b.id,
      url: null,
      nota: null
    });
  });

  return itens;
}

/**
 * Uma linha por ASSUNTO de flashcard.
 *
 * Sem isto, procurar "Citologia" só achava "Biologia": o assunto existia no
 * banco, mas viajava dentro de `detalhe` da linha da matéria e nunca virava
 * um resultado próprio. O aluno pedia o específico e recebia o geral.
 *
 * A chave carrega matéria E assunto (`flashcards:Biologia:Citologia`) porque
 * é por ela que a tela sabe filtrar o baralho na hora de abrir — ver
 * `assuntoDaChave`.
 */
function porAssunto(registros: { materia: string; assunto?: string | null }[]): ItemCatalogo[] {
  const contagem = new Map<string, { materia: string; assunto: string; total: number }>();
  registros.forEach((r) => {
    const assunto = (r.assunto ?? "").trim();
    if (!assunto) return;
    const materia = materiaCanonica(r.materia);
    if (!materia) return;
    const chave = `${materia}||${assunto}`;
    const atual = contagem.get(chave);
    if (atual) atual.total += 1;
    else contagem.set(chave, { materia, assunto, total: 1 });
  });

  return [...contagem.values()]
    .sort((a, b) => a.assunto.localeCompare(b.assunto, "pt-BR"))
    .map(({ materia, assunto, total }) => ({
      chave: `flashcards:${materia}:${assunto}`,
      tipo: "flashcards" as ItemCatalogo["tipo"],
      // O TÍTULO é o assunto: é o que faz "Citologia" casar no campo de maior
      // peso da ordenação e passar à frente da linha da matéria.
      titulo: assunto,
      materia,
      detalhe: null,
      ref_id: null,
      url: null,
      nota: `${total} ${total === 1 ? "flashcard" : "flashcards"}`
    }));
}

/**
 * O assunto embutido na chave de um resultado de flashcards, ou null quando
 * a linha é da matéria inteira.
 */
export function assuntoDaChave(chave: string): string | null {
  const m = /^flashcards:[^:]+:(.+)$/.exec(chave ?? "");
  return m ? m[1] : null;
}

/** Uma linha por matéria, com os assuntos dela como palavras-chave. */
function porMateria(
  registros: { materia: string; assunto?: string | null }[],
  tipo: "questoes" | "flashcards",
  singular: string,
  plural: string
): ItemCatalogo[] {
  const porNome = new Map<string, { total: number; assuntos: Set<string> }>();
  registros.forEach((r) => {
    const nome = materiaCanonica(r.materia);
    if (!nome) return;
    const atual = porNome.get(nome) ?? { total: 0, assuntos: new Set<string>() };
    atual.total += 1;
    if (r.assunto) atual.assuntos.add(r.assunto);
    porNome.set(nome, atual);
  });

  return [...porNome.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
    .map(([nome, dados]) => ({
      chave: `${tipo}:${nome}`,
      tipo: tipo as ItemCatalogo["tipo"],
      titulo: nome,
      materia: nome,
      // Os assuntos vão para `detalhe` porque é um dos campos que a busca
      // varre: é o que faz "citologia" achar a matéria que tem Citologia.
      detalhe: [...dados.assuntos].sort((x, y) => x.localeCompare(y, "pt-BR")).join(" · ") || null,
      ref_id: null,
      url: null,
      nota: `${dados.total} ${dados.total === 1 ? singular : plural}`
    }));
}

/**
 * Resultado da busca, ou `null` quando ainda não há termo suficiente.
 *
 * `null` e "nenhum resultado" são coisas diferentes na tela: com `null` ela
 * mostra o conteúdo normal; com lista vazia, mostra "nada encontrado". Sem
 * essa distinção, abrir a aba Estudos exibiria "nada encontrado" antes de o
 * aluno digitar qualquer coisa.
 */
export function buscarNosEstudos(acervo: ItemCatalogo[], consulta: string, limite = 40): ItemCatalogo[] | null {
  const termo = (consulta ?? "").trim();
  if (termo.length < MINIMO_PARA_BUSCAR) return null;
  return buscarNoCatalogo(acervo, termo).slice(0, limite);
}
