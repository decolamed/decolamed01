import { hojeISO, diffDias } from "@/lib/site/data";

// O cronograma (trilha_dias) é uma sequência linear de dias — dia_numero é
// relativo ao dia em que o acesso do aluno foi liberado (matriculas.
// acesso_liberado_em), não a um dia fixo do calendário: cada aluno começa
// no seu próprio dia 1. Sem limite superior — o admin controla até onde a
// sequência vai simplesmente parando de cadastrar dias; um dia_numero sem
// linha em trilha_dias é tratado como "nenhuma missão definida" por quem
// consome esta função (ver /aluno/cronograma e aluno/page.tsx).
export function calcularDiaTrilha(acessoLiberadoEm: string): number {
  // O "hoje" vem do fuso da plataforma, não de UTC: com a conta em UTC, das
  // 21h à meia-noite o aluno era jogado para o dia seguinte do cronograma —
  // as missões da noite sumiam justamente na hora de estudar. Ver
  // lib/site/data.ts.
  return Math.max(1, diffDias(acessoLiberadoEm.slice(0, 10), hojeISO()) + 1);
}
