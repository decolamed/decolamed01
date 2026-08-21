import type { TrilhaItem } from "@/types/database";
import { chaveMateria, chaveCanonica, mesmaMateria } from "@/lib/site/materia-canonica";
import { chaveDeItemTrilha, minutosDoItem } from "@/lib/trilha/progresso";

// ============================================================================
// PRIORIDADE DE CONTEÚDO — o que rende mais nota no tempo que o aluno tem
//
// A rota deixou de perguntar "como faço todo o template caber?" e passou a
// perguntar "com a capacidade real deste aluno, o que rende mais até a
// prova?". Quem responde a segunda pergunta é este módulo: dá uma nota a
// cada item do template, e a rota seleciona de cima para baixo até encher a
// capacidade.
//
// A nota é uma combinação — nunca um critério só. "Peso maior = estudar tudo
// da matéria" seria uma regra burra: uma matéria de peso alto que o aluno já
// domina rende menos do que uma de peso médio em que ele erra tudo.
//
//   RETORNO      peso da matéria na prova × quantas questões ela vale
//   CARÊNCIA     o quanto o aluno erra nela hoje (desempenho real)
//   DIFICULDADE  o que ele declarou no briefing (Turbulência/Atenção/Domínio)
//   INEDITISMO   conteúdo já concluído rende menos do que o que falta ver
//   FUNDAMENTO   o começo do template vem antes: é a base que sustenta o resto
//
// Tudo normalizado em 0..1 e somado com pesos explícitos. Nenhum nome de
// matéria aparece em regra nenhuma — quem manda são os dados de
// `materias_peso`, do briefing e das respostas do aluno.
// ============================================================================

export interface PesoDaMateria {
  /** Peso oficial da matéria na prova. */
  peso: number;
  /** Quantas questões da prova são dessa matéria. */
  qtdQuestoes: number;
}

export interface DesempenhoDaMateria {
  acertos: number;
  erros: number;
}

export interface ContextoDoAluno {
  /** `materias_peso`, indexado por `chaveCanonica`. */
  pesos: Map<string, PesoDaMateria>;
  /** Autoavaliação do briefing: matéria → Domínio | Atenção | Turbulência. */
  sentimentos: Record<string, string>;
  /** Respostas já dadas, por matéria (`chaveCanonica`). */
  desempenho: Map<string, DesempenhoDaMateria>;
  /** Chaves de `aluno_progresso_itens` que o aluno já concluiu. */
  concluidos: Set<string>;
}

export function contextoVazio(): ContextoDoAluno {
  return { pesos: new Map(), sentimentos: {}, desempenho: new Map(), concluidos: new Set() };
}

/**
 * Quanto cada fator vale na nota final.
 *
 * Retorno pesa mais que os outros porque é o que a prova de fato cobra — mas
 * não domina sozinho: carência e dificuldade somadas superam o retorno, que é
 * o que faz uma matéria difícil de peso médio passar à frente de uma matéria
 * fácil de peso alto.
 */
export const PESO_RETORNO = 0.4;
export const PESO_CARENCIA = 0.25;
export const PESO_DIFICULDADE = 0.2;
const PESO_INEDITISMO = 0.1;
const PESO_FUNDAMENTO = 0.05;

const NOTA_POR_SENTIMENTO: Record<string, number> = {
  "Turbulência": 1,
  "Atenção": 0.55,
  "Domínio": 0.15
};

/**
 * Quantas respostas são necessárias para o desempenho falar mais alto que o
 * palpite. Com poucas respostas a taxa de acerto oscila demais — 1 erro em 1
 * questão não significa que a matéria seja o ponto fraco do aluno.
 */
const RESPOSTAS_PARA_CONFIAR = 8;

/** Potencial de nota da matéria, normalizado pelo maior potencial da prova. */
export function retornoDaMateria(materia: string | null | undefined, ctx: ContextoDoAluno): number {
  if (ctx.pesos.size === 0) return 0.5; // sem pesos cadastrados, ninguém tem vantagem
  const potenciais = [...ctx.pesos.values()].map((p) => Math.max(0, p.peso) * Math.max(0, p.qtdQuestoes));
  const maior = Math.max(...potenciais, 1);
  // `chaveCanonica`, não `chaveMateria`: um conteúdo de "Literatura" precisa
  // encontrar o peso de "Linguagens". Com a chave crua ele não casava com peso
  // nenhum e caía no 0.35 de matéria desconhecida — o peso oficial da FACAPE,
  // que é o maior fator da nota, simplesmente não valia para esses itens.
  const daMateria = ctx.pesos.get(chaveCanonica(materia));
  if (!daMateria) return 0.35; // matéria sem peso cadastrado não some, mas não lidera
  return Math.min(1, (Math.max(0, daMateria.peso) * Math.max(0, daMateria.qtdQuestoes)) / maior);
}

