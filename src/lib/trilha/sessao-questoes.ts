// ============================================================================
// SESSÃO DE QUESTÕES — a atividade "5 questões de Biologia"
//
// O item do cronograma vem assim de `trilha_dias.itens`:
//
//   { tipo: "questoes", titulo: "5 questões de Biologia", materia: "Biologia" }
//
// Ele NÃO era uma atividade: era um atalho. Tocar nele levava ao Banco de
// Questões filtrado pela matéria — na tela do app, `qList()` devolvia as 82
// questões de Biologia e o cabeçalho mostrava "1 / 82"; na versão web,
// `/aluno/questoes?materia=Biologia` sorteava 10 a cada carregamento, então
// sair e voltar trocava as questões.
//
// Uma atividade diária é outra coisa: um conjunto FECHADO de 5 questões,
// escolhido uma vez, guardado, e que termina quando a quinta é respondida.
// É o que este módulo define. A lógica é pura para poder ser testada sem
// banco; a persistência vive em `sessao-questoes-servidor.ts`.
// ============================================================================

/** Quantas questões uma atividade tem quando o título não diz outra coisa. */
export const QUESTOES_POR_SESSAO = 5;

/** Teto de segurança: nenhuma sessão vira "o banco inteiro" por engano. */
export const MAXIMO_POR_SESSAO = 20;

/**
 * Quantas questões o item pede.
 *
 * O número está no título escrito pelo admin ("5 questões de Biologia") —
 * é a única fonte que existe hoje, e é a intenção declarada por quem montou
 * o cronograma. Sem número reconhecível, cai no padrão; acima do teto, é
 * limitado, porque uma atividade diária de 50 questões é o problema que
 * estamos justamente corrigindo.
 */
export function quantidadeDoItem(titulo: string | null | undefined): number {
  const m = /(\d+)\s*quest/i.exec(titulo ?? "");
  const pedido = m ? Number(m[1]) : QUESTOES_POR_SESSAO;
  if (!Number.isFinite(pedido) || pedido <= 0) return QUESTOES_POR_SESSAO;
  return Math.min(pedido, MAXIMO_POR_SESSAO);
}

/**
 * Embaralhamento determinístico (Fisher-Yates com gerador semeado).
 *
 * `Math.random()` está fora de questão aqui: com ele, duas leituras da mesma
 * atividade produziriam conjuntos diferentes. A semente é o aluno + a chave
 * da atividade, então cada aluno recebe um sorteio próprio e o mesmo sorteio
 * sempre — o que também torna o resultado reproduzível para depuração.
 */
function embaralharComSemente<T>(itens: T[], semente: string): T[] {
  let estado = 0;
  for (let i = 0; i < semente.length; i++) estado = (estado * 31 + semente.charCodeAt(i)) >>> 0;
  // xorshift32: barato e suficiente para ordenar uma lista de questões.
  const proximo = () => {
    estado ^= estado << 13;
    estado >>>= 0;
    estado ^= estado >> 17;
    estado ^= estado << 5;
    estado >>>= 0;
    return estado / 0x100000000;
  };

  const saida = [...itens];
  for (let i = saida.length - 1; i > 0; i--) {
    const j = Math.floor(proximo() * (i + 1));
    [saida[i], saida[j]] = [saida[j], saida[i]];
  }
  return saida;
}

export interface SelecaoDeQuestoes {
  /** As questões escolhidas, na ordem em que o aluno vai responder. */
  ids: string[];
  /** Quantas o item pedia. */
  pedidas: number;
  /** Quantas questões da matéria o aluno ainda não tinha visto em atividades. */
  ineditasDisponiveis: number;
  /**
   * true quando não havia inéditas suficientes. A tela avisa em vez de
   * completar com questões repetidas por conta própria.
   */
  incompleta: boolean;
}

/**
 * Escolhe as questões da atividade.
 *
 * Regras, nesta ordem:
 *  1. só entram questões da matéria (a lista já chega filtrada);
 *  2. sai tudo que ESTE aluno já usou em atividades anteriores — o histórico
 *     é individual, o que outro aluno respondeu não interfere;
 *  3. o sorteio é semeado, nunca `Math.random()`;
 *  4. faltando inéditas, devolve as que existem e marca `incompleta`. Nunca
 *     completa com repetidas nem escancara o banco.
 */
export function selecionarQuestoes(p: {
  /** IDs das questões ativas da matéria. */
  disponiveis: string[];
  /** IDs que este aluno já recebeu em atividades anteriores. */
  jaUsadas: Iterable<string>;
  quantidade: number;
  semente: string;
}): SelecaoDeQuestoes {
  const usadas = new Set(p.jaUsadas);
  const ineditas = p.disponiveis.filter((id) => !usadas.has(id));
  const quantidade = Math.max(0, Math.min(p.quantidade, MAXIMO_POR_SESSAO));

  const ids = embaralharComSemente(ineditas, p.semente).slice(0, quantidade);

  return {
    ids,
    pedidas: quantidade,
    ineditasDisponiveis: ineditas.length,
    incompleta: ids.length < quantidade
  };
}

// ---- Chaves de sessão ------------------------------------------------------
//
// A chave identifica a atividade. Para um item do cronograma é a MESMA chave
// que o progresso já usa (`trilha:<dia>:<índice>`), então concluir a sessão e
// marcar o item como feito falam da mesma coisa.

export function chaveSessaoTrilha(diaNumero: number, indice: number): string {
  return `trilha:${diaNumero}:${indice}`;
}

export function chaveSessaoMissao(missaoId: string): string {
  return `missao:${missaoId}`;
}

/** Interpreta a chave de volta. Devolve null se não for uma chave conhecida. */
export function lerChaveSessao(
  chave: string
): { tipo: "trilha"; dia: number; indice: number } | { tipo: "missao"; id: string } | null {
  const trilha = /^trilha:(\d+):(\d+)$/.exec(chave);
  if (trilha) return { tipo: "trilha", dia: Number(trilha[1]), indice: Number(trilha[2]) };

  const missao = /^missao:([0-9a-f-]{36})$/i.exec(chave);
  if (missao) return { tipo: "missao", id: missao[1] };

  return null;
}
