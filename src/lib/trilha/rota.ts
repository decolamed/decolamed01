import type { TrilhaDia, TrilhaItem } from "@/types/database";
import { diaDaSemana, diffDias, somarDias } from "@/lib/site/data";
import { minutosDoItem } from "@/lib/trilha/progresso";
import { chaveMateria } from "@/lib/site/materia-canonica";
import {
  candidatosDoTemplate,
  contextoVazio,
  selecionarPorPrioridade,
  type ContextoDoAluno,
  type ItemCandidato
} from "@/lib/trilha/prioridade";

// ============================================================================
// ROTA PERSONALIZADA DO ALUNO
//
// Este módulo resolve um erro conceitual que estava na raiz de praticamente
// todos os defeitos do cronograma do Voo Guiado.
//
// COMO ERA
// --------
// Não existia rota. Existiam três derivações independentes, calculadas a
// cada leitura de tela, que discordavam entre si:
//
//   conteúdo     → trilha_dias, template global, dia_numero 1..40
//   "dia de hoje"→ calcularDiaTrilha(matriculas.acesso_liberado_em)
//                  = dias desde a MATRÍCULA + 1
//   datas        → hoje + (dia_numero − diaTrilhaHoje)
//
// A data de início informada pelo aluno no briefing (`inicio_estudos`) NUNCA
// entrava nessa conta. Quem ancorava a linha do tempo era a data da
// matrícula. Consequências diretas, todas observadas:
//
//   • matrícula 21 dias atrás → diaTrilhaHoje = 22 → tudo com dia_numero < 22
//     virava passado → "21 dias anteriores";
//   • o cartão mostrava `dia_numero` do template → "Dia 22" como segundo dia;
//   • a data do dia 1 saía `hoje − 21` → 12/07 num cronograma que começa
//     em 12/08 (não é fuso horário: é a âncora errada);
//   • a compactação renumerava o conteúdo para 1..N mas deixava o ponteiro e
//     as datas na régua do template, então `find(dia_numero === hoje)` não
//     achava nada e a rota inteira caía em "dias anteriores".
//
// COMO É AGORA
// ------------
// A rota é um objeto de primeira classe, gerado deterministicamente a partir
// do briefing e persistido. Três conceitos, com nomes distintos e sem
// sobreposição:
//
//   routeDay      → posição do aluno na SUA rota (1..N). É o que a tela mostra.
//   templateDays  → de quais dias do template veio o conteúdo. Só referência.
//   scheduledDate → a data real em que o aluno executa aquele dia.
//
// O template de 40 dias continua existindo e intocado: ele é a FONTE DE
// CONTEÚDO, não a régua do aluno.
// ============================================================================

/** Sigla usada em `aluno_briefing.dias_estuda`. */
const MAPA_DIA = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;

/** Distância mínima, em dias de calendário, entre o 2º simulado e a prova. */
export const DIAS_MINIMOS_APOS_SIMULADO_2 = 7;

/** Quantos simulados toda rota precisa ter, independente do tamanho. */
export const SIMULADOS_POR_ROTA = 2;

export type TipoDiaRota = "estudo" | "simulado" | "revisao" | "descanso" | "prova";

export interface DiaDaRota {
  /** Posição na rota do aluno, 1..N. É ISTO que a interface exibe. */
  routeDay: number;
  /** Data real de execução (YYYY-MM-DD). */
  scheduledDate: string;
  /** Dias do template que forneceram o conteúdo. Referência interna. */
  templateDays: number[];
  tipo: TipoDiaRota;
  titulo: string;
  itens: TrilhaItem[];
  /** Soma estimada dos minutos dos itens do dia. */
  minutos: number;
}

export interface ParametrosRota {
  /** Data em que o aluno declarou que começa (YYYY-MM-DD). */
  inicio: string;
  /** Data da prova (YYYY-MM-DD). Nenhum dia de rota cai nela ou depois. */
  dataProva: string;
  /** Siglas dos dias da semana em que estuda. Vazio = todos os dias. */
  diasEstuda: string[];
  /** Teto de minutos por dia — restrição absoluta, não sugestão. */
  minutosPorDia: number;
  /**
   * Teto por dia da semana, quando o aluno tiver disponibilidade diferente
   * em cada um ("segunda 3h, terça 5h"). O que não estiver aqui usa
   * `minutosPorDia`. Hoje o briefing pergunta um número só; a capacidade já
   * é calculada dia a dia para não precisar refazer o algoritmo depois.
   */
  minutosPorDiaDaSemana?: Partial<Record<(typeof MAPA_DIA)[number], number>>;
}

/** Capacidade de estudo de uma data específica, em minutos. */
export function capacidadeDaData(data: string, p: ParametrosRota): number {
  const sigla = MAPA_DIA[diaDaSemana(data)];
  const especifico = p.minutosPorDiaDaSemana?.[sigla];
  const minutos = Number.isFinite(especifico) && (especifico as number) > 0 ? (especifico as number) : p.minutosPorDia;
  return Math.max(0, Math.round(minutos));
}

