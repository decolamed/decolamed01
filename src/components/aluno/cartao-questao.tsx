"use client";

import { ImagensQuestao } from "./imagens-questao";
import { IdentificacaoQuestao } from "./identificacao-questao";
import type { OrigemDaQuestao } from "@/lib/site/questao-identidade";

// ============================================================================
// O CARTÃO DE QUESTÃO — um só, para as quatro telas que resolvem questão
//
// Banco de Questões, atividade diária, atividade e simulado tinham cada um a
// sua versão do mesmo cartão: mesma ideia, quatro implementações, com
// espaçamentos, estados e feedbacks que já divergiam entre si. O padrão do
// Banco de Questões é o que ficou bom — então ele deixa de ser "o jeito
// daquela tela" e passa a ser O cartão.
//
// O que muda entre os contextos é comportamento, não aparência: no simulado
// e na atividade com gabarito após o envio não há correção na hora, então
// `respostaCorreta` chega nula e as alternativas ficam só no estado de
// escolha. Nenhuma tela precisa de estilo próprio para isso.
// ============================================================================

export interface QuestaoDoCartao extends OrigemDaQuestao {
  enunciado: string;
  alternativas: { id: string; texto: string }[];
  imagens?: { url: string; legenda: string | null; ordem: number }[] | null;
}

export function CartaoQuestao({
  questao,
  posicao,
  total,
  rotuloProgresso,
  direita,
  escolhida,
  respostaCorreta,
  correta,
  onEscolher,
  desabilitado,
  children
}: {
  questao: QuestaoDoCartao;
  /** Posição na rodada/atividade atual, 1..N. */
  posicao: number;
  total: number;
  /** Texto do canto esquerdo — "3 de 5 nesta atividade". */
  rotuloProgresso?: string;
  /** Conteúdo do canto direito (acertos, cronômetro…). */
  direita?: React.ReactNode;
  escolhida: string | null;
  /** Gabarito, quando já revelado. Nulo enquanto a questão não foi corrigida. */
  respostaCorreta?: string | null;
  correta?: boolean;
  onEscolher: (alternativaId: string) => void;
  desabilitado?: boolean;
  /** Bloco de resultado/ações abaixo das alternativas. */
  children?: React.ReactNode;
}) {
  const revelado = !!respostaCorreta;

  return (
    <div className="rounded-2xl bg-white p-6 shadow sm:p-8">
      <IdentificacaoQuestao questao={questao} posicao={posicao} className="mb-3" />

      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-navy-dark/50">
        <span>{rotuloProgresso ?? `${posicao} de ${total}`}</span>
        {direita}
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
        <div
          className="h-full bg-orange transition-all"
          style={{ width: `${total > 0 ? ((posicao - 1) / total) * 100 : 0}%` }}
        />
      </div>

      <p className="mt-5 whitespace-pre-line font-display text-lg font-semibold text-navy-dark">{questao.enunciado}</p>
      <ImagensQuestao imagens={questao.imagens ?? []} />

      <div className="mt-5 space-y-2">
        {questao.alternativas.map((alt) => {
          const ehEscolhida = escolhida === alt.id;
          const ehCorreta = revelado && alt.id === respostaCorreta;
          const ehErradaEscolhida = revelado && ehEscolhida && correta === false;

          let estilo = "border-navy/15 hover:border-orange/50";
          if (revelado) {
            if (ehCorreta) estilo = "border-green-500 bg-green-50";
            else if (ehErradaEscolhida) estilo = "border-red-400 bg-red-50";
            else estilo = "border-navy/10 opacity-60";
          } else if (ehEscolhida) {
            estilo = "border-orange bg-orange/5";
          }

          return (
            <button
              key={alt.id}
              onClick={() => onEscolher(alt.id)}
              disabled={desabilitado}
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${estilo} disabled:cursor-default`}
            >
              <span className="font-display font-bold text-navy-dark">{alt.id.toUpperCase()})</span>
              <span className="text-navy-dark">{alt.texto}</span>
            </button>
          );
        })}
      </div>

      {children}
    </div>
  );
}
