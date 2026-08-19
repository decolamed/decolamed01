import { FUSO_PLATAFORMA } from "@/lib/site/data";

// Mesmo padrão já usado em /admin/planos ((valor / 100).toLocaleString(...)),
// só que centralizado para não repetir a config do Intl em cada página nova
// (vendas, parceiro) introduzida por esta feature.
export function formatarCentavos(centavos: number | null | undefined): string {
  return ((centavos ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// A data é sempre exibida no fuso da plataforma, nunca no da máquina.
//
// Sem o `timeZone`, o `toLocaleDateString` usa o fuso de quem renderiza — e
// quem renderiza é a Vercel, que roda em UTC. Uma venda das 22h de Brasília
// do dia 30 tem timestamp 01h do dia 31 em UTC e aparecia como dia 31 na
// tabela, enquanto o filtro de período (lib/vendas/periodo.ts) a conta no
// dia 30. Data exibida e data filtrada precisam ser a mesma data, senão a
// tabela contradiz o total logo acima dela.
export function formatarData(dataIso: string | null | undefined): string {
  if (!dataIso) return "—";
  return new Date(dataIso).toLocaleDateString("pt-BR", { timeZone: FUSO_PLATAFORMA });
}