export interface Rota {
  dias: DiaDaRota[];
  parametros: ParametrosRota;
  /** Assinatura dos parâmetros — muda quando a rota precisa ser regerada. */
  assinatura: string;
}

/**
 * Datas de estudo disponíveis entre o início e a prova.
 *
 * Definição explícita, para não misturar conceitos (era exatamente a
 * ambiguidade apontada): conta os dias de CALENDÁRIO de `inicio` até o dia
 * ANTERIOR à prova, e mantém só aqueles cuja sigla o aluno marcou. O dia da
 * prova nunca entra — não é dia de estudo. O dia de início entra, se for um
 * dia marcado.
 */
export function datasDisponiveis(p: Pick<ParametrosRota, "inicio" | "dataProva" | "diasEstuda">): string[] {
  const total = diffDias(p.inicio, p.dataProva);
  if (total <= 0) return [];

  const marcados = new Set((p.diasEstuda ?? []).map((d) => d.toLowerCase()));
  const datas: string[] = [];
  for (let i = 0; i < total; i++) {
    const data = somarDias(p.inicio, i);
    if (marcados.size === 0 || marcados.has(MAPA_DIA[diaDaSemana(data)])) datas.push(data);
  }
  return datas;
}

/**
 * Em quais posições da rota entram os dois simulados.
 *
 * Regras, nesta ordem de prioridade:
 *
 *  1. o 2º simulado fica no ÚLTIMO dia que ainda respeita
 *     `scheduledDate <= dataProva − 7`, para sobrar tempo de corrigir os
 *     erros que ele revelar;
 *  2. logo depois do 2º simulado vêm um ou dois dias de correção — o tempo
 *     de fato necessário para trabalhar o que ele revelou, e não a reta
 *     final inteira;
 *  3. o 1º simulado fica a meio caminho entre o começo e o 2º, com pelo
 *     menos 2 dias de folga de cada lado, para não colar os dois nem gastar
 *     o começo da rota com prova.
 *
 * Numa rota curta demais para separar os dois, devolve o que couber — nunca
 * dois simulados no mesmo dia.
 */
export function posicionarSimulados(datas: string[], dataProva: string): { indiceSim1: number; indiceSim2: number } {
  // Quantos dias de estudo ficam DEPOIS do 2º simulado, para o aluno corrigir
  // o que ele revelar. Sete é o alvo — mas sete dias de uma janela de dez
  // seriam 70% da preparação gastos depois do diagnóstico, com os dois
  // simulados espremidos no comecinho. O alvo vale enquanto for uma parte
  // razoável da rota; abaixo disso, a folga acompanha o tamanho da janela.
  const folga = Math.max(1, Math.min(DIAS_MINIMOS_APOS_SIMULADO_2, Math.ceil(datas.length * 0.3)));

  // Posição pretendida, contada em dias de estudo (não de calendário): é o
  // que o aluno de fato executa.
  let indiceSim2 = Math.max(0, datas.length - 1 - folga);

  // Se a janela é longa, a regra de calendário ainda manda: no mínimo sete
  // dias corridos entre o simulado e a prova.
  const limite = somarDias(dataProva, -DIAS_MINIMOS_APOS_SIMULADO_2);
  if (datas[indiceSim2] > limite) {
    for (let i = indiceSim2; i >= 0; i--) {
      if (datas[i] <= limite) {
        // Só recua se o simulado continuar na segunda metade da rota. Puxá-lo
        // para o comecinho para satisfazer a regra de calendário seria trocar
        // um problema por outro: o aluno faria os dois simulados nos primeiros
        // dias e chegaria à prova sem nenhum diagnóstico recente.
        if (i >= Math.floor(datas.length / 2)) indiceSim2 = i;
        break;
      }
    }
  }

  // 1º simulado a meio caminho, com folga mínima nas duas pontas.
  let indiceSim1 = Math.floor(indiceSim2 / 2);
  if (indiceSim1 < 1) indiceSim1 = indiceSim2 > 1 ? 1 : -1;
  if (indiceSim1 >= indiceSim2) indiceSim1 = indiceSim2 - 1;
  if (indiceSim1 < 0) indiceSim1 = -1;

  return { indiceSim1, indiceSim2 };
}

/** Duração de um dia de simulado quando o simulado ainda não tem uma. */
export const MINUTOS_PADRAO_DO_SIMULADO = 90;

/** Simulado real da plataforma, para o dia de simulado abrir de fato. */
export interface SimuladoDisponivel {
  id: string;
  titulo: string;
  /**
   * `simulados.tempo_minutos` — a duração de verdade da prova.
   *
   * Antes o dia de simulado era sempre 90 minutos, fixo no código. Um
   * simulado de 4 horas aparecia no cronograma como 1h30: o aluno se
   * organizava para uma tarde e a prova tomava o dia.
   */
  duracaoMinutos?: number | null;
}

