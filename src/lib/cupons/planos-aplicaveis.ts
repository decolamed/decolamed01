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

/** O texto mostrado ao cliente quando o cupom não vale para o plano dele. */
export const MENSAGEM_PLANO_NAO_ELEGIVEL = "Este cupom não é válido para este plano.";

/** Como a restrição aparece na listagem do painel. */
export function descreverAplicacao(planosAplicaveis: unknown, nomePorId: Map<string, string>): string {
  const lista = normalizarPlanos(planosAplicaveis);
  if (lista.length === 0) return "Todos os planos";
  return lista.map((id) => nomePorId.get(id) ?? "Plano removido").join(", ");
}
