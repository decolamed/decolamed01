import type { TrilhaItem, TrilhaItemTipo } from "@/types/database";

// ============================================================================
// CATÁLOGO DE CONTEÚDO — tudo que o admin pode anexar a um dia do cronograma
//
// Antes, o editor do dia obrigava a escolher o TIPO primeiro e só então
// abria um <select> com todo o conteúdo daquele tipo. Com centenas de aulas
// isso vira uma lista rolável impossível, e pior: só encontra quem já sabe
// de antemão em que tipo o conteúdo foi cadastrado. Quem procura "Citologia"
// não quer escolher entre aula, flashcards, questões e simulado antes de
// poder buscar — quer buscar "Citologia" e ver as seis coisas.
//
// Este módulo transforma as fontes (conteudos_biblioteca, links_externos,
// simulados, atividades, matérias, páginas internas) numa lista única e
// pesquisável. É de propósito puro — sem Supabase, sem React — para que a
// busca possa ser testada de verdade.
// ============================================================================

export interface ItemCatalogo {
  /** Único no catálogo inteiro: `${tipo}:${id}` evita colisão entre fontes. */
  chave: string;
  tipo: TrilhaItemTipo;
  titulo: string;
  /** Disciplina, quando o conteúdo tem uma. */
  materia: string | null;
  /** Assunto/descrição — entra na busca por palavra-chave. */
  detalhe: string | null;
  ref_id: string | null;
  url: string | null;
  /** Texto auxiliar mostrado à direita ("12 questões", "45 min"). */
  nota: string | null;
}

export const ROTULO_TIPO: Record<TrilhaItemTipo, string> = {
  aula: "Aula",
  pdf: "Material PDF",
  link: "Link externo",
  questoes: "Questões",
  flashcards: "Flashcards",
  simulado: "Simulado",
  atividade: "Atividade",
  pagina: "Página",
  revisao: "Revisão",
  leitura: "Leitura",
  redacao: "Redação",
  livre: "Livre"
};

export const ICONE_TIPO: Record<TrilhaItemTipo, string> = {
  aula: "🎬",
  pdf: "📄",
  link: "🔗",
  questoes: "🎯",
  flashcards: "🃏",
  simulado: "⏱️",
  atividade: "📝",
  pagina: "🧭",
  revisao: "🔁",
  leitura: "📖",
  redacao: "✍️",
  livre: "☕"
};

// Páginas internas do app do aluno. Ficam aqui como catálogo fixo porque não
// vêm de tabela nenhuma — mas o admin precisa poder mandar o aluno para elas
// a partir do cronograma ("hoje é dia de ver seu Raio-X").
export const PAGINAS_INTERNAS: { rota: string; titulo: string; detalhe: string }[] = [
  { rota: "/aluno/questoes", titulo: "Banco de Questões", detalhe: "praticar questões livremente" },
  { rota: "/aluno/flashcards", titulo: "Flashcards", detalhe: "revisão espaçada" },
  { rota: "/aluno/simulados", titulo: "Simulados", detalhe: "lista de simulados" },
  { rota: "/aluno/atividades", titulo: "Atividades", detalhe: "lista de atividades" },
  { rota: "/aluno/redacao", titulo: "Redação", detalhe: "envio de redação" },
  { rota: "/aluno/desempenho", titulo: "Desempenho", detalhe: "estatísticas de estudo" },
  { rota: "/aluno/raio-x", titulo: "Raio-X", detalhe: "diagnóstico por matéria" },
  { rota: "/aluno/ranking", titulo: "Ranking", detalhe: "classificação geral" },
  { rota: "/aluno/conquistas", titulo: "Conquistas", detalhe: "medalhas e metas" },
  { rota: "/aluno/copiloto", titulo: "Copiloto", detalhe: "recomendações adaptativas" },
  { rota: "/aluno/cronograma", titulo: "Cronograma", detalhe: "cronograma completo" }
];

// Remove acento e caixa: quem digita "portugues" precisa achar "Português",
// e quem digita "CITOLOGIA" precisa achar "Citologia".
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Busca no catálogo por nome, palavra-chave ou disciplina.
 *
 * Todos os termos precisam aparecer em algum campo do item (busca "E", não
 * "OU"): "citologia bio" deve achar a aula de Citologia de Biologia, e não
 * tudo que é de Biologia. Sem termo nenhum devolve o catálogo inteiro, para
 * o admin poder simplesmente navegar.
 */
export function buscarNoCatalogo(
  catalogo: ItemCatalogo[],
  consulta: string,
  tipo: TrilhaItemTipo | "todos" = "todos"
): ItemCatalogo[] {
  const porTipo = tipo === "todos" ? catalogo : catalogo.filter((i) => i.tipo === tipo);
  const termos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return porTipo;

  return porTipo
    .map((item) => {
      const campos = [item.titulo, item.materia ?? "", item.detalhe ?? "", ROTULO_TIPO[item.tipo]].map(normalizar);
      const alvo = campos.join(" ");
      if (!termos.every((t) => alvo.includes(t))) return null;

      // Ordenação por qualidade do casamento: título que começa com o termo
      // vem antes de título que só o contém, que vem antes de casar apenas
      // pela matéria. Sem isso, buscar "Citologia" podia devolver primeiro
      // uma aula de outro assunto só porque a matéria bate.
      const tituloNorm = campos[0];
      let pontos = 0;
      termos.forEach((t) => {
        if (tituloNorm.startsWith(t)) pontos += 3;
        else if (tituloNorm.includes(t)) pontos += 2;
        else if (campos[1].includes(t)) pontos += 1;
      });
      return { item, pontos };
    })
    .filter((x): x is { item: ItemCatalogo; pontos: number } => x !== null)
    .sort((a, b) => b.pontos - a.pontos || a.item.titulo.localeCompare(b.item.titulo, "pt-BR"))
    .map((x) => x.item);
}

/**
 * Converte um item do catálogo no item que fica gravado em `trilha_dias.itens`.
 *
 * `tituloExibido` é o que o pedido chama de personalização do título: o admin
 * anexa "Bagagem Essencial — Livro 1" e o aluno lê "Resumo do Livro 1". Só o
 * rótulo muda — a referência ao conteúdo real continua intacta, senão o
 * clique do aluno deixaria de abrir alguma coisa.
 */
export function itemDoCatalogo(item: ItemCatalogo, tituloExibido?: string): TrilhaItem {
  return {
    tipo: item.tipo,
    ref_id: item.ref_id,
    url: item.url,
    materia: item.materia,
    titulo: (tituloExibido ?? "").trim() || item.titulo
  };
}