/**
 * O dia de simulado NÃO respeita o limite diário de estudo.
 *
 * O limite que o aluno declarou no briefing vale para o estudo do dia a dia,
 * que o algoritmo distribui e pode espalhar por mais dias. Simulado não se
 * distribui: é uma prova, tem duração própria e se faz de uma sentada. Um
 * aluno com 2h por dia e um simulado de 4h precisa fazer as 4h — cortar pela
 * metade não daria meio simulado, daria um simulado interrompido.
 *
 * Na prática isso já vale por construção: os dias de simulado são reservados
 * ANTES do cálculo de capacidade e ficam fora de `indicesDeEstudo`, então
 * nenhum teto é aplicado a eles. Esta função existe para que a duração
 * mostrada seja a real, e para o motivo ficar escrito onde alguém possa lê-lo
 * antes de "consertar" o dia que passa do limite.
 */
function itemSimulado(ordem: number, simulado: SimuladoDisponivel | null): TrilhaItem {
  return {
    tipo: "simulado",
    // Sem simulado cadastrado o item continua existindo — a rota promete dois
    // simulados e é melhor o aluno ver o dia reservado (e cair na lista de
    // simulados) do que a rota simplesmente não ter o dia.
    titulo: simulado ? simulado.titulo : `Simulado ${ordem}`,
    ref_id: simulado ? simulado.id : null,
    url: null,
    materia: null,
    duracao_minutos:
      simulado && Number.isFinite(simulado.duracaoMinutos) && (simulado.duracaoMinutos as number) > 0
        ? (simulado.duracaoMinutos as number)
        : MINUTOS_PADRAO_DO_SIMULADO
  } as unknown as TrilhaItem;
}

/**
 * Minutos de um dia de simulado.
 *
 * `minutosDoItem` responde por TIPO (um mapa fixo: simulado = 90) e ignora o
 * `duracao_minutos` do item. Trocar aquele mapa mudaria o cálculo de todos os
 * itens de todos os cronogramas, e o pedido aqui é só sobre o simulado — por
 * isso a leitura da duração real fica contida neste ponto.
 */
function minutosDoSimulado(item: TrilhaItem): number {
  const declarado = (item as unknown as { duracao_minutos?: number }).duracao_minutos;
  return Number.isFinite(declarado) && (declarado as number) > 0
    ? (declarado as number)
    : MINUTOS_PADRAO_DO_SIMULADO;
}

function itemRevisao(): TrilhaItem {
  return {
    tipo: "revisao",
    titulo: "Revisão dirigida",
    ref_id: null,
    url: null,
    materia: null,
    duracao_minutos: 60
  } as unknown as TrilhaItem;
}

/** Como o dia da prova aparece no cronograma. */
export function tituloDaProva(nomeVestibular?: string | null): string {
  const nome = (nomeVestibular ?? "").trim();
  // "vestibular" é o padrão genérico de `configuracoes` para quem ainda não
  // cadastrou a instituição — concatenar daria "VESTIBULAR VESTIBULAR".
  if (!nome || nome.toLowerCase() === "vestibular") return "DIA DA PROVA";
  return `DIA DA PROVA — VESTIBULAR ${nome.toUpperCase()}`;
}

export const TITULO_VESPERA = "VÉSPERA DA PROVA — DESCANSO";

/** Como aparece um dia que o mentor esvaziou e ainda não repreencheu. */
export const TITULO_DIA_LIVRE = "Dia livre — a definir";

/** O conteúdo que o mentor definiu para um dia da rota de um aluno. */
export interface AjusteDoDia {
  /** Vazio/ausente = mantém o título que o gerador daria para esses itens. */
  titulo?: string | null;
  /** A lista COMPLETA do dia. Vazia = dia sem conteúdo. */
  itens: TrilhaItem[];
}

/** Minutos de todo o conteúdo do template — base do cálculo da véspera. */
function minutosDoTemplate(template: TrilhaDia[]): number {
  return template.reduce((soma, d) => soma + (d.itens ?? []).reduce((s, it) => s + minutosDoItem(it), 0), 0);
}

/**
 * Quanto da capacidade fica LIVRE para o Copiloto preencher depois.
 *
 * A reserva não cria dia vazio: ela deixa uma fatia de cada dia sem
 * compromisso, para caber a revisão que o erro de amanhã vai pedir. Sem isso,
 * uma rota planejada até o último minuto não tem onde encaixar revisão
 * nenhuma, e toda adaptação viraria "empurrar para depois da prova".
 *
 * Varia com a janela: rota longa tem mais tempo para o desempenho revelar
 * problemas (e mais revisões pela frente), rota curta precisa gastar quase
 * tudo com conteúdo — mas nunca zero, senão o Copiloto fica sem manobra.
 */
export function fracaoDeReserva(diasDeEstudo: number): number {
  if (diasDeEstudo <= 0) return 0;
  if (diasDeEstudo <= 5) return 0.1;
  if (diasDeEstudo <= 12) return 0.15;
  if (diasDeEstudo <= 25) return 0.2;
  return 0.25;
}

/**
 * Gera a rota do aluno.
 *
 * Determinístico por construção: só depende dos argumentos. Não lê banco,
 * não sorteia, não olha registro antigo, não depende de ordem de inserção.
 * Os mesmos parâmetros produzem sempre exatamente a mesma rota.
 */
