// Mesmo padrão já usado em /admin/planos ((valor / 100).toLocaleString(...)),
// só que centralizado para não repetir a config do Intl em cada página nova
// (vendas, parceiro) introduzida por esta feature.
export function formatarCentavos(centavos: number | null | undefined): string {
  return ((centavos ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarData(dataIso: string | null | undefined): string {
  if (!dataIso) return "—";
  return new Date(dataIso).toLocaleDateString("pt-BR");
}
