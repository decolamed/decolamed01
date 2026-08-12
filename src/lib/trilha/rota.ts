import type { TrilhaDia, TrilhaItem } from "@/types/database";
import { diaDaSemana, diffDias, somarDias } from "@/lib/site/data";
import { minutosDoItem } from "@/lib/trilha/progresso";

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
  /** Teto de minutos por dia. */
  minutosPorDia: number;
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
 *  2. os dias após o 2º simulado viram revisão — é a função pedagógica da
 *     reta final, não conteúdo novo;
 *  3. o 1º simulado fica a meio caminho entre o começo e o 2º, com pelo
 *     menos 2 dias de folga de cada lado, para não colar os dois nem gastar
 *     o começo da rota com prova.
 *
 * Numa rota curta demais para separar os dois, devolve o que couber — nunca
 * dois simulados no mesmo dia.
 */
export function posicionarSimulados(datas: string[], dataProva: string): { indiceSim1: number; indiceSim2: number } {
  const limite = somarDias(dataProva, -DIAS_MINIMOS_APOS_SIMULADO_2);

  // Último índice cuja data ainda cabe dentro do limite.
  let indiceSim2 = -1;
  for (let i = datas.length - 1; i >= 0; i--) {
    if (datas[i] <= limite) {
      indiceSim2 = i;
      break;
    }
  }
  // Rota curta demais para respeitar os 7 dias: usa o último dia disponível,
  // porque ter o simulado é mais importante do que a folga ideal.
  if (indiceSim2 < 0) indiceSim2 = datas.length - 1;

  // 1º simulado a meio caminho, com folga mínima nas duas pontas.
  let indiceSim1 = Math.floor(indiceSim2 / 2);
  if (indiceSim1 < 1) indiceSim1 = indiceSim2 > 1 ? 1 : -1;
  if (indiceSim1 >= indiceSim2) indiceSim1 = indiceSim2 - 1;
  if (indiceSim1 < 0) indiceSim1 = -1;

  return { indiceSim1, indiceSim2 };
}

/** Simulado real da plataforma, para o dia de simulado abrir de fato. */
export interface SimuladoDisponivel {
  id: string;
  titulo: string;
}

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
    duracao_minutos: 90
  } as unknown as TrilhaItem;
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