export function gerarRota(
  template: TrilhaDia[],
  p: ParametrosRota,
  opcoes: {
    /**
     * Qual simulado vai em cada posição: índice 0 = 1º simulado, índice 1 =
     * 2º. Aceita `null` numa posição — o dia continua reservado e o item vai
     * sem `ref_id`, levando o aluno à lista. Ver simulados-da-rota.ts.
     */
    simulados?: (SimuladoDisponivel | null)[];
    /**
     * O que o MENTOR definiu para cada dia, por número da rota (1..N).
     *
     * Quando um dia tem ajuste, a lista dele substitui a que o gerador
     * montaria — inclusive quando a lista é vazia, que é como se esvazia um
     * dia. O dia continua existindo, com a mesma data e o mesmo número.
     *
     * Sem isso não haveria como editar a rota de um aluno: ela é regerada a
     * cada leitura da tela, então uma edição gravada em `aluno_rota_dias`
     * seria desfeita no carregamento seguinte. Aqui a edição é ENTRADA da
     * geração, não resultado dela.
     *
     * Um dia ajustado também não devolve a capacidade dele para os outros: o
     * mentor decidiu o conteúdo daquele dia, e redistribuir encheria de novo
     * justamente o dia que ele acabou de definir.
     */
    ajustesDoMentor?: Record<number, AjusteDoDia>;
    nomeVestibular?: string | null;
    /** Pesos, briefing, desempenho e progresso — o que decide a seleção. */
    contexto?: ContextoDoAluno;
  } = {}
): Rota {
  const simulados = opcoes.simulados ?? [];
  const contexto = opcoes.contexto ?? contextoVazio();
  // Reindexado por ÍNDICE (0-based) porque é assim que o resto da função
  // trabalha; o mentor enxerga o NÚMERO do dia, que é 1-based.
  const ajustes = new Map<number, AjusteDoDia>();
  Object.entries(opcoes.ajustesDoMentor ?? {}).forEach(([dia, ajuste]) => {
    const indice = Number(dia) - 1;
    if (Number.isInteger(indice) && indice >= 0 && ajuste) ajustes.set(indice, ajuste);
  });
  const datas = datasDisponiveis(p);
  const assinatura = assinaturaDosParametros(p);

  if (datas.length === 0) return { dias: [], parametros: p, assinatura };

  const { indiceSim1, indiceSim2 } = posicionarSimulados(datas, p.dataProva);

  // Índices reservados: simulados e os dias de revisão depois do 2º simulado.
  const reservados = new Map<number, TipoDiaRota>();
  if (indiceSim1 >= 0) reservados.set(indiceSim1, "simulado");
  reservados.set(indiceSim2, "simulado");

  // Depois do 2º simulado vêm os dias de CORRIGIR o que ele revelou — não a
  // rota inteira. A versão anterior marcava como revisão todo dia depois do
  // simulado: numa janela de 10 dias isso transformava 6 dos 10 em "Revisão
  // dirigida", e o aluno recebia meia rota sem conteúdo. Corrigir um simulado
  // custa um ou dois dias; o que sobra continua sendo tempo de estudo, que é
  // onde o Copiloto vai encaixar o reforço do que ele errou.
  const diasAposSimulado2 = datas.length - 1 - indiceSim2;
  const diasDeCorrecao = diasAposSimulado2 <= 1 ? diasAposSimulado2 : Math.min(2, Math.ceil(diasAposSimulado2 / 3));
  for (let i = indiceSim2 + 1; i <= indiceSim2 + diasDeCorrecao && i < datas.length; i++) {
    reservados.set(i, "revisao");
  }

  // ---- Véspera da prova -------------------------------------------------
  //
  // O dia imediatamente anterior à prova vira descanso — mas só quando sobra
  // tempo. A ordem de prioridade é a do pedido: a prova sempre aparece e
  // nunca recebe conteúdo; depois vem distribuir todo o conteúdo; o descanso
  // da véspera é a terceira prioridade, e numa janela curta ele cede lugar ao
  // estudo em vez de espremer o conteúdo nos dias restantes.
  //
  // "Sobra tempo" não é um palpite: é o conteúdo do template cabendo nos dias
  // de estudo que restariam, dentro das horas por dia que o aluno informou.
  const ultimo = datas.length - 1;
  const vesperaReal = somarDias(p.dataProva, -1);
  const podeSerVespera = datas[ultimo] === vesperaReal && reservados.get(ultimo) !== "simulado";

  if (podeSerVespera) {
    // A decisão é de custo-benefício — não uma regra fixa de "véspera sempre
    // descansa".
    //
    // Descansar custa a capacidade daquele dia. Numa rota longa esse dia é
    // uma fração pequena do plano, e chegar inteiro na prova vale mais.
    // Numa rota curta ele é uma fatia grande da preparação inteira, e tirar
    // conteúdo de quem já tem pouco tempo prejudica o aluno.
    //
    // O corte é esse: a véspera vira descanso quando perdê-la custa menos de
    // um décimo da capacidade total — ou quando todo o conteúdo cabe mesmo
    // sem ela, caso em que não há nada a perder.
    const diasDeConteudo = datas.filter((_, i) => i !== ultimo && !reservados.has(i) && !ajustes.has(i));
    const capacidadeSemVespera = diasDeConteudo.reduce((s, d) => s + capacidadeDaData(d, p), 0);
    const capacidadeDaVespera = capacidadeDaData(datas[ultimo], p);
    const total = capacidadeSemVespera + capacidadeDaVespera;

    const cabeSemEla = diasDeConteudo.length > 0 && minutosDoTemplate(template) <= capacidadeSemVespera;
    const custaPouco = total > 0 && capacidadeDaVespera / total < 0.1;

    if (diasDeConteudo.length > 0 && (cabeSemEla || custaPouco)) reservados.set(ultimo, "descanso");
  }

  // Dias que recebem conteúdo do template, na ordem do calendário.
  const indicesDeEstudo = datas.map((_, i) => i).filter((i) => !reservados.has(i) && !ajustes.has(i));

  // ---- Capacidade real ---------------------------------------------------
  // A capacidade do dia é o que o aluno declarou que consegue estudar. Daqui
  // pra baixo ela é uma RESTRIÇÃO: nenhum dia recebe mais do que isso, e o
  // total planejado nunca passa da soma das capacidades.
  const capacidade = new Map<number, number>();
  indicesDeEstudo.forEach((i) => capacidade.set(i, capacidadeDaData(datas[i], p)));
  const capacidadeTotal = [...capacidade.values()].reduce((s, m) => s + m, 0);

  // Parte da capacidade fica de fora do plano inicial, para o Copiloto ter
  // onde encaixar as revisões que o desempenho vai pedir.
  const orcamento = Math.floor(capacidadeTotal * (1 - fracaoDeReserva(indicesDeEstudo.length)));

  const { obrigatorios, selecionados, descartados } = selecionarPorPrioridade(
    candidatosDoTemplate(template),
    contexto,
    orcamento
  );

  // ---- Alocação ----------------------------------------------------------
  // Primeiro que couber, na ordem do calendário: o conteúdo segue a sequência
  // pedagógica e cada dia para de receber quando bate no próprio teto. Um
  // item que não cabe no dia atual vai para o próximo com espaço — nunca é
  // empilhado num dia que o aluno não tem como executar.
  const conteudoPorIndice = new Map<number, { itens: ItemCandidato[]; minutos: number }>();
  indicesDeEstudo.forEach((i) => conteudoPorIndice.set(i, { itens: [], minutos: 0 }));

  // O ritmo do dia é o menor entre a capacidade dele e o que sobra dividido
  // pelos dias que faltam. Sem esse segundo termo, encher "o primeiro que
  // couber" concentraria tudo no começo: 12 itens numa janela de 19 dias
  // caberiam todos nos três primeiros, e o resto da rota dependeria do
  // preenchimento de emergência. Com ele, conteúdo folgado se espalha e
  // conteúdo apertado enche cada dia até o teto — sem nunca passar dele.
  // Os requisitos do plano (redações e leituras dos livros) são colocados
  // ANTES de tudo, espalhados pela rota. Se disputassem lugar com o conteúdo
  // acadêmico na alocação, poderiam sobrar de fora por falta de espaço num
  // dia — depois de já terem sido garantidos na seleção, o que seria perdê-los
  // no último passo.
  const espacados = Math.max(1, Math.floor(indicesDeEstudo.length / Math.max(1, obrigatorios.length)));
  obrigatorios.forEach((c, k) => {
    const preferido = Math.min(k * espacados, indicesDeEstudo.length - 1);
    const ordemDeBusca = [
      ...indicesDeEstudo.slice(preferido),
      ...indicesDeEstudo.slice(0, preferido)
    ];
    const destino = ordemDeBusca.find((i) => {
      const bucket = conteudoPorIndice.get(i)!;
      return bucket.minutos + c.minutos <= (capacidade.get(i) ?? 0);
    });
    if (destino === undefined) return; // janela pequena demais: o validador acusa
    const bucket = conteudoPorIndice.get(destino)!;
    bucket.itens.push(c);
    bucket.minutos += c.minutos;
  });

  const naoAlocados: ItemCandidato[] = [];
  let restante = selecionados.reduce((s, c) => s + c.minutos, 0);
  let fila = [...selecionados];

  indicesDeEstudo.forEach((indice, posicao) => {
    const bucket = conteudoPorIndice.get(indice)!;
    const teto = capacidade.get(indice) ?? 0;
    const diasRestantes = indicesDeEstudo.length - posicao;
    // O ritmo soma o que o obrigatório já ocupou neste dia: sem isso um dia
    // com redação receberia conteúdo acadêmico como se estivesse vazio.
    const ritmo = Math.min(teto, bucket.minutos + Math.ceil(restante / Math.max(1, diasRestantes)));

    for (;;) {
      const proximo = fila[0];
      if (!proximo) break;
      // Um item mais longo que o ritmo ainda entra, desde que caiba no teto do
      // dia — do contrário ele nunca seria alocado em lugar nenhum.
      const limite = Math.min(teto, Math.max(ritmo, proximo.minutos));
      if (bucket.minutos + proximo.minutos > limite) break;
      bucket.itens.push(proximo);
      bucket.minutos += proximo.minutos;
      restante -= proximo.minutos;
      fila = fila.slice(1);
    }
  });

  naoAlocados.push(...fila);
  indicesDeEstudo.forEach((i) => {
    const bucket = conteudoPorIndice.get(i)!;
    bucket.itens.sort((a, b) => a.templateDay - b.templateDay || a.ordem - b.ordem);
  });

  // ---- Nenhum dia de estudo vazio ----------------------------------------
  // A reserva existe para o algoritmo, não para o aluno: se um dia ficou sem
  // nada, ele recebe o melhor conteúdo que ainda cabe. Só quando não há mais
  // conteúdo nenhum é que o dia vira revisão — com item de verdade, nunca em
  // branco.
  const sobrando = [...naoAlocados, ...descartados];

  // Quanto de cada matéria a rota JÁ tem. O preenchimento de emergência é
  // servido em ordem de prioridade, e para um aluno que declarou domínio numa
  // matéria essa ordem deixa os itens dela no fim da fila — em janelas muito
  // apertadas, onde é o preenchimento que decide quase tudo, a matéria sumia
  // mesmo com a reserva de cobertura já aplicada na seleção. Aqui vale a
  // mesma ideia do seletor: entre os que cabem, entra o da matéria menos
  // presente até agora; empate mantém a ordem de prioridade.
  const minutosNaRota = new Map<string, number>();
  const materiaDe = (c: ItemCandidato) =>
    chaveMateria((c.item as { materia?: string | null }).materia ?? "");
  const contarNaRota = (c: ItemCandidato) =>
    minutosNaRota.set(materiaDe(c), (minutosNaRota.get(materiaDe(c)) ?? 0) + c.minutos);
  conteudoPorIndice.forEach((b) => b.itens.forEach(contarNaRota));

  /**
   * Índice do melhor item para preencher, ou -1 quando nada cabe.
   *
   * Regra em dois passos, e a ordem importa:
   *
   *   1. se algum item que cabe é de uma matéria AINDA AUSENTE da rota, ele
   *      entra — é o que impede uma matéria de ser esquecida por completo;
   *   2. caso contrário, o primeiro que cabe na ordem de prioridade, como
   *      sempre foi.
   *
   * A primeira versão desta função escolhia sempre a matéria MENOS presente,
   * e o efeito foi achatar a rota: num caso de 10 dias a 3h, Geografia
   * terminava com os mesmos 3 itens de Biologia, e Exatas caía de 16 para 12.
   * Isso é o rateio igual que a personalização não pode virar. Corrigir a
   * ausência é diferente de equalizar frequência.
   */
  const escolherParaPreencher = (limite: number): number => {
    const cabe = (c: ItemCandidato) => c.minutos <= limite;
    const ausente = sobrando.findIndex((c) => cabe(c) && (minutosNaRota.get(materiaDe(c)) ?? 0) === 0);
    if (ausente >= 0) return ausente;
    return sobrando.findIndex(cabe);
  };

  // O dia de correção depois do simulado também recebe reforço: sozinho, o
  // bloco de revisão ocupava 30 dos 180 minutos do dia e o resto se perdia.
  // Ele continua sendo um dia de revisão — só que com material em cima.
  const reforcoDaRevisao = new Map<number, { itens: ItemCandidato[]; minutos: number }>();
  datas.forEach((data, i) => {
    if (reservados.get(i) !== "revisao") return;
    const teto = Math.max(0, capacidadeDaData(data, p) - minutosDoItem(itemRevisao()));
    const alvo = Math.floor(teto * (1 - fracaoDeReserva(indicesDeEstudo.length)));
    const bucket = { itens: [] as ItemCandidato[], minutos: 0 };
    for (;;) {
      const cabe = escolherParaPreencher(alvo - bucket.minutos);
      if (cabe < 0) break;
      const [escolhido] = sobrando.splice(cabe, 1);
      bucket.itens.push(escolhido);
      bucket.minutos += escolhido.minutos;
      contarNaRota(escolhido);
    }
    bucket.itens.sort((a, b) => a.templateDay - b.templateDay || a.ordem - b.ordem);
    reforcoDaRevisao.set(i, bucket);
  });

  indicesDeEstudo.forEach((i) => {
    const bucket = conteudoPorIndice.get(i)!;
    if (bucket.itens.length > 0) return;
    // Enche até o limite do planejamento (o mesmo desconto de reserva do
    // resto da rota), não até o teto: o dia deixa de estar vazio sem consumir
    // a folga que o Copiloto vai precisar.
    const teto = Math.max(1, Math.floor((capacidade.get(i) ?? 0) * (1 - fracaoDeReserva(indicesDeEstudo.length))));
    for (;;) {
      const cabe = escolherParaPreencher(teto - bucket.minutos);
      if (cabe < 0) break;
      const [escolhido] = sobrando.splice(cabe, 1);
      bucket.itens.push(escolhido);
      bucket.minutos += escolhido.minutos;
      contarNaRota(escolhido);
    }
    bucket.itens.sort((a, b) => a.templateDay - b.templateDay || a.ordem - b.ordem);
    if (bucket.itens.length === 0) reservados.set(i, "revisao");
  });

  // Monta os dias da rota. A numeração é sempre 1..N, na ordem das datas.
  const dias: DiaDaRota[] = datas.map((data, i) => {
    const routeDay = i + 1;
    const reservado = reservados.get(i);

    // Dia definido pelo mentor: o conteúdo dele é o que está aqui, ponto.
    // Continua sendo dia de estudo (não vira descanso) mesmo quando vazio —
    // é um espaço reservado para o que o mentor for colocar, não uma folga.
    const ajuste = !reservado ? ajustes.get(i) : undefined;
    if (ajuste) {
      const itens = ajuste.itens ?? [];
      return {
        routeDay,
        scheduledDate: data,
        templateDays: [],
        tipo: "estudo",
        titulo: (ajuste.titulo ?? "").trim() || (itens.length > 0 ? tituloDoDia(itens) : TITULO_DIA_LIVRE),
        itens,
        minutos: itens.reduce((s, it) => s + minutosDoItem(it), 0)
      };
    }

    if (reservado === "simulado") {
      const ordem = indiceSim1 >= 0 && i === indiceSim1 ? 1 : 2;
      // Qual simulado vai em cada posição já vem decidido de fora (ver
      // lib/trilha/simulados-da-rota.ts). Aqui é só posição → item.
      //
      // Sem `?? simulados[0]`: esse fallback existia e fazia os dois dias
      // abrirem o MESMO simulado sempre que houvesse só um cadastrado — uma
      // duplicação silenciosa, que o aluno não tinha como perceber. Posição
      // sem simulado agora vira dia sem `ref_id`, que leva à lista.
      const simulado = simulados[ordem - 1] ?? null;
      const item = itemSimulado(ordem, simulado);
      return {
        routeDay,
        scheduledDate: data,
        templateDays: [],
        tipo: "simulado",
        titulo: `Simulado ${ordem}`,
        itens: [item],
        // A duração real da prova, mesmo que passe do limite diário — ver
        // itemSimulado() para o porquê.
        minutos: minutosDoSimulado(item)
      };
    }

    if (reservado === "revisao") {
      const item = itemRevisao();
      const reforco = reforcoDaRevisao.get(i) ?? { itens: [] as ItemCandidato[], minutos: 0 };
      return {
        routeDay,
        scheduledDate: data,
        templateDays: [...new Set(reforco.itens.map((c) => c.templateDay))].sort((a, b) => a - b),
        tipo: "revisao",
        titulo: "Revisão e correção",
        itens: [item, ...reforco.itens.map((c) => c.item)],
        minutos: minutosDoItem(item) + reforco.minutos
      };
    }

    // Véspera: sem itens de propósito. Um bloco "revisar tudo" aqui seria
    // conteúdo com outro nome, e o pedido é descanso.
    if (reservado === "descanso") {
      return {
        routeDay,
        scheduledDate: data,
        templateDays: [],
        tipo: "descanso",
        titulo: TITULO_VESPERA,
        itens: [],
        minutos: 0
      };
    }

    const conteudo = conteudoPorIndice.get(i) ?? { itens: [] as ItemCandidato[], minutos: 0 };
    const origem = [...new Set(conteudo.itens.map((c) => c.templateDay))].sort((a, b) => a - b);
    return {
      routeDay,
      scheduledDate: data,
      // Referência interna da origem. NÃO é o número mostrado ao aluno.
      templateDays: origem,
      tipo: "estudo",
      // Título próprio da rota. Antes vinha concatenado do template
      // ("Dia 38 + Dia 39 + Dia 40"), expondo a compressão interna.
      titulo: tituloDoDia(conteudo.itens.map((c) => c.item)),
      itens: conteudo.itens.map((c) => c.item),
      minutos: conteudo.minutos
    };
  });

  // O DIA DA PROVA sempre entra, como último dia da rota e sem conteúdo
  // nenhum — nem estudo, nem revisão, nem questões. Ele não é um dia de
  // estudo: é o evento que fecha a rota, e o aluno precisa vê-lo no
  // cronograma para saber que a contagem termina ali.
  dias.push({
    routeDay: dias.length + 1,
    scheduledDate: p.dataProva,
    templateDays: [],
    tipo: "prova",
    titulo: tituloDaProva(opcoes.nomeVestibular),
    itens: [],
    minutos: 0
  });

  return { dias, parametros: p, assinatura };
}

