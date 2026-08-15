import {
  PESO_RETORNO,
  PESO_CARENCIA,
  PESO_DIFICULDADE,
  retornoDaMateria,
  carenciaDaMateria,
  dificuldadeDeclarada,
  type ContextoDoAluno
} from "@/lib/trilha/prioridade";
import { chaveMateria } from "@/lib/site/materia-canonica";

// ============================================================================
// QUESTÕES EXTRAS — a camada de acompanhamento contínuo
//
// O cronograma principal já traz itens de questões vindos do template, mas
// eles DISPUTAM a capacidade do dia com aulas, leituras e redações. Numa
// janela curta a disputa é dura e sobram um ou dois dias com questões na rota
// inteira — o aluno atravessa dez dias e a plataforma quase não mede nada
// dele.
//
// Esta camada é outra coisa, e a diferença importa:
//
//   • ela NÃO compete por capacidade. É aplicada DEPOIS que a rota está
//     pronta, então nenhum item principal sai do lugar para abrir espaço;
//   • ela NÃO conta como carga horária. O dia continua com os mesmos minutos
//     planejados (ver `minutos` em rota-persistencia.ts);
//   • ela NÃO é obrigatória. Um bloco não feito não deixa o dia incompleto,
//     não vira dívida e não é reagendado (ver `itemReagendavel`).
//
// O que ela decide é só: em QUE dias cabe um bloco, e de QUE matéria ele é.
// Quais questões entram no bloco continua sendo trabalho de
// `sessao-questoes.ts`, que já não repete questão que o aluno tenha visto.
//
// Módulo puro: toda a decisão é testável sem banco.
// ============================================================================

/** Tamanho de referência de um bloco. */
export const QUESTOES_POR_BLOCO = 5;

/**
 * Teto de blocos numa rota inteira.
 *
 * É o que impede "5 questões todo dia" de virar 250 questões numa rota de 50
 * dias — um consumo que esvaziaria o banco antes da prova. Com 20 blocos, a
 * rota mais longa gasta 100 questões, e o banco (≈350 utilizáveis por aluno,
 * já descontado o idioma que ele não faz) segue com folga para as atividades
 * principais, os simulados e o reforço do Copiloto.
 */
export const MAXIMO_DE_BLOCOS = 20;

/**
 * Quantos blocos seguidos podem ser da mesma matéria.
 *
 * Regra dura, acima da pontuação: mesmo que uma matéria domine a prioridade,
 * cinco dias seguidos dela não é acompanhamento, é monotonia. Só é relaxada
 * quando não existe outra matéria com questões disponíveis.
 */
export const MAXIMO_EM_SEQUENCIA = 2;

/**
 * Quanto a nota de uma matéria é reduzida conforme ela foi usada há pouco.
 *
 * Índice = há quantos blocos ela apareceu (0 = bloco imediatamente anterior).
 * É um freio, não um bloqueio: uma matéria muito mais prioritária que as
 * outras atravessa o freio e volta rápido, que é exatamente a priorização
 * que o aluno pediu para preservar. O efeito prático, com uma matéria bem à
 * frente, é o padrão A, B, A, C, A — prioridade mantida, com variedade.
 */
const FRICCAO_POR_DISTANCIA = [0.45, 0.7, 0.85];

/**
 * Empurrão para a matéria que ainda não recebeu NENHUM bloco na rota.
 *
 * Sem ele, medido com os pesos reais desta prova e o aluno do relato
 * (dificuldade em Exatas), uma rota de 10 dias entregava blocos de só quatro
 * matérias — Matemática, declarada em Turbulência, ficava de fora do começo
 * ao fim, e História e Geografia também. Isso contraria o propósito da
 * camada: ela existe para ACOMPANHAR o aluno nas diferentes matérias, e não
 * mede o que nunca pergunta.
 *
 * É o mesmo princípio já aplicado na distribuição do cronograma: o perfil do
 * aluno PRIORIZA, nunca EXCLUI. O empurrão só vale enquanto a matéria está
 * zerada; a partir do primeiro bloco ela volta a disputar pela nota pura, e
 * a matéria prioritária continua sendo a que mais aparece.
 */
