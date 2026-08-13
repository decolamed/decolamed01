// ============================================================================
// AGENDA DO ALUNO — o orçamento diário de estudo, em um lugar só
//
// O Copiloto criava missão em cinco lugares diferentes (cenário 1, cenário 2,
// reagendamento de pendências e duas ações de check-in), e cada um refazia a
// conta do "quanto ainda cabe hoje" à sua maneira. Três consequências reais,
// todas violando o limite que o aluno declarou no briefing:
//
//   1. quase todos somavam apenas `aluno_missoes` e ignoravam o conteúdo do
//      CRONOGRAMA daquele dia. Um dia com 3h de rota e 2h de missões passava
//      no teste `2h <= 3h` — o aluno recebia 5h de tarefa;
//   2. as missões criadas na MESMA execução não entravam na conta seguinte,
//      então dois trechos de código podiam encher o mesmo dia sem se ver;
//   3. as ações de check-in agendavam em qualquer data, inclusive no dia da
//      prova e na véspera reservada para descanso.
//
// Agora existe uma agenda: ela sabe o que já está ocupado (rota + missões),
// quais datas são intocáveis, e reserva o tempo a cada missão criada. Nenhum
// ponto do motor decide sozinho — todos perguntam `cabe()` e chamam
// `reservar()`. É a implementação da regra 8 do pedido: nenhuma adaptação
// automática pode ultrapassar uma restrição explícita do aluno.
// ============================================================================

export interface AgendaDoAluno {
  /** Teto diário em minutos, vindo de `horas_por_dia_semana` do briefing. */
  readonly minutosPorDia: number;
  /** Minutos ainda livres na data (0 em datas bloqueadas). */
  livreEm(data: string): number;
  /** Minutos já ocupados na data (rota + missões + reservas desta execução). */
  ocupadoEm(data: string): number;
  /** Cabe uma atividade de `minutos` nesta data? */
  cabe(data: string, minutos: number): boolean;
  /** Marca o tempo como usado. Chamar SEMPRE que uma missão for criada. */
  reservar(data: string, minutos: number): void;
  /** Devolve tempo ao dia (missão removida/substituída). */
  liberar(data: string, minutos: number): void;
  /** Data em que nada pode ser agendado (dia da prova, véspera de descanso). */
  bloqueada(data: string): boolean;
  /**
   * Primeira data da lista onde a atividade cabe, ou null.
   * É o que transforma "não cabe hoje" em "vai para outro dia" em vez de
   * "estoura o dia" ou "desiste da atividade".
   */
  primeiraDataComEspaco(datas: string[], minutos: number): string | null;
}

export function montarAgenda(p: {
  minutosPorDia: number;
  /** Minutos que o cronograma/rota já ocupa em cada data. */
  cargaDoCronograma: Map<string, number>;
  /** Missões já agendadas (do admin ou de execuções anteriores). */
  missoes: { data: string; minutos: number }[];
  /** Datas intocáveis: dia da prova e véspera reservada. */
  bloqueadas: Set<string>;
}): AgendaDoAluno {
  // Teto mínimo defensivo: um briefing com 0 horas travaria o Copiloto
  // inteiro, e 30 min é o menor bloco que a plataforma agenda.
  const minutosPorDia = Math.max(30, Math.round(p.minutosPorDia));

  const ocupado = new Map<string, number>();
  const somar = (data: string, minutos: number) => {
    ocupado.set(data, Math.max(0, (ocupado.get(data) ?? 0) + minutos));
  };

  p.cargaDoCronograma.forEach((minutos, data) => somar(data, minutos));
  p.missoes.forEach((m) => somar(m.data, m.minutos));

  const bloqueada = (data: string) => p.bloqueadas.has(data);
  const ocupadoEm = (data: string) => ocupado.get(data) ?? 0;
  const livreEm = (data: string) => (bloqueada(data) ? 0 : Math.max(0, minutosPorDia - ocupadoEm(data)));

  return {
    minutosPorDia,
    livreEm,
    ocupadoEm,
    bloqueada,
    cabe: (data, minutos) => !bloqueada(data) && ocupadoEm(data) + minutos <= minutosPorDia,
    reservar: (data, minutos) => somar(data, minutos),
    liberar: (data, minutos) => somar(data, -minutos),
    primeiraDataComEspaco: (datas, minutos) =>
      datas.find((d) => !bloqueada(d) && ocupadoEm(d) + minutos <= minutosPorDia) ?? null
  };
}
