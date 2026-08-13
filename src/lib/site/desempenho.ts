import { materiaCanonica } from "@/lib/site/materia-canonica";

// ============================================================================
// DESEMPENHO DO ALUNO — uma conta só, para o aluno e para o admin
//
// A tela de Desempenho do aluno calculava tudo inline; o Raio-X calculava de
// novo, à sua maneira; e o painel administrativo não calculava nada. Somar o
// admin como uma quarta implementação garantiria o que ninguém quer: o aluno
// vendo 78% e o admin vendo 74% para a mesma pessoa, sem ninguém saber qual
// está certo.
//
// Aqui as contas ficam num lugar só, como funções puras sobre as linhas que
// já existem no banco:
//
//   respostas_aluno        → questões respondidas, acertos, erros
//   flashcard_revisoes     → cards revisados e taxa de lembrança
//   simulado_tentativas    → notas dos simulados
//
// Nenhuma métrica nova, nenhuma tabela nova. Quem chama decide o que mostrar.
// ============================================================================

export interface RespostaBruta {
  correta: boolean;
  created_at?: string | null;
  questoes?: { materia?: string | null; assunto?: string | null } | null;
}

export interface RevisaoBruta {
  lembrou: boolean;
  created_at?: string | null;
}

export interface TentativaBruta {
  nota: number;
  acertos?: number | null;
  total?: number | null;
  created_at?: string | null;
}