/** Dias de estudo da rota — o dia da prova não conta como dia de estudo. */
export function diasDeEstudoDaRota(dias: DiaDaRota[]): DiaDaRota[] {
  return dias.filter((d) => d.tipo !== "prova");
}

/**
 * Título do dia da rota. Usa o título do template quando um único dia o
 * alimentou; com mais de um, descreve o dia pelo próprio conteúdo em vez de
 * emendar os títulos de origem.
 */
function tituloDoDia(itens: TrilhaItem[]): string {
  if (itens.length === 0) return "Dia de estudo";

  const materias: string[] = [];
  itens.forEach((it) => {
    const m = (it as { materia?: string | null }).materia;
    if (m && !materias.includes(m)) materias.push(m);
  });

  if (materias.length === 0) return "Dia de estudo";
  if (materias.length <= 3) return materias.join(" · ");
  return `${materias.slice(0, 3).join(" · ")} +${materias.length - 3}`;
}

/**
 * Qual é o dia de HOJE na rota — fonte única de verdade.
 *
 * Toda tela (painel, cronograma, missões, Copiloto) deve chamar esta função
 * em vez de derivar o dia por conta própria. Era a duplicação dessa lógica
 * que fazia a tela inicial e o cronograma discordarem.
 *
 * Ordem de decisão:
 *  1. existe dia da rota agendado exatamente para hoje → é ele;
 *  2. hoje é antes do início → o dia 1 (a rota ainda não começou);
 *  3. hoje é depois do último dia → o último;
 *  4. hoje caiu num dia não marcado (fim de semana, p.ex.) → o próximo dia
 *     agendado, que é o que o aluno vai executar de fato.
 */
