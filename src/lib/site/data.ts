// "Hoje" na plataforma — sempre no fuso do vestibular, nunca em UTC.
//
// O bug que motivou este módulo: todo lugar derivava a data de hoje com
// `new Date().toISOString().slice(0, 10)`, que devolve a data em **UTC**.
// O Brasil é UTC−3, então das 21h à meia-noite (horário de Brasília) o UTC
// já virou o dia seguinte. Na prática, todas as noites, por três horas:
//
//   - calcularDiaTrilha() adiantava o cronograma em um dia. Quem estava no
//     dia 8 às 21h via o dia 9: as missões de hoje sumiam e as de amanhã
//     apareciam, mesmo sem ter terminado o dia.
//   - missoesHoje() filtra por `data === hojeStr`, então as missões do dia
//     desapareciam da tela junto.
//   - o Copiloto (motor.ts) gerava e datava missões pelo dia errado.
//   - a sequência de dias estudados quebrava para quem estudou à noite.
//
// Justamente o horário em que o aluno estuda. O servidor da Vercel roda em
// UTC, então isso vale em produção independentemente da máquina.
//
// O fuso é configurável por variável de ambiente porque a plataforma pode
// atender outro processo seletivo — mas o padrão cobre o Brasil inteiro
// (todos os estados usam o mesmo horário desde o fim do horário de verão;
// para Fernando de Noronha ou Acre, basta definir TZ_PLATAFORMA).
export const FUSO_PLATAFORMA = process.env.TZ_PLATAFORMA || "America/Sao_Paulo";

// "en-CA" é o truque padrão para obter YYYY-MM-DD do Intl sem montar a
// string à mão a partir das partes.
const FORMATADOR = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_PLATAFORMA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const RELOGIO_COMPLETO = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_PLATAFORMA,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

/** O relógio de parede do fuso da plataforma, reinterpretado como se fosse UTC. */
function relogioComoUTC(instante: Date): number {
  const p: Record<string, string> = {};
  for (const parte of RELOGIO_COMPLETO.formatToParts(instante)) p[parte.type] = parte.value;
  // Meia-noite sai como "24" em alguns motores com hour12: false.
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
}

/** Meio-dia: a hora segura para representar um dia de calendário sem hora. */
export const MEIO_DIA = "12:00:00.000";

/** O último instante de um dia — para prazos que valem até o fim do dia. */
export const FIM_DO_DIA = "23:59:59.999";

/**
 * O instante UTC de uma hora de parede no fuso da plataforma.
 *
 * `new Date("2026-08-18")` devolve meia-noite UTC — que em Brasília ainda é
 * dia 17, às 21h. Quem grava um dia escolhido num <input type="date"> precisa
 * disto, senão o dia gravado não é o dia que a pessoa escolheu. E quem monta
 * os limites de um filtro por período também: `.setHours()` mexe no fuso da
 * MÁQUINA, que na Vercel é UTC.
 */
export function instanteNoFuso(dataIso: string, hora: string): Date {
  const chute = new Date(`${dataIso}T${hora}Z`);
  // O deslocamento sai de um instante sem milissegundos: o Intl não os
  // devolve, então medi-lo com o .999 do fim do dia embutia esses 999 ms no
  // próprio deslocamento e empurrava o limite para 03:00:00.998.
  const cheio = new Date(Math.floor(chute.getTime() / 1000) * 1000);
  const deslocamento = cheio.getTime() - relogioComoUTC(cheio);
  return new Date(chute.getTime() + deslocamento);
}

// Data (YYYY-MM-DD) de um instante, no fuso da plataforma.
export function dataISO(quando: Date = new Date()): string {
  return FORMATADOR.format(quando);
}

// Data de hoje no fuso da plataforma.
export function hojeISO(): string {
  return dataISO();
}

// Soma (ou subtrai) dias de uma data YYYY-MM-DD.
//
// A conta é feita ao meio-dia UTC de propósito: somar 86400000 ms a partir
// da meia-noite atravessa mudanças de horário de verão e pode cair no dia
// anterior. Ao meio-dia sobra folga de 12h para qualquer lado.
export function somarDias(dataIso: string, dias: number): string {
  const base = new Date(dataIso + "T12:00:00Z");
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

// Diferença em dias inteiros entre duas datas YYYY-MM-DD (b − a).
export function diffDias(a: string, b: string): number {
  const inicio = new Date(a + "T12:00:00Z").getTime();
  const fim = new Date(b + "T12:00:00Z").getTime();
  return Math.round((fim - inicio) / 86400000);
}

// Dia da semana (0=domingo) de uma data YYYY-MM-DD.
//
// Calculado ao meio-dia UTC porque a data já é um dia de calendário, sem
// hora: usar `new Date(iso).getDay()` levaria o fuso da máquina junto e, num
// servidor em UTC, "sábado" às 21h de sexta viraria sábado cedo demais.
export function diaDaSemana(dataIso: string): number {
  return new Date(dataIso + "T12:00:00Z").getUTCDay();
}

const NOMES_DIA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
];

/** "Segunda-feira" para uma data YYYY-MM-DD. */
export function nomeDoDiaDaSemana(dataIso: string): string {
  return NOMES_DIA[diaDaSemana(dataIso)];
}

/** "04/08/2026" para uma data YYYY-MM-DD. */
export function dataBR(dataIso: string): string {
  const [a, m, d] = dataIso.split("-");
  return `${d}/${m}/${a}`;
}

/**
 * Data de calendário de um dia do cronograma.
 *
 * `trilha_dias.dia_numero` é relativo ao início do aluno, não a um dia fixo
 * — por isso a tela só conseguia dizer "Dia 1", "Dia 2". Sabendo qual
 * dia_numero é hoje, o resto da régua sai por diferença.
 */
export function dataDoDiaTrilha(diaNumero: number, diaNumeroHoje: number, hoje: string = hojeISO()): string {
  return somarDias(hoje, diaNumero - diaNumeroHoje);
}
