// Um artigo do PubMed, já reduzido ao que o Jarvis realmente usa. O E-utilities
// devolve muito mais campo do que isso; tudo que não entra aqui é ruído que só
// gastaria contexto do modelo.
export interface Artigo {
  pmid: string;
  titulo: string;
  /** Autores no formato "Sobrenome AB", na ordem original da publicação. */
  autores: string[];
  revista: string;
  ano: string;
  doi: string | null;
  /**
   * O resumo, com os rótulos estruturados preservados quando existem
   * ("MÉTODOS: ...", "CONCLUSÕES: ..."). Vazio quando o artigo não tem resumo
   * público — o que acontece bastante com editorial e carta ao editor.
   */
  resumo: string;
  /** "Review", "Randomized Controlled Trial", "Meta-Analysis"... */
  tipos: string[];
  url: string;
}

/** Como o aluno (ou o Jarvis) restringe a busca. */
export interface FiltrosBusca {
  /** Só artigos publicados nos últimos N anos. */
  ultimosAnos?: number;
  /** Só revisão, revisão sistemática, meta-análise e diretriz. */
  apenasRevisoes?: boolean;
  /** Quantos artigos trazer. O limite duro é 20 — ver client.ts. */
  quantidade?: number;
}

export interface ResultadoBusca {
  /** A expressão realmente enviada ao PubMed, com os filtros já embutidos. */
  consulta: string;
  /** Quantos artigos o PubMed diz existir no total (pode ser muito > artigos.length). */
  total: number;
  artigos: Artigo[];
}
