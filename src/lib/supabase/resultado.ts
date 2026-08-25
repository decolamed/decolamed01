// ============================================================================
// UMA CONSULTA QUE FALHOU NÃO É UMA CONSULTA VAZIA
//
// Este arquivo existe por causa de três defeitos com a mesma forma:
//
//   1. /admin/matriculas dizia "Nenhuma matrícula ainda" com matrículas
//      ativas no banco;
//   2. /admin/usuarios mostrou a lista vazia com centenas de contas;
//   3. a tela inicial do aluno trocou a missão do dia pela do plano errado.
//
// Nenhum dos três foi causado por uma consulta mal escrita. Os três foram
// causados por `const { data } = await supabase...` seguido de `data ?? []`:
// o `error` era descartado, e a falha chegava à tela vestida de "não há
// nada". Uma tela que parece funcionar e está errada é pior do que uma que
// avisa que quebrou, porque ninguém vai investigar o que não parece quebrado.
//
// O antídoto não é escrever mais `if (error)` — é tornar o caminho barulhento
// mais curto do que o silencioso. É isso que as funções abaixo fazem.
//
// COMO ESCOLHER
// -------------
// `listaOuVazio` / `linhaOuNula`  — a tela sobrevive sem o dado, mas a falha
//                                   precisa aparecer no log com nome e motivo.
// `falhaAoCarregar`               — a tela NÃO sobrevive: o admin precisa ler
//                                   "não foi possível carregar", não uma
//                                   tabela vazia.
//
// O que NÃO fica aqui: decisão de acesso e de dinheiro. Nesses lugares o
// tratamento é caso a caso — ver `verificarAcessoMatricula` (falha fecha o
// acesso) e `confirmarPagamento` (falha pede retentativa em vez de abandonar
// a matrícula de quem pagou).
// ============================================================================

/** O formato que toda consulta do supabase-js devolve. */
export interface ResultadoDaConsulta<T> {
  data: T | null;
  error: { message: string } | null;
}

/**
 * As linhas, com a falha registrada em vez de engolida.
 *
 * Continua devolvendo lista vazia — a diferença é que agora existe um log
 * dizendo QUAL consulta falhou e por quê. `oQue` vai no log, então vale a
 * pena ser específico: "usuários do painel" ajuda, "dados" não.
 */
export function listaOuVazio<T>(resultado: ResultadoDaConsulta<T[]>, oQue: string): T[] {
  if (resultado.error) {
    console.error(`Consulta falhou (${oQue}): ${resultado.error.message}`);
    return [];
  }
  return resultado.data ?? [];
}

/** A linha única, com a falha registrada em vez de engolida. */
export function linhaOuNula<T>(resultado: ResultadoDaConsulta<T>, oQue: string): T | null {
  if (resultado.error) {
    console.error(`Consulta falhou (${oQue}): ${resultado.error.message}`);
    return null;
  }
  return resultado.data ?? null;
}

/**
 * A mensagem para a TELA quando alguma das consultas da página falhou.
 *
 * Recebe as consultas nomeadas — `{ usuários: r1, planos: r2 }` — e devolve
 * uma frase pronta, ou null quando está tudo certo. Serve para o
 * `<AdminAlert erro={...} />` no topo das páginas do painel.
 *
 * Reporta TODAS as que falharam, não só a primeira: quando a causa é comum
 * (uma tabela renomeada, uma chave estrangeira nova), ver as três juntas é o
 * que denuncia a causa comum.
 *
 * A mensagem técnica entra de propósito. Quem lê esta tela é o administrador
 * da plataforma, e "Could not embed because more than one relationship was
 * found" é exatamente a frase que teria economizado a investigação das três
 * vezes em que isto aconteceu.
 */
export function falhaAoCarregar(consultas: Record<string, { error: { message: string } | null }>): string | null {
  const falhas = Object.entries(consultas)
    .filter(([, r]) => r?.error)
    .map(([nome, r]) => `${nome} (${r.error!.message})`);

  if (falhas.length === 0) return null;
  return `Não foi possível carregar: ${falhas.join("; ")}. A tela abaixo está incompleta — não trate como "não há registros".`;
}