/**
 * O quanto o aluno erra a matéria hoje, de 0 (acerta tudo) a 1 (erra tudo).
 *
 * Sem histórico suficiente devolve 0.5 — nem ponto forte nem fraco. É o que
 * evita que a primeira questão respondida jogue a matéria para o topo ou para
 * o fundo da fila.
 */
export function carenciaDaMateria(materia: string | null | undefined, ctx: ContextoDoAluno): number {
  // Mesma razão do retorno: as respostas de Literatura contam no desempenho
  // de Linguagens, senão o aluno aparece sem histórico numa matéria em que já
  // respondeu.
  const d = ctx.desempenho.get(chaveCanonica(materia));
  const total = (d?.acertos ?? 0) + (d?.erros ?? 0);
  if (total === 0) return 0.5;
  const taxaErro = (d?.erros ?? 0) / total;
  const confianca = Math.min(1, total / RESPOSTAS_PARA_CONFIAR);
  return 0.5 * (1 - confianca) + taxaErro * confianca;
}

/** O que o aluno declarou no briefing. Sem declaração, o meio-termo. */
export function dificuldadeDeclarada(materia: string | null | undefined, ctx: ContextoDoAluno): number {
  const alvo = Object.keys(ctx.sentimentos).find((m) => mesmaMateria(m, materia));
  const sentimento = alvo ? ctx.sentimentos[alvo] : null;
  return NOTA_POR_SENTIMENTO[sentimento ?? ""] ?? NOTA_POR_SENTIMENTO["Atenção"];
}

export interface ItemCandidato {
  item: TrilhaItem;
  /** Dia do template de onde veio — referência, nunca número de exibição. */
  templateDay: number;
  /** Posição dentro do dia do template. Mantém a ordem pedagógica interna. */
  ordem: number;
  minutos: number;
}

/**
 * Nota de 0 a 1 de um candidato para ESTE aluno.
 *
 * `posicaoRelativa` é onde o item está no template (0 = primeiro dia,
 * 1 = último) e vale pouco de propósito: serve para desempatar a favor da
 * base quando todo o resto é igual, sem nunca sobrepor retorno ou carência.
 */
export function pontuarItem(candidato: ItemCandidato, ctx: ContextoDoAluno, posicaoRelativa: number): number {
  const materia = (candidato.item as { materia?: string | null }).materia ?? null;

  const chave = chaveDeItemTrilha(candidato.templateDay, candidato.ordem, candidato.item);
  const jaFeito = chave ? ctx.concluidos.has(chave) : false;

  const nota =
    PESO_RETORNO * retornoDaMateria(materia, ctx) +
    PESO_CARENCIA * carenciaDaMateria(materia, ctx) +
    PESO_DIFICULDADE * dificuldadeDeclarada(materia, ctx) +
    PESO_INEDITISMO * (jaFeito ? 0 : 1) +
    PESO_FUNDAMENTO * (1 - Math.min(1, Math.max(0, posicaoRelativa)));

  return nota;
}

/**
 * Todos os itens do template como candidatos, na ordem pedagógica original.
 */
export function candidatosDoTemplate(template: { dia_numero: number; itens?: TrilhaItem[] | null }[]): ItemCandidato[] {
  return [...template]
    .sort((a, b) => a.dia_numero - b.dia_numero)
    .flatMap((dia) =>
      (dia.itens ?? []).map((item, ordem) => ({
        item,
        templateDay: dia.dia_numero,
        ordem,
        minutos: minutosDoItem(item)
      }))
    );
}

/**
 * Ordena os candidatos do mais valioso ao menos valioso para este aluno.
 *
 * Empate resolvido pela ordem do template (dia, depois posição no dia): duas
 * rodadas com os mesmos dados produzem exatamente a mesma fila, sem sorteio.
 */
