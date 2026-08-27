// ============================================================================
// EM QUAIS PLANOS UM CUPOM VALE
//
// Antes, todo cupom valia em qualquer plano. Agora o admin pode restringir —
// "LANÇAMENTO só no VOO GUIADO" — e a regra tem de ser a MESMA nos dois
// lugares que validam cupom: a prévia do formulário (/api/cupons/validar) e o
// fechamento da compra (/api/matricula). Duas implementações parecidas
// acabariam divergindo, e a divergência aqui é desconto concedido na tela e
// recusado na cobrança, ou pior, o contrário.
//
// A ausência de restrição é representada por lista vazia (ou nula). É o que
// mantém intacto o comportamento de todos os cupons que já existiam: quem não
// tem restrição vale em tudo, exatamente como antes.
// ============================================================================

/**
 * O cupom vale para este plano?
 *
 * `planosAplicaveis` vazio, nulo ou não-array significa "todos os planos".
 * Com a lista preenchida, só os planos listados passam.
 */
export function cupomValeNoPlano(planosAplicaveis: unknown, planoId: string | null | undefined): boolean {
  const lista = normalizarPlanos(planosAplicaveis);
  if (lista.length === 0) return true;

  // Cupom restrito e não sabemos o plano: recusa. Conceder o desconto sem
  // saber onde ele vai cair é o erro caro — o dinheiro já saiu.
  const plano = (planoId ?? "").trim();
  if (!plano) return false;

  return lista.includes(plano);
}

/**
 * A lista de planos, limpa do que vier do banco ou do formulário.
 *
 * O campo é `uuid[]` no Postgres, mas chega como array de strings, e o
 * formulário do painel manda o que o admin marcou — sem garantia de não vir
 * vazio, repetido ou com espaço em volta.
 */
export function normalizarPlanos(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  const limpos = valor
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);
  return [...new Set(limpos)];
}

/**
 * O que gravar na coluna.
 *
 * Lista vazia vira `null` em vez de `{}`: os dois significam "todos os
 * planos", e ter duas representações do mesmo estado é o tipo de detalhe que
 * gera consulta com resultado diferente dependendo de qual foi gravado.
 */
export function valorParaGravar(valor: unknown): string[] | null {
  const lista = normalizarPlanos(valor);
  return lista.length > 0 ? lista : null;
}

// ============================================================================
// A ESCOLHA DO ADMINISTRADOR, LIDA SEM AMBIGUIDADE
//
// O formulário era só uma lista de caixas de seleção, e "nenhuma marcada"
// significava TODOS OS PLANOS. É o inverso do que a caixa sugere: quem
// desmarca um plano está tirando o cupom dele, e quem desmarca todos espera
// tirar o cupom de todos — não liberá-lo geral.
//
// Foi exatamente o que aconteceu com o DECOLA30: ele deveria valer só no VOO
// GUIADO, ficou gravado como "todos os planos", e um DECOLANDO PRO de
// R$ 170,00 foi vendido com 30% de desconto.
//
// Agora a intenção é declarada, não deduzida: ou o cupom vale em todos, ou
// vale nos marcados — e "nos marcados, nenhum marcado" é um erro que a tela
// mostra, não um estado que o banco aceita em silêncio.
// ============================================================================

export type EscolhaDePlanos =
  | { ok: true; planos: string[] | null }
  | { ok: false; erro: string };

/** O nome do campo que carrega a decisão no formulário. */
export const CAMPO_DA_RESTRICAO = "restricao_planos";
export const RESTRITO = "selecionados";

/**
 * Lê a escolha do formulário do painel.
 *
 * Sem o campo de decisão — um formulário antigo, ou uma requisição montada à
 * mão — cai em "todos os planos", que é o comportamento histórico e o único
 * seguro de assumir: restringir por engano bloquearia um desconto que o
 * cliente já viu na tela.
 */
export function lerEscolhaDePlanos(form: {
  get(nome: string): unknown;
  getAll(nome: string): unknown[];
}): EscolhaDePlanos {
  const restricao = String(form.get(CAMPO_DA_RESTRICAO) ?? "").trim();
  if (restricao !== RESTRITO) return { ok: true, planos: null };

  const lista = normalizarPlanos(form.getAll("planos_aplicaveis"));
  if (lista.length === 0) {
    return {
      ok: false,
      erro: 'Você escolheu restringir o cupom, mas não marcou nenhum plano. Marque ao menos um — ou selecione "Vale em todos os planos".'
    };
  }
  return { ok: true, planos: lista };
}

/** O texto mostrado ao cliente quando o cupom não vale para o plano dele. */
export const MENSAGEM_PLANO_NAO_ELEGIVEL = "Este cupom não é válido para este plano.";

/** Como a restrição aparece na listagem do painel. */
export function descreverAplicacao(planosAplicaveis: unknown, nomePorId: Map<string, string>): string {
  const lista = normalizarPlanos(planosAplicaveis);
  if (lista.length === 0) return "Todos os planos";
  return lista.map((id) => nomePorId.get(id) ?? "Plano removido").join(", ");
}
