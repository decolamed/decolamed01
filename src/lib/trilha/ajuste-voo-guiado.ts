import type { TrilhaDia, TrilhaItem } from "@/types/database";
import { diffDias, diaDaSemana, somarDias } from "@/lib/site/data";
import { minutosDoItem } from "@/lib/trilha/progresso";

// ============================================================================
// AJUSTE DO CRONOGRAMA AO TEMPO REAL DO ALUNO (Plano Voo Guiado)
//
// O cronograma (`trilha_dias`) é uma sequência linear única, compartilhada
// por todos: dia 1, dia 2, … dia 40. Para o Plano Decolando isso está certo
// e não muda — são 40 dias fixos, e é o que o plano promete.
//
// O Voo Guiado promete outra coisa. No briefing o aluno informa quando
// começa, quando é a prova, quantas horas por dia estuda e em quais dias da
// semana. Um aluno que começa em 1º de setembro com prova em 20 de setembro
// tem ~20 dias, não 40 — e recebia a mesma trilha de 40 dias, como se fosse
// do Decolando. Na prática, metade do conteúdo caía depois da prova.
//
// Aqui o cronograma-base é PROJETADO na janela real do aluno. Nada é
// descartado: os dias são agrupados até caberem, respeitando a carga horária
// diária informada. Se a janela for maior que o cronograma, nada muda — não
// faz sentido esticar conteúdo que não existe.
//
// Isto é uma projeção de leitura: `trilha_dias` continua intacta no banco,
// então o mesmo cronograma serve os dois planos sem uma cópia por aluno.
// ============================================================================

/** Sigla usada em `aluno_briefing.dias_estuda` (seg, ter, qua…). */
const MAPA_DIA = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;

export interface JanelaDoAluno {
  /** Quantos dias de estudo o aluno realmente tem até a prova. */
  diasDeEstudo: number;
  /** Teto de minutos por dia vindo do briefing. */
  minutosPorDia: number;
}

/**
 * Quantos dias de estudo existem entre hoje (ou o início informado) e a
 * prova, contando apenas os dias da semana que o aluno marcou.
 *
 * Devolve null quando falta informação para decidir — sem data de prova não
 * há janela, e nesse caso o cronograma segue como está em vez de ser
 * comprimido com base num palpite.
 */
export function calcularJanela(
  briefing: {
    data_prova?: string | null;
    inicio_estudos?: string | null;
    dias_estuda?: string[] | null;
    horas_por_dia_semana?: number | string | null;
  } | null,
  hojeStr: string
): JanelaDoAluno | null {
  const dataProva = briefing?.data_prova;
  if (!dataProva) return null;

  // O começo é o mais tardio entre "hoje" e o início informado: um aluno que
  // já está em curso não recupera dias que ficaram para trás.
  const inicio = briefing?.inicio_estudos && briefing.inicio_estudos > hojeStr ? briefing.inicio_estudos : hojeStr;
  const totalDias = diffDias(inicio, dataProva);
  if (totalDias <= 0) return null;

  const diasMarcados = new Set((briefing?.dias_estuda ?? []).map((d) => d.toLowerCase()));

  let diasDeEstudo = 0;
  for (let i = 0; i < totalDias; i++) {
    const data = somarDias(inicio, i);
    // Sem dias marcados no briefing, todo dia conta — é o comportamento
    // menos surpreendente para quem não respondeu essa pergunta.
    if (diasMarcados.size === 0 || diasMarcados.has(MAPA_DIA[diaDaSemana(data)])) diasDeEstudo++;
  }
  if (diasDeEstudo <= 0) return null;

  const horas = Number(briefing?.horas_por_dia_semana ?? 2);
  const minutosPorDia = Math.max(30, Math.round((Number.isFinite(horas) && horas > 0 ? horas : 2) * 60));

  return { diasDeEstudo, minutosPorDia };
}

/**
 * Comprime o cronograma para caber em `janela.diasDeEstudo` dias.
 *
 * Agrupa dias consecutivos preservando a ordem e TODO o conteúdo. O limite
 * diário do briefing é respeitado sempre que possível; quando um único dia
 * original já ultrapassa esse limite, ele é mantido inteiro em vez de ser
 * partido — perder metade de um dia temático seria pior do que estourar o
 * tempo previsto, e o aluno vê a carga real na tela.
 *
 * Devolve os dias renumerados de 1 a N. Se o cronograma já cabe na janela,
 * devolve a lista original sem tocar em nada.
 */
export function compactarCronograma(dias: TrilhaDia[], janela: JanelaDoAluno): TrilhaDia[] {
  const ordenados = [...dias].sort((a, b) => a.dia_numero - b.dia_numero);
  if (ordenados.length === 0 || ordenados.length <= janela.diasDeEstudo) return ordenados;

  // Quantos dias originais, em média, precisam caber em cada dia novo.
  const fator = Math.ceil(ordenados.length / janela.diasDeEstudo);

  const compactados: TrilhaDia[] = [];
  let atual: TrilhaItem[] = [];
  let titulos: string[] = [];
  let minutos = 0;
  let origemInicio = 0;
  let agrupados = 0;

  const fechar = () => {
    if (atual.length === 0 && titulos.length === 0) return;
    const numero = compactados.length + 1;
    compactados.push({
      ...ordenados[Math.max(0, origemInicio)],
      dia_numero: numero,
      // O título diz de onde o dia veio, para o aluno reconhecer o conteúdo
      // e o suporte conseguir rastrear o agrupamento.
      titulo: titulos.length === 1 ? titulos[0] : titulos.join(" + "),
      itens: atual
    } as TrilhaDia);
    atual = [];
    titulos = [];
    minutos = 0;
    agrupados = 0;
  };

  ordenados.forEach((dia, indice) => {
    const itensDoDia = dia.itens ?? [];
    const minutosDoDia = itensDoDia.reduce((s, it) => s + minutosDoItem(it), 0);

    const estouraTempo = minutos > 0 && minutos + minutosDoDia > janela.minutosPorDia;
    const atingiuFator = agrupados >= fator;
    if (estouraTempo || atingiuFator) fechar();

    if (atual.length === 0 && titulos.length === 0) origemInicio = indice;
    atual = atual.concat(itensDoDia);
    if (dia.titulo) titulos.push(dia.titulo);
    minutos += minutosDoDia;
    agrupados++;
  });
  fechar();

  return compactados;
}

/**
 * Aplica o ajuste completo: calcula a janela e comprime, quando fizer
 * sentido. Devolve os dias inalterados para quem não é do Voo Guiado, para
 * quem não tem briefing, ou para quem tem tempo de sobra.
 */
export function ajustarCronogramaAoAluno(
  dias: TrilhaDia[],
  opcoes: {
    temCopiloto: boolean;
    briefing: Parameters<typeof calcularJanela>[0];
    hojeStr: string;
  }
): { dias: TrilhaDia[]; compactado: boolean; janela: JanelaDoAluno | null } {
  // Plano Decolando não é tocado: 40 dias fixos, como o plano promete.
  if (!opcoes.temCopiloto) return { dias, compactado: false, janela: null };

  const janela = calcularJanela(opcoes.briefing, opcoes.hojeStr);
  if (!janela) return { dias, compactado: false, janela: null };

  const ajustados = compactarCronograma(dias, janela);
  return { dias: ajustados, compactado: ajustados.length !== dias.length, janela };
}