/** Minutos de todo o conteúdo do template — base do cálculo da véspera. */
function minutosDoTemplate(template: TrilhaDia[]): number {
  return template.reduce((soma, d) => soma + (d.itens ?? []).reduce((s, it) => s + minutosDoItem(it), 0), 0);
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
  opcoes: { simulados?: SimuladoDisponivel[]; nomeVestibular?: string | null } = {}
): Rota {
  const simulados = opcoes.simulados ?? [];
  const datas = datasDisponiveis(p);
  const assinatura = assinaturaDosParametros(p);

  if (datas.length === 0) return { dias: [], parametros: p, assinatura };

  const { indiceSim1, indiceSim2 } = posicionarSimulados(datas, p.dataProva);

  // Índices reservados: simulados e os dias de revisão depois do 2º simulado.
  const reservados = new Map<number, TipoDiaRota>();
  if (indiceSim1 >= 0) reservados.set(indiceSim1, "simulado");
  reservados.set(indiceSim2, "simulado");
  for (let i = indiceSim2 + 1; i < datas.length; i++) reservados.set(i, "revisao");

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
    if (reservados.get(ultimo) === "revisao") {
      // O dia já era de revisão: não carrega conteúdo do template, então
      // transformá-lo em descanso não tira nada de ninguém. É o caso comum
      // nas janelas curtas, onde a reta final já é toda de revisão.
      reservados.set(ultimo, "descanso");
    } else if (!reservados.has(ultimo)) {
      // Aqui a véspera é um dia de conteúdo. Só vira descanso se o template
      // inteiro ainda couber nos dias restantes, dentro das horas por dia
      // informadas — senão o descanso espremeria a matéria, e o pedido é
      // explícito: distribuir o conteúdo vem antes do descanso.
      const diasDeConteudo = datas.filter((_, i) => i !== ultimo && !reservados.has(i)).length;
      if (diasDeConteudo > 0 && minutosDoTemplate(template) <= diasDeConteudo * p.minutosPorDia) {
        reservados.set(ultimo, "descanso");
      }
    }
  }

  // Dias que recebem conteúdo do template, na ordem do calendário.
  const indicesDeEstudo = datas.map((_, i) => i).filter((i) => !reservados.has(i));

  // Conteúdo, na ordem pedagógica do template. Nada é descartado.
  const ordenados = [...template].sort((a, b) => a.dia_numero - b.dia_numero);

  // Distribui os dias do template pelos dias de estudo. Quando há mais
  // template do que dias, mais de um dia do template cai no mesmo dia de
  // rota — mas isso é detalhe interno: o aluno vê um único dia numerado.
  const conteudoPorIndice = new Map<number, { dias: TrilhaDia[]; minutos: number }>();
  indicesDeEstudo.forEach((i) => conteudoPorIndice.set(i, { dias: [], minutos: 0 }));

  if (indicesDeEstudo.length > 0) {
    const porDia = Math.ceil(ordenados.length / indicesDeEstudo.length);
    let alvo = 0;
    let noAlvo = 0;

    ordenados.forEach((diaTemplate) => {
      const minutos = (diaTemplate.itens ?? []).reduce((s, it) => s + minutosDoItem(it), 0);
      const atual = conteudoPorIndice.get(indicesDeEstudo[alvo])!;

      // Abre o próximo dia quando já juntou a cota OU quando somar este dia
      // estouraria o tempo diário — desde que ainda haja dia disponível.
      const estouraTempo = atual.minutos > 0 && atual.minutos + minutos > p.minutosPorDia;
      if ((noAlvo >= porDia || estouraTempo) && alvo < indicesDeEstudo.length - 1) {
        alvo++;
        noAlvo = 0;
      }

      const destino = conteudoPorIndice.get(indicesDeEstudo[alvo])!;
      destino.dias.push(diaTemplate);
      destino.minutos += minutos;
      noAlvo++;
    });
  }

  // Monta os dias da rota. A numeração é sempre 1..N, na ordem das datas.
  const dias: DiaDaRota[] = datas.map((data, i) => {
    const routeDay = i + 1;
    const reservado = reservados.get(i);

    if (reservado === "simulado") {
      const ordem = indiceSim1 >= 0 && i === indiceSim1 ? 1 : 2;
      // Simulado real, escolhido por posição — determinístico como o resto.
      const simulado = simulados[ordem - 1] ?? simulados[0] ?? null;
      const item = itemSimulado(ordem, simulado);
      return {
        routeDay,
        scheduledDate: data,
        templateDays: [],
        tipo: "simulado",
        titulo: `Simulado ${ordem}`,
        itens: [item],
        minutos: minutosDoItem(item)
      };
    }

    if (reservado === "revisao") {
      const item = itemRevisao();
      return {
        routeDay,
        scheduledDate: data,
        templateDays: [],
        tipo: "revisao",
        titulo: "Revisão e correção",
        itens: [item],
        minutos: minutosDoItem(item)
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

    const conteudo = conteudoPorIndice.get(i) ?? { dias: [], minutos: 0 };
    const itens = conteudo.dias.flatMap((d) => d.itens ?? []);
    return {
      routeDay,
      scheduledDate: data,
      // Referência interna da origem. NÃO é o número mostrado ao aluno.
      templateDays: conteudo.dias.map((d) => d.dia_numero),
      tipo: "estudo",
      // Título próprio da rota. Antes vinha concatenado do template
      // ("Dia 38 + Dia 39 + Dia 40"), expondo a compressão interna.
      titulo: tituloDoDia(conteudo.dias),
      itens,
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
function tituloDoDia(origem: TrilhaDia[]): string {
  if (origem.length === 0) return "Dia de estudo";
  if (origem.length === 1) return origem[0].titulo || "Dia de estudo";

  const materias: string[] = [];
  origem.forEach((d) =>
    (d.itens ?? []).forEach((it) => {
      const m = (it as { materia?: string | null }).materia;
      if (m && !materias.includes(m)) materias.push(m);
    })
  );

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