const IMPULSO_DE_COBERTURA = 1.35;

/** Dias de rota que podem receber um bloco. */
const TIPOS_ELEGIVEIS = new Set(["estudo", "revisao"]);

export interface DiaParaExtras {
  routeDay: number;
  /** "estudo" | "simulado" | "revisao" | "descanso" | "prova" */
  tipo: string;
  scheduledDate: string;
}

export interface MateriaComQuestoes {
  materia: string;
  /** Quantas questões desta matéria o aluno ainda não viu em atividades. */
  ineditas: number;
}

export interface BlocoDeQuestoes {
  routeDay: number;
  materia: string;
  quantidade: number;
  /** true quando o bloco veio de uma sessão que o aluno já abriu. */
  congelado: boolean;
}

export interface EntradaDosExtras {
  dias: DiaParaExtras[];
  contexto: ContextoDoAluno;
  /** Matérias que têm questões sobrando para este aluno. */
  disponiveis: MateriaComQuestoes[];
  /**
   * Blocos que o aluno JÁ ABRIU, por dia da rota: a matéria já está gravada
   * em `aluno_sessao_questoes` e não pode mudar. Sem isto, a rota é regerada
   * a cada leitura de tela e um bloco já respondido trocaria de nome sozinho.
   */
  congelados?: Record<number, string>;
}

/**
 * De quantos em quantos dias elegíveis entra um bloco.
 *
 * Uma conta só, e ela resolve os dois extremos do pedido: a rota curta recebe
 * bloco todo dia, e a longa se espalha sozinha em vez de multiplicar.
 *
 *    10 dias elegíveis → 1 (todo dia)      → 10 blocos
 *    20               → 1 (todo dia)       → 20 blocos
 *    30               → 2 (dia sim, dia não) → 15 blocos
 *    50               → 3                  → 17 blocos
 */
export function cadenciaDosBlocos(diasElegiveis: number): number {
  if (diasElegiveis <= 0) return 1;
  return Math.max(1, Math.ceil(diasElegiveis / MAXIMO_DE_BLOCOS));
}

/** Nota da matéria para este aluno, na mesma régua que o cronograma usa. */
export function prioridadeDaMateria(materia: string, ctx: ContextoDoAluno): number {
  const soma = PESO_RETORNO + PESO_CARENCIA + PESO_DIFICULDADE;
  return (
    (PESO_RETORNO * retornoDaMateria(materia, ctx) +
      PESO_CARENCIA * carenciaDaMateria(materia, ctx) +
      PESO_DIFICULDADE * dificuldadeDeclarada(materia, ctx)) /
    soma
  );
}

/** Há quantos blocos esta matéria apareceu. -1 = não apareceu no histórico. */
function distanciaDoUltimoUso(materia: string, recentes: string[]): number {
  const alvo = chaveMateria(materia);
  for (let i = 0; i < recentes.length; i++) {
    if (chaveMateria(recentes[i]) === alvo) return i;
  }
  return -1;
}

function friccao(materia: string, recentes: string[]): number {
  const d = distanciaDoUltimoUso(materia, recentes);
  if (d < 0) return 1;
  return FRICCAO_POR_DISTANCIA[d] ?? 1;
}

/** A matéria já esgotou o limite de blocos seguidos? */
function estourouASequencia(materia: string, recentes: string[]): boolean {
  const alvo = chaveMateria(materia);
  let seguidos = 0;
  for (const m of recentes) {
    if (chaveMateria(m) !== alvo) break;
    seguidos++;
  }
  return seguidos >= MAXIMO_EM_SEQUENCIA;
}

