// O cronograma (trilha_dias) é uma sequência linear de dias — dia_numero é
// relativo ao dia em que o acesso do aluno foi liberado (matriculas.
// acesso_liberado_em), não a um dia fixo do calendário: cada aluno começa
// no seu próprio dia 1. Sem limite superior — o admin controla até onde a
// sequência vai simplesmente parando de cadastrar dias; um dia_numero sem
// linha em trilha_dias é tratado como "nenhuma missão definida" por quem
// consome esta função (ver /aluno/cronograma e aluno/page.tsx).
export function calcularDiaTrilha(acessoLiberadoEm: string): number {
  const inicio = new Date(acessoLiberadoEm.slice(0, 10) + "T00:00:00");
  const hoje = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");
  const diffDias = Math.floor((hoje.getTime() - inicio.getTime()) / 86400000);
  return Math.max(1, diffDias + 1);
}
