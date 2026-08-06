import type { ReactNode } from "react";

// Tabela do admin que vira lista de cartões no celular.
//
// Antes toda tabela usava TableCard, que impõe `min-w-[720px]`: num celular
// de 360px isso significa rolagem horizontal em TODAS as telas de gestão —
// o admin precisava arrastar a tabela de lado para ler qualquer coluna
// depois da segunda. Reduzir a fonte não resolve; a tabela continua larga.
//
// A solução é ter duas apresentações do MESMO dado: tabela de verdade no
// desktop e um cartão por registro no celular, onde cada coluna vira uma
// linha "rótulo: valor". As duas saem da mesma definição de colunas, então
// não há como uma ficar desatualizada em relação à outra — que é o defeito
// clássico de manter dois blocos de marcação escritos à mão.

export interface ColunaTabela<T> {
  /** Cabeçalho da coluna (e rótulo do campo no cartão do celular). */
  titulo: string;
  /** Conteúdo da célula. */
  celula: (linha: T) => ReactNode;
  /**
   * No celular esta coluna vira o título do cartão, sem rótulo ao lado.
   * Use na coluna que identifica o registro (nome, título, código).
   */
  principal?: boolean;
  /**
   * Não mostrar no cartão do celular — para colunas que só fazem sentido
   * ao lado das outras e apenas poluiriam a tela pequena.
   */
  ocultarNoCelular?: boolean;
  /** Classe extra aplicada à célula na tabela (alinhamento etc.). */
  className?: string;
}

interface Props<T> {
  colunas: ColunaTabela<T>[];
  linhas: T[];
  /** Chave estável de cada linha. */
  chave: (linha: T) => string;
  /** Texto quando não há nenhum registro. */
  vazio?: string;
  /** Ações do registro (botões), renderizadas no rodapé do cartão. */
  acoes?: (linha: T) => ReactNode;
}

export function TabelaResponsiva<T>({ colunas, linhas, chave, vazio = "Nenhum registro.", acoes }: Props<T>) {
  if (linhas.length === 0) {
    return (
      <div className="rounded-2xl border border-navy-dark/10 bg-white p-6 text-center text-sm font-semibold text-navy-dark/50">
        {vazio}
      </div>
    );
  }

  const principal = colunas.find((c) => c.principal) ?? colunas[0];
  const secundarias = colunas.filter((c) => c !== principal && !c.ocultarNoCelular);

  return (
    <>
      {/* Celular e tablet pequeno: um cartão por registro. */}
      <div className="space-y-2.5 md:hidden">
        {linhas.map((linha) => (
          <div key={chave(linha)} className="rounded-2xl border border-navy-dark/10 bg-white p-4">
            <div className="text-sm font-extrabold text-navy-dark">{principal.celula(linha)}</div>
            <dl className="mt-2.5 space-y-1.5">
              {secundarias.map((coluna) => (
                <div key={coluna.titulo} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <dt className="text-[10px] font-extrabold uppercase tracking-wide text-navy-dark/40">
                    {coluna.titulo}
                  </dt>
                  <dd className="min-w-0 break-words text-right text-xs font-semibold text-navy-dark">
                    {coluna.celula(linha)}
                  </dd>
                </div>
              ))}
            </dl>
            {acoes && <div className="mt-3 flex flex-wrap gap-2 border-t border-navy-dark/10 pt-3">{acoes(linha)}</div>}
          </div>
        ))}
      </div>

      {/* Desktop: tabela de verdade. */}
      <div className="hidden overflow-x-auto rounded-2xl border border-navy-dark/10 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {colunas.map((coluna) => (
                <th
                  key={coluna.titulo}
                  className="whitespace-nowrap border-b border-navy-dark/10 bg-navy-dark/[0.03] p-3 text-[10px] font-extrabold uppercase tracking-wide text-navy-dark/40"
                >
                  {coluna.titulo}
                </th>
              ))}
              {acoes && <th className="border-b border-navy-dark/10 bg-navy-dark/[0.03] p-3" />}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={chave(linha)}>
                {colunas.map((coluna) => (
                  <td
                    key={coluna.titulo}
                    className={`border-t border-navy-dark/10 p-3 align-top text-sm ${coluna.className ?? ""}`}
                  >
                    {coluna.celula(linha)}
                  </td>
                ))}
                {acoes && (
                  <td className="border-t border-navy-dark/10 p-3 align-top">
                    <div className="flex flex-wrap justify-end gap-2">{acoes(linha)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
