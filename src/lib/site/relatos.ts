// Estados do relato de erro. Fora das actions porque o tipo e os rótulos são
// usados também no componente cliente, e um arquivo "use server" só pode
// exportar funções async.
export type StatusRelato = "pendente" | "em_analise" | "resolvido";

export const STATUS_RELATO: { valor: StatusRelato; label: string; cor: string }[] = [
  { valor: "pendente", label: "Pendente", cor: "orange" },
  { valor: "em_analise", label: "Em análise", cor: "navy" },
  { valor: "resolvido", label: "Resolvido", cor: "green" }
];

export function rotuloStatus(status: string): string {
  return STATUS_RELATO.find((s) => s.valor === status)?.label ?? status;
}
