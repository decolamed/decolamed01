/** Uma fonte que sustenta o texto do resumo. Sempre um artigo real do PubMed. */
export interface Referencia {
  pmid: string;
  titulo: string;
  autores: string[];
  revista: string;
  ano: string;
  doi?: string | null;
}

export interface ResumoRenderizado {
  html: string;
  /**
   * Só as referências REALMENTE citadas no texto, na ordem em que aparecem.
   * Uma referência que o modelo anexou mas nunca citou não entra na lista
   * final: bibliografia que não sustenta nada é decoração, e decoração numa
   * lista de fontes é o começo de confiar em coisa que ninguém verificou.
   */
  citadas: Referencia[];
  /** PMIDs citados no texto para os quais não veio referência nenhuma. */
  citacoesOrfas: string[];
}
