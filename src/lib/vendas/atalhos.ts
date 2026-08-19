import { hojeISO, somarDias } from "@/lib/site/data";

// Os períodos que o admin pede na prática: "quanto entrou este mês", "e no
// mês passado", "e nos últimos 30 dias". Digitar as duas datas à mão para
// isso toda vez convida ao erro de escolher o intervalo errado e concluir a
// coisa errada sobre o faturamento.
//
// Puro de propósito: recebe o "hoje" em vez de olhar o relógio, então o teste
// fixa uma data e o resultado não muda amanhã.

export interface AtalhoDePeriodo {
  rotulo: string;
  de: string;
  ate: string;
}

/** Primeiro dia do mês de uma data YYYY-MM-DD. */
function primeiroDiaDoMes(dataIso: string): string {
  return `${dataIso.slice(0, 7)}-01`;
}

export function atalhosDePeriodo(hoje: string = hojeISO()): AtalhoDePeriodo[] {
  const inicioDesteMes = primeiroDiaDoMes(hoje);
  // O último dia do mês passado é a véspera do primeiro dia deste — não
  // precisa saber quantos dias tem cada mês nem lembrar de ano bissexto.
  const fimDoMesPassado = somarDias(inicioDesteMes, -1);

  return [
    { rotulo: "Últimos 7 dias", de: somarDias(hoje, -6), ate: hoje },
    { rotulo: "Últimos 30 dias", de: somarDias(hoje, -29), ate: hoje },
    { rotulo: "Este mês", de: inicioDesteMes, ate: hoje },
    { rotulo: "Mês passado", de: primeiroDiaDoMes(fimDoMesPassado), ate: fimDoMesPassado }
  ];
}