export function ordenarPorPrioridade(candidatos: ItemCandidato[], ctx: ContextoDoAluno): ItemCandidato[] {
  const ultimo = candidatos.length - 1 || 1;
  const comNota = candidatos.map((c, i) => ({ c, nota: pontuarItem(c, ctx, i / ultimo), i }));
  return comNota
    .sort((a, b) => b.nota - a.nota || a.c.templateDay - b.c.templateDay || a.c.ordem - b.c.ordem || a.i - b.i)
    .map((x) => x.c);
}

/**
 * Depois de quantos minutos numa mesma matéria o próximo item dela passa a
 * valer metade. É o que impede a rota de virar monodisciplinar.
 */
const SATURACAO_MINUTOS = 120;

/** Quanto ainda vale acrescentar tempo numa matéria já contemplada. */
function saturacao(minutosJaSelecionados: number): number {
  return SATURACAO_MINUTOS / (SATURACAO_MINUTOS + Math.max(0, minutosJaSelecionados));
}

// ============================================================================
// COBERTURA MÍNIMA — desempenho prioriza, nunca elimina
//
// A nota de cada item combina retorno, carência e dificuldade declarada. Os
// dois últimos empurram para BAIXO a matéria em que o aluno vai bem, e os
// dois se somam: "Domínio" no briefing vale 0.15 contra 1 de "Turbulência",
// e uma taxa de acerto alta derruba a carência junto. Numa janela curta isso
// deixava de ser prioridade e virava exclusão.
//
// Medido com os pesos reais desta prova (Biologia é a matéria de MAIOR
// potencial: peso 3 × 10 questões) e um aluno com dificuldade em Exatas e bom
// desempenho em Biologia:
//
//   10 dias, 3h/dia → Biologia com 3 itens, em 3 dos 10 dias
//   10 dias, 2h/dia → 2 itens, em 2 dos 10 dias
//   10 dias, 1h/dia → NENHUM item de Biologia
//
// Ou seja: a matéria que mais vale nota na prova saía do cronograma porque o
// aluno declarou que ia bem nela. Isso é o oposto de estratégico.
//
// A correção é uma RESERVA, não um rateio. Antes da disputa livre, uma fatia
// pequena do orçamento é usada para garantir presença mínima às matérias
// estrategicamente relevantes — quanto mais a matéria vale na prova, maior a
// cota. O que sobra (a maior parte) continua sendo decidido exatamente pelo
// mesmo guloso de sempre, onde a dificuldade do aluno manda.
//
// Não é dividir o tempo igualmente: a cota é proporcional à relevância, é um
// PISO e não um teto, e a matéria difícil continua levando a maior parte do
// orçamento livre.
// ============================================================================

/** Itens reservados para a matéria de maior relevância da prova. */
const COBERTURA_ALVO_ITENS = 3;

/**
 * Abaixo desta relevância a matéria não recebe cota reservada — continua
 * disputando normalmente. Sem um corte, uma matéria residual consumiria
 * reserva que faz falta para as que decidem a nota.
 */
const RELEVANCIA_MINIMA_PARA_COTA = 0.15;

/**
 * Teto da reserva sobre o orçamento acadêmico. O piso não pode virar o
 * cronograma inteiro: com 35%, a personalização continua mandando em dois
 * terços do tempo.
 */
const TETO_DA_RESERVA = 0.35;

/**
 * Quantos itens cada matéria tem direito por relevância na prova.
 *
 * Proporcional, com piso de 1: a matéria de maior potencial recebe
 * `COBERTURA_ALVO_ITENS`, as demais recebem a fração correspondente. Nenhum
 * nome de matéria aparece aqui — quem decide é `materias_peso`.
 */
function cotaPorRelevancia(materia: string, ctx: ContextoDoAluno): number {
  const relevancia = retornoDaMateria(materia, ctx);
  if (relevancia < RELEVANCIA_MINIMA_PARA_COTA) return 0;
  return Math.max(1, Math.round(relevancia * COBERTURA_ALVO_ITENS));
}