export function diaAtualDaRota(dias: DiaDaRota[], hoje: string): DiaDaRota | null {
  if (dias.length === 0) return null;

  const exato = dias.find((d) => d.scheduledDate === hoje);
  if (exato) return exato;

  if (hoje < dias[0].scheduledDate) return dias[0];

  const proximo = dias.find((d) => d.scheduledDate > hoje);
  if (proximo) return proximo;

  return dias[dias.length - 1];
}

/**
 * A rota no formato que as telas já consomem (`TrilhaDia`).
 *
 * `dia_numero` recebe o **routeDay** — o número da posição do aluno na sua
 * própria rota. Não é maquiagem de tela: a partir daqui não existe mais
 * nenhum caminho por onde o número do template chegue à interface. Os campos
 * de origem seguem juntos, explicitamente nomeados, para diagnóstico e para
 * o admin conseguir rastrear de onde veio o conteúdo do dia.
 */
export interface DiaDeCronograma extends TrilhaDia {
  scheduled_date: string;
  template_days: number[];
  tipo_rota: TipoDiaRota;
}

export function cronogramaDeTela(rota: Rota): DiaDeCronograma[] {
  return rota.dias.map((d) => ({
    // `id` estável dentro da rota: as telas usam como key de lista.
    id: `rota-${d.routeDay}`,
    dia_numero: d.routeDay,
    titulo: d.titulo,
    itens: d.itens,
    atividades: [],
    updated_at: "",
    scheduled_date: d.scheduledDate,
    template_days: d.templateDays,
    tipo_rota: d.tipo
  }));
}

