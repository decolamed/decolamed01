// ============================================================================
// QUE REFORÇO O ERRO PEDE — a decisão, isolada e testável
//
// O Copiloto tinha três caminhos que terminavam na mesma resposta:
//
//   1. `TIPOS_CICLO.cirurgico = ["questoes","questoes","questoes"]` — no modo
//      cirúrgico o ciclo de missões só continha questões, então flashcard e
//      aula não eram rejeitados: nunca chegavam a ser pedidos;
//   2. `modo === "cirurgico" ? "questoes"` na escolha do tipo da recomendação;
//   3. `tipoComConteudo()` conferia o tipo preferido e, se ele não tivesse
//      material, caía em `if (inv.questoes > 0) return "questoes"` ANTES de
//      tentar os outros formatos.
//
// O resultado no banco eram 11 missões, todas "Questões · <matéria> · 40 min",
// com 160 flashcards e 108 aulas de Biologia paradas no acervo.
//
// Aqui a decisão deixa de depender do MODO e passa a depender do ERRO, que é
// a informação que realmente diz qual reforço serve:
//
//   precisão muito baixa   → a base está faltando  → AULA primeiro
//   precisão intermediária → falha de memória      → FLASHCARDS primeiro
//   erro em volume, base ok→ falha de aplicação    → QUESTÕES primeiro
//
// E, sobre isso, a regra que impede a repetição: um tipo que já está pendente
// para aquela matéria vai para o fim da fila. É o que transforma "mais uma de
// questões de Biologia" em "agora uma aula de Biologia".
//
// Nada aqui inventa conteúdo: `escolherReforco` só devolve um tipo que tem
// material de verdade no inventário, e devolve null quando não há nenhum.
// ============================================================================

export type TipoReforco = "questoes" | "flashcards" | "aula";

/** Quanto material ATIVO existe para a matéria. */
export interface InventarioDisponivel {
  questoes: number;
  flashcards: number;
  aulas: number;
}

export interface SinalDeErro {
  /** Erros registrados na matéria (ou no assunto, quando há um). */
  erros: number;
  /** Precisão atual em %, 0–100. */
  precisao: number;
  /** Quantas respostas sustentam essa precisão. */
  respostas: number;
  /** Tipos de reforço que JÁ estão pendentes para esta matéria. */
  jaPendentes?: TipoReforco[];
}

/**
 * Quantos reforços pendentes uma matéria pode acumular.
 *
 * Três é o número de formatos que existem: questões, flashcards e aula. Com o
 * teto aqui, uma matéria de GEN altíssimo recebe um reforço de cada tipo e
 * para — em vez das oito sessões idênticas de Biologia que o aluno viu, uma
 * por dia, em dias consecutivos.
 */
export const MAX_REFORCOS_PENDENTES_POR_MATERIA = 3;

/**
 * Precisão abaixo da qual o problema é de BASE, não de treino.
 * Mandar mais questões para quem acerta menos de 40% é pedir que ele repita
 * o erro com outro enunciado.
 */
const PRECISAO_BASE_FALTANDO = 40;

/** Acima disto o aluno mostra domínio do conteúdo; o que falta é aplicação. */
const PRECISAO_CONSOLIDADA = 65;

/** Amostra mínima para a precisão significar alguma coisa. */
const RESPOSTAS_MINIMAS = 3;

/**
 * A ordem de preferência dos formatos para este erro — do mais adequado ao
 * menos. Sempre devolve os três: quem consome filtra pelo que existe.
 */
export function ordemDeReforco(sinal: SinalDeErro): TipoReforco[] {
  const amostraConfiavel = sinal.respostas >= RESPOSTAS_MINIMAS;

  let ordem: TipoReforco[];
  if (amostraConfiavel && sinal.precisao < PRECISAO_BASE_FALTANDO) {
    // Erra quase tudo: reconstruir a base antes de treinar.
    ordem = ["aula", "flashcards", "questoes"];
  } else if (sinal.erros >= 3 && sinal.precisao >= PRECISAO_CONSOLIDADA) {
    // Sabe o conteúdo e erra na hora de aplicar: treino é o remédio.
    ordem = ["questoes", "flashcards", "aula"];
  } else if (amostraConfiavel && sinal.precisao < PRECISAO_CONSOLIDADA) {
    // Meio do caminho: lacuna de memorização/consolidação.
    ordem = ["flashcards", "questoes", "aula"];
  } else if (sinal.erros >= 3) {
    // Volume de erro sem amostra que sustente uma precisão: treino.
    ordem = ["questoes", "flashcards", "aula"];
  } else {
    // Um ou dois erros isolados: reforço leve.
    ordem = ["flashcards", "questoes", "aula"];
  }

  // O que já está pendente para a matéria vai para o fim, preservando a
  // ordem relativa. Sem isto, a matéria mais urgente recebe o mesmo formato
  // repetidamente — que é exatamente o defeito que estamos corrigindo.
  const pendentes = new Set(sinal.jaPendentes ?? []);
  if (pendentes.size === 0) return ordem;
  return [...ordem.filter((t) => !pendentes.has(t)), ...ordem.filter((t) => pendentes.has(t))];
}

/** Quanto material existe de um tipo. */
function disponivel(inv: InventarioDisponivel, tipo: TipoReforco): number {
  return tipo === "questoes" ? inv.questoes : tipo === "flashcards" ? inv.flashcards : inv.aulas;
}

/**
 * O melhor reforço que EXISTE para este erro e que AINDA NÃO está pendente,
 * ou null.
 *
 * Os dois motivos de devolver null são diferentes e ambos corretos:
 *
 *   • a matéria não tem material nenhum — nenhuma missão deve ser criada, em
 *     vez de o aluno receber um cartão que não abre nada;
 *   • todos os formatos disponíveis já estão pendentes — não há reforço NOVO
 *     a oferecer. Inglês e Espanhol, por exemplo, não têm aula cadastrada;
 *     sem esta regra o terceiro pedido devolvia "flashcards" pela segunda
 *     vez, recriando em pequena escala o problema que estamos corrigindo.
 *
 * `jaPendentes` conta só o que está PENDENTE. Quando o aluno conclui a
 * rodada de flashcards, o formato volta a ficar disponível — repetir depois
 * de concluído é reforço legítimo; repetir com o anterior intocado é ruído.
 */
export function escolherReforco(sinal: SinalDeErro, inv: InventarioDisponivel): TipoReforco | null {
  const pendentes = new Set(sinal.jaPendentes ?? []);
  return ordemDeReforco(sinal).find((t) => disponivel(inv, t) > 0 && !pendentes.has(t)) ?? null;
}

/**
 * A matéria já tem reforço pendente suficiente?
 *
 * Chamado antes de criar qualquer missão de reforço. É o teto que faltava:
 * o motor distribui as vagas proporcionalmente ao GEN, e uma matéria com GEN
 * 729 contra 100 das outras levava quase todas as vagas da janela.
 */
export function atingiuLimiteDeReforco(pendentesDaMateria: number): boolean {
  return pendentesDaMateria >= MAX_REFORCOS_PENDENTES_POR_MATERIA;
}
