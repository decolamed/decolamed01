"use client";

export function BotaoImprimir() {
  // É `window.print()` mesmo, e não uma biblioteca de PDF. O diálogo do
  // navegador já traz "Salvar como PDF", e o CSS de impressão em globals.css
  // é que faz o arquivo sair limpo — sem barra, sem botão, com os blocos
  // coloridos preservados. Uma biblioteca aqui pesaria centenas de kB para
  // entregar um resultado pior em fidelidade tipográfica.
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-tinta-200 bg-white px-4 py-2 text-sm font-semibold text-tinta-700 transition hover:bg-tinta-100"
    >
      Imprimir / salvar em PDF
    </button>
  );
}