/**
 * Mapa routeDay → data agendada.
 *
 * É a ponte da rota para o calendário. Antes a data saía de
 * `hoje + (dia_numero − diaDeHoje)`, uma extrapolação que só acertava se o
 * aluno estudasse todos os dias sem falhar um — e que produzia datas de
 * julho num cronograma que começa em agosto. Agora a data não é calculada na
 * tela: ela é lida da rota, onde foi decidida uma vez só.
 */
export function datasDaRota(rota: Rota): Record<number, string> {
  const mapa: Record<number, string> = {};
  rota.dias.forEach((d) => {
    mapa[d.routeDay] = d.scheduledDate;
  });
  return mapa;
}

/**
 * Assinatura dos parâmetros que definem a rota.
 *
 * Se qualquer um mudar, a rota guardada não vale mais e precisa ser gerada
 * de novo — é o que impede a mistura de duas versões de cronograma.
 */
export function assinaturaDosParametros(p: ParametrosRota): string {
  const dias = [...(p.diasEstuda ?? [])].map((d) => d.toLowerCase()).sort().join(",");
  return [p.inicio, p.dataProva, dias, p.minutosPorDia].join("|");
}

/**
 * Monta os parâmetros a partir do briefing.
 *
 * O início é a data que o ALUNO informou. Só usa "hoje" quando essa data já
 * passou — aí o que resta da janela é o que ele tem de verdade. É aqui que a
 * âncora deixa de ser a data de matrícula, origem das datas de julho num
 * cronograma que começa em agosto.
 */
export function parametrosDoBriefing(
  briefing: {
    data_prova?: string | null;
    inicio_estudos?: string | null;
    dias_estuda?: string[] | null;
    horas_por_dia_semana?: number | string | null;
  } | null,
  hoje: string
): ParametrosRota | null {
  const dataProva = briefing?.data_prova?.slice(0, 10);
  if (!dataProva) return null;

  const informado = briefing?.inicio_estudos?.slice(0, 10);
  const inicio = informado && informado > hoje ? informado : hoje;
  if (inicio >= dataProva) return null;

  const horas = Number(briefing?.horas_por_dia_semana ?? 2);
  const minutosPorDia = Math.max(30, Math.round((Number.isFinite(horas) && horas > 0 ? horas : 2) * 60));

  return {
    inicio,
    dataProva,
    diasEstuda: (briefing?.dias_estuda ?? []).map((d) => d.toLowerCase()),
    minutosPorDia
  };
}