/**
 * Tipos que o plano do Voo Guiado EXIGE, independentemente de prioridade.
 *
 * As redações e as leituras dos livros não competem com o conteúdo
 * acadêmico: elas são requisito do plano, e o aluno as contratou. Passar por
 * `pontuarItem` seria errado por construção — nenhuma delas tem matéria, logo
 * nenhuma tem peso de prova, e numa janela curta todas perderiam para
 * qualquer aula de Biologia. Foi o que aconteceu: em 10 dias a rota entregava
 * 2 dos 4 livros e 1 das 2 redações; em 5 dias, 1 livro e nenhuma redação.
 *
 * Entram primeiro, sempre. O que sobra de capacidade é que vira disputa.
 */
export const TIPOS_OBRIGATORIOS = new Set(["redacao", "leitura"]);

/**
 * Tipos que a própria rota já cria como dia inteiro — não podem entrar
 * também como item solto de um dia de estudo.
 *
 * O template tem dois itens `simulado`; a rota reserva dois DIAS de simulado.
 * Sem esta exclusão o aluno via quatro: os dois dias e mais dois itens
 * empilhados dentro de dias de conteúdo.
 */
export const TIPOS_DA_PROPRIA_ROTA = new Set(["simulado"]);

function tipoDoItem(item: TrilhaItem): string {
  return (item as { tipo?: string }).tipo ?? "";
}

/** Chave canônica da matéria do candidato ("" quando o item não tem matéria). */
function materiaDoCandidato(c: ItemCandidato): string {
  return chaveMateria((c.item as { materia?: string | null }).materia ?? "");
}

export function ehObrigatorio(c: ItemCandidato): boolean {
  return TIPOS_OBRIGATORIOS.has(tipoDoItem(c.item));
}

export interface Selecao {
  /** Requisitos do plano — entram sempre, antes de qualquer disputa. */
  obrigatorios: ItemCandidato[];
  selecionados: ItemCandidato[];
  descartados: ItemCandidato[];
}

/**
 * Escolhe o que entra na rota dentro do orçamento de minutos.
 *
 * Guloso com RENDIMENTO DECRESCENTE: a cada escolha, o valor dos itens da
 * matéria já contemplada cai. Sem isso, "peso maior" viraria a regra burra
 * que o algoritmo não pode ter — uma matéria de peso alto levaria as 30 horas
 * inteiras e o aluno chegaria à prova sem ter visto as outras seis. A quarta
 * hora de Biologia rende menos que a primeira de Química, e é essa comparação
 * que decide.
 *
 * Determinístico: mesma entrada, mesma seleção, sem sorteio nem dependência
 * de ordem de inserção.
 */