/**
 * Planeja os blocos de questões extras da rota.
 *
 * Determinístico: mesmos dias, mesmo contexto e mesmo banco produzem sempre o
 * mesmo plano. Nada de `Math.random()` — a rota é regerada a cada leitura de
 * tela e um sorteio faria o bloco de amanhã mudar de matéria a cada refresh.
 *
 * Os blocos já abertos pelo aluno entram primeiro, congelados, e ainda contam
 * como histórico para a regra de variedade: o que ele acabou de responder
 * também deve pesar contra repetir a mesma matéria em seguida.
 */
export function planejarQuestoesExtras(e: EntradaDosExtras): BlocoDeQuestoes[] {
  const congelados = e.congelados ?? {};

  const elegiveis = e.dias.filter((d) => TIPOS_ELEGIVEIS.has(d.tipo));
  const cadencia = cadenciaDosBlocos(elegiveis.length);

  // Quantas questões restam por matéria. Vai baixando conforme os blocos são
  // atribuídos, para o plano nunca prometer mais do que o banco tem — é o que
  // impede um bloco de nascer sem questões para mostrar.
  const restantes = new Map<string, number>();
  const nomeCanonico = new Map<string, string>();
  e.disponiveis.forEach((d) => {
    const chave = chaveMateria(d.materia);
    restantes.set(chave, Math.max(0, d.ineditas));
    nomeCanonico.set(chave, d.materia);
  });

  const blocos: BlocoDeQuestoes[] = [];
  const recentes: string[] = []; // do mais recente para o mais antigo
  const jaUsadas = new Set<string>(); // matérias que já receberam algum bloco
  let desdeOUltimo = Infinity;

  for (const dia of elegiveis) {
    const congelado = congelados[dia.routeDay];

    // 1. Bloco que o aluno já abriu: a matéria está gravada, não se discute.
    //    Ele não consome disponibilidade (as questões já saíram do banco na
    //    hora em que a sessão foi criada), mas conta como histórico.
    if (congelado) {
      blocos.push({ routeDay: dia.routeDay, materia: congelado, quantidade: QUESTOES_POR_BLOCO, congelado: true });
      recentes.unshift(congelado);
      jaUsadas.add(chaveMateria(congelado));
      desdeOUltimo = 0;
      continue;
    }

    if (blocos.length >= MAXIMO_DE_BLOCOS) break;
    if (desdeOUltimo < cadencia) {
      desdeOUltimo++;
      continue;
    }

    // 2. Candidatas: matérias que ainda têm questões para um bloco inteiro.
    const comQuestoes = [...restantes.entries()].filter(([, n]) => n >= QUESTOES_POR_BLOCO);
    if (comQuestoes.length === 0) break;

    // 3. A regra de sequência só vale se sobrar alternativa. Com uma matéria
    //    só no banco, repetir é melhor que deixar o aluno sem bloco.
    const semSequenciaEstourada = comQuestoes.filter(([chave]) => !estourouASequencia(chave, recentes));
    const candidatas = semSequenciaEstourada.length > 0 ? semSequenciaEstourada : comQuestoes;

    // 4. Prioridade do aluno × freio de repetição. O desempate é pelo nome
    //    canônico, para o plano não depender da ordem em que as matérias
    //    chegaram do banco.
    let escolhida = "";
    let melhor = -1;
    for (const [chave] of candidatas) {
      const nome = nomeCanonico.get(chave) ?? chave;
      const cobertura = jaUsadas.has(chave) ? 1 : IMPULSO_DE_COBERTURA;
      const nota = prioridadeDaMateria(nome, e.contexto) * friccao(chave, recentes) * cobertura;
      if (nota > melhor || (nota === melhor && chave < escolhida)) {
        melhor = nota;
        escolhida = chave;
      }
    }

    const nome = nomeCanonico.get(escolhida) ?? escolhida;
    blocos.push({ routeDay: dia.routeDay, materia: nome, quantidade: QUESTOES_POR_BLOCO, congelado: false });
    restantes.set(escolhida, (restantes.get(escolhida) ?? 0) - QUESTOES_POR_BLOCO);
    recentes.unshift(escolhida);
    jaUsadas.add(escolhida);
    desdeOUltimo = 1;
  }

  return blocos;
}
