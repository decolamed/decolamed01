// ============================================================================
// NOTA PONDERADA (Alteração 7.6)
//
// Um simulado pode ser corrigido de duas formas:
//
//   percentual — cada questão vale igual. Simples, e continua sendo o padrão.
//   ponderado  — cada disciplina vale conforme o peso do edital. Acertar
//                Biologia num vestibular de Medicina não vale o mesmo que
//                acertar Inglês, e a nota precisa refletir isso.
//
// Puro de propósito: nenhuma chamada ao Supabase, para o cálculo poder ser
// testado com números conhecidos. Os pesos vêm de `materias_peso`, nunca
// escritos no código — o edital muda e o admin precisa acompanhar sem deploy.
// ============================================================================

export interface PesoMateria {
  materia: string;
  peso: number;
  /** Pontuação máxima fixa da disciplina, quando o edital define uma. */
  pontuacaoMaxima?: number | null;
}

export interface DesempenhoMateria {
  materia: string;
  acertos: number;
  total: number;
}

export interface ResultadoPonderado {
  /** Nota final na escala do simulado (ex.: 720 de 1000). */
  notaPonderada: number;
  valorTotal: number;
  /** Percentual bruto de acertos — informação complementar. */
  percentualAcertos: number;
  acertos: number;
  total: number;
  /** Quanto cada disciplina valia e quanto o aluno tirou nela. */
  porMateria: {
    materia: string;
    acertos: number;
    total: number;
    valorDaMateria: number;
    pontosObtidos: number;
  }[];
}

/**
 * Distribui `valorTotal` entre as disciplinas presentes na prova e devolve
 * quanto o aluno somou.
 *
 * A distribuição é proporcional a `peso × quantidade de questões da matéria
 * no simulado` — e não só ao peso. Duas disciplinas de peso igual, uma com 20
 * questões e outra com 2, não podem valer a mesma coisa; senão cada questão
 * da segunda valeria 10× mais que a da primeira, sem que nada no edital diga
 * isso.
 *
 * Quando a matéria tem `pontuacaoMaxima` definida, esse valor manda: é o
 * edital dizendo explicitamente quanto a disciplina vale, e o rateio
 * proporcional não deve sobrescrever isso.
 */
export function calcularNotaPonderada(
  desempenho: DesempenhoMateria[],
  pesos: PesoMateria[],
  valorTotal: number
): ResultadoPonderado {
  const mapaPeso = new Map(pesos.map((p) => [p.materia, p]));
  const acertos = desempenho.reduce((s, d) => s + d.acertos, 0);
  const total = desempenho.reduce((s, d) => s + d.total, 0);
  const percentualAcertos = total > 0 ? (acertos / total) * 100 : 0;

  if (total === 0) {
    return { notaPonderada: 0, valorTotal, percentualAcertos: 0, acertos: 0, total: 0, porMateria: [] };
  }

  // 1. Matérias com pontuação fixa saem do rateio e consomem parte do total.
  const comValorFixo = desempenho.filter((d) => {
    const p = mapaPeso.get(d.materia);
    return p?.pontuacaoMaxima != null && p.pontuacaoMaxima > 0;
  });
  const valorFixoUsado = comValorFixo.reduce(
    (s, d) => s + (mapaPeso.get(d.materia)!.pontuacaoMaxima as number),
    0
  );

  // 2. O que sobra é dividido entre as demais, proporcional a peso × questões.
  const paraRatear = desempenho.filter((d) => !comValorFixo.includes(d));
  const restante = Math.max(0, valorTotal - valorFixoUsado);
  const somaPonderada = paraRatear.reduce((s, d) => {
    // Matéria sem peso cadastrado entra com 1 em vez de sumir da conta: zerá-la
    // faria as questões dela não valerem nada, e o aluno perderia pontos por
    // uma lacuna de cadastro do admin.
    const peso = mapaPeso.get(d.materia)?.peso ?? 1;
    return s + peso * d.total;
  }, 0);

  const porMateria = desempenho.map((d) => {
    const cfg = mapaPeso.get(d.materia);
    const fixo = cfg?.pontuacaoMaxima != null && cfg.pontuacaoMaxima > 0 ? cfg.pontuacaoMaxima : null;
    const valorDaMateria =
      fixo != null
        ? fixo
        : somaPonderada > 0
        ? ((cfg?.peso ?? 1) * d.total * restante) / somaPonderada
        : 0;
    const pontosObtidos = d.total > 0 ? (d.acertos / d.total) * valorDaMateria : 0;
    return {
      materia: d.materia,
      acertos: d.acertos,
      total: d.total,
      valorDaMateria: arredondar(valorDaMateria),
      pontosObtidos: arredondar(pontosObtidos)
    };
  });

  const notaPonderada = arredondar(porMateria.reduce((s, m) => s + m.pontosObtidos, 0));
  return { notaPonderada, valorTotal, percentualAcertos: arredondar(percentualAcertos), acertos, total, porMateria };
}

function arredondar(n: number): number {
  return Math.round(n * 100) / 100;
}

/** "720 / 1000" — o formato que o aluno lê no resultado. */
export function formatarNota(nota: number, valorTotal: number): string {
  const inteiro = Number.isInteger(nota) ? String(nota) : nota.toFixed(1);
  const totalInt = Number.isInteger(valorTotal) ? String(valorTotal) : valorTotal.toFixed(1);
  return `${inteiro} / ${totalInt}`;
}
