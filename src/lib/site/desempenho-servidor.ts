import {
  desempenhoPorAssunto,
  desempenhoPorMateria,
  evolucaoSemanal,
  resumoDeDesempenho,
  tendencia,
  type DesempenhoAgrupado,
  type PontoDaEvolucao,
  type RespostaBruta,
  type ResumoDesempenho,
  type RevisaoBruta,
  type TentativaBruta
} from "@/lib/site/desempenho";

// ============================================================================
// A LEITURA do desempenho — as mesmas consultas para o aluno e para o admin
//
// Não basta as CONTAS serem compartilhadas: se cada tela buscar as linhas do
// seu jeito, elas divergem antes de chegar à conta. Um filtro a mais aqui,
// um `limit` esquecido ali, e o aluno vê 78% enquanto o admin vê 74%.
//
// Este é o ponto único de leitura. Recebe o cliente Supabase de quem chama —
// a tela do aluno usa o cliente da sessão dele (RLS restringe às próprias
// linhas), o painel usa o cliente de admin — e as duas leem exatamente as
// mesmas colunas, sem corte.
// ============================================================================

type ClienteSupabase = { from: (tabela: string) => any };

export interface DesempenhoCompleto {
  resumo: ResumoDesempenho;
  porMateria: DesempenhoAgrupado[];
  porAssunto: DesempenhoAgrupado[];
  evolucao: PontoDaEvolucao[];
  tendencia: ReturnType<typeof tendencia>;
  /** As tentativas cruas, para quem quiser listar simulado a simulado. */
  tentativas: (TentativaBruta & { simulados?: { titulo?: string | null } | null })[];
}

export async function carregarDesempenho(
  supabase: ClienteSupabase,
  alunoId: string
): Promise<DesempenhoCompleto> {
  const [{ data: respostas }, { data: revisoes }, { data: tentativas }] = await Promise.all([
    supabase
      .from("respostas_aluno")
      .select("correta, created_at, questoes(materia, assunto)")
      .eq("aluno_id", alunoId),
    supabase.from("flashcard_revisoes").select("lembrou, created_at").eq("aluno_id", alunoId),
    supabase
      .from("simulado_tentativas")
      .select("nota, acertos, total, created_at, simulados(titulo)")
      .eq("aluno_id", alunoId)
      .order("created_at", { ascending: false })
  ]);

  const listaRespostas = (respostas as RespostaBruta[]) ?? [];
  const listaRevisoes = (revisoes as RevisaoBruta[]) ?? [];
  const listaTentativas = (tentativas as TentativaBruta[]) ?? [];
  const evolucao = evolucaoSemanal(listaRespostas);

  return {
    resumo: resumoDeDesempenho(listaRespostas, listaRevisoes, listaTentativas),
    porMateria: desempenhoPorMateria(listaRespostas),
    // Um acerto isolado num assunto não é sinal de nada; dois já contam uma
    // história. É o corte que separa tendência de acaso na tabela.
    porAssunto: desempenhoPorAssunto(listaRespostas, 2),
    evolucao,
    tendencia: tendencia(evolucao),
    tentativas: listaTentativas
  };
}

/**
 * Resumo de desempenho de VÁRIOS alunos de uma vez, para a listagem.
 *
 * Uma consulta por aluno numa lista de N alunos são N idas ao banco por
 * carregamento de tela. Aqui as linhas vêm de uma vez e são agrupadas em
 * memória — pelas MESMAS funções do perfil individual, então o número da
 * lista e o número de dentro do perfil nunca podem divergir.
 *
 * Quando o volume crescer, o caminho é uma view agregada no banco; o que não
 * pode é uma segunda fórmula de aproveitamento escrita à mão aqui.
 */
export async function resumosDosAlunos(
  supabase: ClienteSupabase,
  alunoIds: string[]
): Promise<Map<string, ResumoDesempenho>> {
  const resumos = new Map<string, ResumoDesempenho>();
  if (alunoIds.length === 0) return resumos;

  const [{ data: respostas }, { data: revisoes }, { data: tentativas }] = await Promise.all([
    supabase.from("respostas_aluno").select("aluno_id, correta, created_at").in("aluno_id", alunoIds),
    supabase.from("flashcard_revisoes").select("aluno_id, lembrou, created_at").in("aluno_id", alunoIds),
    supabase.from("simulado_tentativas").select("aluno_id, nota, created_at").in("aluno_id", alunoIds)
  ]);

  const agrupar = <T extends { aluno_id: string }>(linhas: T[] | null) => {
    const mapa = new Map<string, T[]>();
    (linhas ?? []).forEach((l) => {
      const atual = mapa.get(l.aluno_id) ?? [];
      atual.push(l);
      mapa.set(l.aluno_id, atual);
    });
    return mapa;
  };

  const porAlunoRespostas = agrupar(respostas as (RespostaBruta & { aluno_id: string })[]);
  const porAlunoRevisoes = agrupar(revisoes as (RevisaoBruta & { aluno_id: string })[]);
  const porAlunoTentativas = agrupar(tentativas as (TentativaBruta & { aluno_id: string })[]);

  alunoIds.forEach((id) => {
    resumos.set(
      id,
      resumoDeDesempenho(
        porAlunoRespostas.get(id) ?? [],
        porAlunoRevisoes.get(id) ?? [],
        porAlunoTentativas.get(id) ?? []
      )
    );
  });

  return resumos;
}