export function selecionarPorPrioridade(
  candidatos: ItemCandidato[],
  ctx: ContextoDoAluno,
  orcamento: number
): Selecao {
  // Fora do pool: o que a rota já entrega como dia inteiro.
  const doPool = candidatos.filter((c) => !TIPOS_DA_PROPRIA_ROTA.has(tipoDoItem(c.item)));

  // Requisitos do plano saem da disputa e entram inteiros. O orçamento do
  // conteúdo acadêmico é o que sobra depois deles — nunca o contrário.
  const obrigatorios = doPool.filter(ehObrigatorio);
  const disputam = doPool.filter((c) => !ehObrigatorio(c));
  const minutosObrigatorios = obrigatorios.reduce((s, c) => s + c.minutos, 0);
  const restante = Math.max(0, orcamento - minutosObrigatorios);

  const ultimo = disputam.length - 1 || 1;
  const pendentes = disputam.map((c, i) => ({ c, base: pontuarItem(c, ctx, i / ultimo), usado: false }));

  const minutosPorMateria = new Map<string, number>();
  const selecionados: ItemCandidato[] = [];
  let gasto = 0;

  // ---- Reserva de cobertura ----------------------------------------------
  // Primeiro passo, antes da disputa: garante presença mínima às matérias que
  // decidem a nota da prova, na proporção do que cada uma vale. É o que
  // impede que "o aluno vai bem nisso" apague a matéria do cronograma.
  //
  // Percorre em ordem de relevância e vai pegando o MELHOR item de cada
  // matéria (a mesma nota da disputa, então a escolha dentro da matéria
  // continua inteligente), rodada a rodada, até a cota de cada uma ou até o
  // teto da reserva. Se o orçamento é minúsculo, a ordem de relevância
  // garante que a matéria mais valiosa é atendida primeiro.
  const tetoReserva = restante * TETO_DA_RESERVA;
  const materiasComCota = [...new Set(pendentes.map((p) => materiaDoCandidato(p.c)))]
    .filter((m) => m !== "")
    .map((m) => ({ materia: m, cota: cotaPorRelevancia(m, ctx), relevancia: retornoDaMateria(m, ctx) }))
    .filter((x) => x.cota > 0)
    .sort((a, b) => b.relevancia - a.relevancia || a.materia.localeCompare(b.materia));

  // Em ORDEM DE RELEVÂNCIA, cada matéria completa a sua cota antes da
  // próxima começar. Servir uma de cada por rodada seria o rateio igual que
  // esta reserva justamente não quer ser: Geografia levaria uma vaga antes de
  // a matéria de maior peso da prova completar a dela.
  let gastoDaReserva = 0;
  for (const { materia, cota } of materiasComCota) {
    for (let n = 0; n < cota; n++) {
      // O melhor item ainda livre desta matéria que caiba no que resta.
      let melhor = -1;
      let melhorNota = -Infinity;
      pendentes.forEach((p, i) => {
        if (p.usado || materiaDoCandidato(p.c) !== materia) return;
        if (gasto + p.c.minutos > restante) return;
        if (p.base > melhorNota) {
          melhor = i;
          melhorNota = p.base;
        }
      });
      if (melhor < 0) break;

      // O teto vale para toda a reserva, menos o primeiro item de todos: um
      // piso que não coloca nem uma aula não é piso nenhum, e é justamente na
      // janela apertada que a matéria mais valiosa sumia por completo.
      const primeiroDaReserva = gastoDaReserva === 0;
      if (!primeiroDaReserva && gastoDaReserva + pendentes[melhor].c.minutos > tetoReserva) break;

      const escolhido = pendentes[melhor];
      escolhido.usado = true;
      selecionados.push(escolhido.c);
      gasto += escolhido.c.minutos;
      gastoDaReserva += escolhido.c.minutos;
      minutosPorMateria.set(materia, (minutosPorMateria.get(materia) ?? 0) + escolhido.c.minutos);
    }
  }

  // ---- Disputa livre ------------------------------------------------------
  // Daqui para baixo nada mudou: o mesmo guloso com rendimento decrescente,
  // agora sobre o orçamento que sobrou. A matéria em que o aluno tem
  // dificuldade continua levando a maior parte.
  for (;;) {
    let melhor = -1;
    let melhorNota = -Infinity;

    pendentes.forEach((p, i) => {
      if (p.usado || gasto + p.c.minutos > restante) return;
      const materia = chaveMateria((p.c.item as { materia?: string | null }).materia ?? "");
      const nota = p.base * saturacao(minutosPorMateria.get(materia) ?? 0);
      // Empate pela ordem do template: primeiro dia, primeira posição.
      if (
        nota > melhorNota ||
        (nota === melhorNota &&
          melhor >= 0 &&
          (p.c.templateDay < pendentes[melhor].c.templateDay ||
            (p.c.templateDay === pendentes[melhor].c.templateDay && p.c.ordem < pendentes[melhor].c.ordem)))
      ) {
        melhor = i;
        melhorNota = nota;
      }
    });

    if (melhor < 0) break;

    const escolhido = pendentes[melhor];
    escolhido.usado = true;
    selecionados.push(escolhido.c);
    gasto += escolhido.c.minutos;
    const materia = chaveMateria((escolhido.c.item as { materia?: string | null }).materia ?? "");
    minutosPorMateria.set(materia, (minutosPorMateria.get(materia) ?? 0) + escolhido.c.minutos);
  }

  // O que sobrou, na ordem de valor — é dele que sai o preenchimento de um
  // dia que ficaria vazio.
  const descartados = ordenarPorPrioridade(
    pendentes.filter((p) => !p.usado).map((p) => p.c),
    ctx
  );

  // De volta à ordem pedagógica: a seleção decide O QUE entra, não a ordem em
  // que se estuda. Base antes de aprofundamento continua valendo.
  obrigatorios.sort((a, b) => a.templateDay - b.templateDay || a.ordem - b.ordem);
  selecionados.sort((a, b) => a.templateDay - b.templateDay || a.ordem - b.ordem);
  return { obrigatorios, selecionados, descartados };
}
