// ===========================================================================
// A fronteira entre o Jarvis e o modelo de linguagem.
//
// Tudo acima desta camada (o cérebro, as ferramentas, as telas) fala nestes
// tipos e não sabe qual motor está rodando. Tudo abaixo (claude.ts, gemini.ts)
// traduz destes tipos para a API de cada fornecedor.
//
// A fronteira existe porque os dois motores discordam em quase tudo que
// importa: como se declara uma ferramenta, como o modelo pede para chamá-la,
// com que papel a resposta da ferramenta volta, e o que acontece quando o
// modelo se recusa a responder. Deixar essa diferença vazar para cima seria
// espalhar dois jeitos de fazer a mesma coisa por todo o aplicativo.
// ===========================================================================

export type Motor = "claude" | "gemini";

export const MOTORES: Motor[] = ["claude", "gemini"];

export const NOME_DO_MOTOR: Record<Motor, string> = {
  claude: "Claude (Anthropic)",
  gemini: "Gemini (Google)"
};

/** JSON Schema do que uma ferramenta recebe. Subconjunto que os dois aceitam. */
export interface EsquemaFerramenta {
  type: "object";
  properties: Record<string, PropriedadeEsquema>;
  required?: string[];
}

export interface PropriedadeEsquema {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object";
  description?: string;
  enum?: string[];
  items?: PropriedadeEsquema;
  properties?: Record<string, PropriedadeEsquema>;
  required?: string[];
}

export interface ResultadoFerramenta {
  /** O texto que volta PARA O MODELO. Pode ser longo. */
  paraModelo: string;
  /** Uma linha para o aluno ver na tela. Ex.: "Buscou no PubMed: 8 artigos". */
  paraTela: string;
  erro?: boolean;
}

export interface Ferramenta {
  nome: string;
  descricao: string;
  esquema: EsquemaFerramenta;
  executar(entrada: Record<string, unknown>): Promise<ResultadoFerramenta>;
}

export interface Turno {
  papel: "usuario" | "jarvis";
  texto: string;
}

/** O rastro visível do que o Jarvis fez num turno. Vai para a tela e para o banco. */
export interface Acao {
  ferramenta: string;
  descricao: string;
  erro: boolean;
}

export interface Conversa {
  motor: Motor;
  sistema: string;
  turnos: Turno[];
  ferramentas: Ferramenta[];
  /**
   * Teto de idas e voltas com ferramenta num turno. Existe por dois motivos:
   * dinheiro (cada passo é uma chamada cheia) e para cortar o laço em que o
   * modelo busca, não gosta do resultado, busca de novo, indefinidamente.
   */
  maxPassos?: number;
  maxTokens?: number;
  esforco?: "low" | "medium" | "high" | "xhigh" | "max";
}

export interface Resposta {
  texto: string;
  acoes: Acao[];
  motor: Motor;
}

/**
 * Falha que o aluno pode ver. A mensagem é escrita para ele, não para o log —
 * "o Claude não está configurado" é acionável, "401 Unauthorized" não é.
 */
export class ErroDeMotor extends Error {
  constructor(
    readonly motor: Motor,
    mensagem: string,
    readonly causa?: unknown
  ) {
    super(mensagem);
    this.name = "ErroDeMotor";
  }
}

export function ehMotor(valor: unknown): valor is Motor {
  return valor === "claude" || valor === "gemini";
}