/** Percentual inteiro, com a divisão por zero resolvida de uma vez só. */
export function percentual(parte: number, total: number): number {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

export interface ResumoDesempenho {
  questoes: number;
  acertos: number;
  erros: number;
  precisao: number;
  flashcards: number;
  lembrados: number;
  precisaoFlashcards: number;
  simulados: number;
  mediaSimulados: number;
  /** Data ISO da atividade mais recente em qualquer frente, ou null. */
  ultimaAtividade: string | null;
  semDados: boolean;
}

export function resumoDeDesempenho(
  respostas: RespostaBruta[],
  revisoes: RevisaoBruta[],
  tentativas: TentativaBruta[]
): ResumoDesempenho {
  const acertos = respostas.filter((r) => r.correta).length;
  const lembrados = revisoes.filter((r) => r.lembrou).length;
  const somaNotas = tentativas.reduce((s, t) => s + (Number(t.nota) || 0), 0);

  const datas = [...respostas, ...revisoes, ...tentativas]
    .map((x) => (x as { created_at?: string | null }).created_at)
    .filter((d): d is string => !!d)
    .sort();

  return {
    questoes: respostas.length,
    acertos,
    erros: respostas.length - acertos,
    precisao: percentual(acertos, respostas.length),
    flashcards: revisoes.length,
    lembrados,
    precisaoFlashcards: percentual(lembrados, revisoes.length),
    simulados: tentativas.length,
    mediaSimulados: tentativas.length > 0 ? Math.round(somaNotas / tentativas.length) : 0,
    ultimaAtividade: datas.length > 0 ? datas[datas.length - 1] : null,
    semDados: respostas.length === 0 && revisoes.length === 0 && tentativas.length === 0
  };
}

export interface DesempenhoAgrupado {
  chave: string;
  materia: string;
  /** Preenchido só no agrupamento por assunto. */
  assunto?: string;
  total: number;
  acertos: number;
  erros: number;
  aproveitamento: number;
}

/**
 * Desempenho por matéria, do mais praticado ao menos praticado.
 *
 * A matéria passa por `materiaCanonica`: sem isso, respostas gravadas como
 * "Português" e como "Linguagens" apareceriam como duas linhas diferentes na
 * mesma tabela, cada uma com metade dos números do aluno.
 */
export function desempenhoPorMateria(respostas: RespostaBruta[]): DesempenhoAgrupado[] {
  const mapa = new Map<string, DesempenhoAgrupado>();

  respostas.forEach((r) => {
    const materia = materiaCanonica(r.questoes?.materia ?? "") || "Sem matéria";
    const atual = mapa.get(materia) ?? { chave: materia, materia, total: 0, acertos: 0, erros: 0, aproveitamento: 0 };
    atual.total += 1;
    if (r.correta) atual.acertos += 1;
    else atual.erros += 1;
    mapa.set(materia, atual);
  });

  return [...mapa.values()]
    .map((d) => ({ ...d, aproveitamento: percentual(d.acertos, d.total) }))
    .sort((a, b) => b.total - a.total || a.materia.localeCompare(b.materia, "pt-BR"));
}

/**
 * Desempenho por conteúdo (matéria + assunto), do pior aproveitamento ao
 * melhor — é a ordem que responde "o que precisa de atenção?".
 *
 * Respostas sem assunto ficam de fora: "Sem assunto" com 40 questões viraria
 * a maior linha da tabela e não diria nada sobre conteúdo nenhum.
 */
export function desempenhoPorAssunto(respostas: RespostaBruta[], minimoDeQuestoes = 1): DesempenhoAgrupado[] {
  const mapa = new Map<string, DesempenhoAgrupado>();

  respostas.forEach((r) => {
    const materia = materiaCanonica(r.questoes?.materia ?? "");
    const assunto = (r.questoes?.assunto ?? "").trim();
    if (!materia || !assunto) return;
    const chave = `${materia}||${assunto}`;
    const atual = mapa.get(chave) ?? { chave, materia, assunto, total: 0, acertos: 0, erros: 0, aproveitamento: 0 };
    atual.total += 1;
    if (r.correta) atual.acertos += 1;
    else atual.erros += 1;
    mapa.set(chave, atual);
  });

  return [...mapa.values()]
    .filter((d) => d.total >= minimoDeQuestoes)
    .map((d) => ({ ...d, aproveitamento: percentual(d.acertos, d.total) }))
    .sort((a, b) => a.aproveitamento - b.aproveitamento || b.total - a.total);
}

export interface PontoDaEvolucao {
  /** Primeiro dia da semana (segunda), em ISO. */
  semana: string;
  total: number;
  acertos: number;
  aproveitamento: number;
}

/**
 * Evolução semanal do aproveitamento.
 *
 * Semanas sem resposta nenhuma não entram: uma semana parada não é 0% de
 * acerto, é ausência de dado — e desenhar o zero afirmaria que o aluno errou
 * tudo numa semana em que ele não respondeu nada.
 */
export function evolucaoSemanal(respostas: RespostaBruta[], semanas = 8): PontoDaEvolucao[] {
  const mapa = new Map<string, { total: number; acertos: number }>();

  respostas.forEach((r) => {
    if (!r.created_at) return;
    const dia = new Date(r.created_at);
    if (Number.isNaN(dia.getTime())) return;
    // Segunda-feira da semana daquela resposta, em UTC.
    const diaDaSemana = (dia.getUTCDay() + 6) % 7;
    const segunda = new Date(Date.UTC(dia.getUTCFullYear(), dia.getUTCMonth(), dia.getUTCDate() - diaDaSemana));
    const chave = segunda.toISOString().slice(0, 10);
    const atual = mapa.get(chave) ?? { total: 0, acertos: 0 };
    atual.total += 1;
    if (r.correta) atual.acertos += 1;
    mapa.set(chave, atual);
  });

  return [...mapa.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-Math.max(1, semanas))
    .map(([semana, d]) => ({
      semana,
      total: d.total,
      acertos: d.acertos,
      aproveitamento: percentual(d.acertos, d.total)
    }));
}

/**
 * Está evoluindo? Compara o aproveitamento da última semana com a média das
 * anteriores. Devolve null quando não há histórico suficiente para afirmar —
 * duas semanas de dados é o mínimo para a palavra "evolução" significar algo.
 */
export function tendencia(evolucao: PontoDaEvolucao[]): { variacao: number; direcao: "subindo" | "caindo" | "estavel" } | null {
  if (evolucao.length < 2) return null;
  const ultima = evolucao[evolucao.length - 1];
  const anteriores = evolucao.slice(0, -1);
  const media = Math.round(anteriores.reduce((s, p) => s + p.aproveitamento, 0) / anteriores.length);
  const variacao = ultima.aproveitamento - media;
  return { variacao, direcao: variacao > 4 ? "subindo" : variacao < -4 ? "caindo" : "estavel" };
}

/** Dias inteiros desde a última atividade. null quando nunca houve nenhuma. */
export function diasSemEstudar(ultimaAtividade: string | null, hojeISO: string): number | null {
  if (!ultimaAtividade) return null;
  const de = new Date(ultimaAtividade.slice(0, 10) + "T00:00:00Z").getTime();
  const ate = new Date(hojeISO.slice(0, 10) + "T00:00:00Z").getTime();
  if (Number.isNaN(de) || Number.isNaN(ate)) return null;
  return Math.max(0, Math.round((ate - de) / 86400000));
}
