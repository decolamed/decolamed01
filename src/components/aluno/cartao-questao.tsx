"use client";

import { ImagensQuestao } from "./imagens-questao";
import { IdentificacaoQuestao } from "./identificacao-questao";
import type { OrigemDaQuestao } from "@/lib/site/questao-identidade";

// ============================================================================
// O CARTÃO DE QUESTÃO — um só, para TODA tela que resolve questão
//
// Banco de Questões, atividade diária, atividade do cronograma, missão do
// Copiloto e simulado tinham cada um a sua versão do mesmo cartão: mesma
// ideia, várias implementações, com espaçamentos, estados e feedbacks que já
// divergiam entre si. O padrão do Banco de Questões é o aprovado — então ele
// deixa de ser "o jeito daquela tela" e passa a ser O cartão.
//
// A forma vem de decola-app.tsx (`questaoMeta`, `questaoCard` e a lista de
// alternativas da prática): fundo azul da plataforma, enunciado numa caixa
// azul, cada alternativa na sua própria caixa com a letra num quadradinho,
// 1.5px de borda e 14px de raio. Os valores de cor são os mesmos, expostos
// como tokens `app-*` no tailwind.config.ts — esta rota é uma página Next
// separada do app imersivo e não enxerga o objeto de cores dele.
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
    <div>
      {/* Progresso primeiro, como na prática do Banco de Questões: antes de
          ler o enunciado o aluno já sabe onde está na sequência. */}
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-app-sub">
        <span>{rotuloProgresso ?? `${posicao} de ${total}`}</span>
        {direita}
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-app-chip">
        <div
          className="h-full rounded-full bg-orange transition-all"
          style={{ width: `${total > 0 ? Math.min(100, ((posicao - 1) / total) * 100) : 0}%` }}
        />
      </div>

      <IdentificacaoQuestao questao={questao} posicao={posicao} className="mt-4" />

      <div className="mt-2.5 rounded-2xl border border-app-line bg-app-card p-4 sm:p-5">
        <p className="whitespace-pre-line text-[15px] font-bold leading-[1.55] text-app-txt">{questao.enunciado}</p>
        <ImagensQuestao imagens={questao.imagens ?? []} />
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {questao.alternativas.map((alt) => {
          const ehEscolhida = escolhida === alt.id;
          const ehCorreta = revelado && alt.id === respostaCorreta;
          const ehErradaEscolhida = revelado && ehEscolhida && correta === false;

          // Caixa da alternativa. As três situações reveladas (certa, a errada
          // que o aluno marcou, as demais) e as duas de escolha (marcada, não
          // marcada) — as mesmas do Banco de Questões.
          let caixa = "border-app-line bg-app-card text-app-txt";
          let letra = "bg-app-chip text-app-sub";
          let marca: string | null = null;

          if (revelado) {
            if (ehCorreta) {
              caixa = "border-app-green bg-app-green-soft text-app-green-deep";
              letra = "bg-app-green text-app-bg";
              marca = "Correta";
            } else if (ehErradaEscolhida) {
              caixa = "border-app-red bg-app-red-soft text-app-red";
              letra = "bg-app-red text-app-bg";
              marca = "Sua resposta";
            } else {
              // As demais alternativas continuam legíveis depois da correção:
              // o aluno relê as que descartou para entender o próprio erro.
              caixa = "border-app-line bg-app-card text-app-sub";
            }
          } else if (ehEscolhida) {
            caixa = "border-orange bg-app-orange-soft text-app-txt";
            letra = "bg-orange text-white";
          }

          return (
            <button
              key={alt.id}
              onClick={() => onEscolher(alt.id)}
              disabled={desabilitado}
              aria-pressed={ehEscolhida}
              className={`flex w-full items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 py-3 text-left transition ${caixa} disabled:cursor-default`}
            >
              <span
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[9px] text-xs font-extrabold ${letra}`}
              >
                {/* A letra é o ID da alternativa, não a posição na lista: é
                    ele que o bloco de resultado cita em "Gabarito: C". */}
                {alt.id.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 text-[13px] font-semibold leading-[1.4]">{alt.texto}</span>
              {/* O estado não pode depender só da cor: quem não distingue
                  verde de vermelho lê a palavra. */}
              {marca && (
                <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wide">{marca}</span>
              )}
            </button>
          );
        })}
      </div>

      {children}
    </div>
  );
}

/**
 * Uma alternativa na LISTA DE GABARITO (depois do envio, quando o aluno
 * revisa a prova inteira de uma vez). É a versão estática da alternativa
 * acima — mesmas cores e mesmas palavras, sem clique.
 *
 * Existia duas vezes, escrita à mão na atividade e no simulado, e nas duas
 * com classes de cor que este tema não tem (`bg-green-50`, `text-red-700`) —
 * o gabarito saía sem marcação nenhuma, exatamente onde ela mais importa.
 */
export function AlternativaDoGabarito({
  alt,
  correta,
  escolhidaErrada
}: {
  alt: { id: string; texto: string };
  correta: boolean;
  escolhidaErrada: boolean;
}) {
  const estilo = correta
    ? "border-app-green bg-app-green-soft text-app-green-deep"
    : escolhidaErrada
    ? "border-app-red bg-app-red-soft text-app-red"
    : "border-transparent text-app-sub";
  const marca = correta ? "Correta" : escolhidaErrada ? "Sua resposta" : null;

  return (
    <p className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${estilo}`}>
      <span className="font-bold">{alt.id.toUpperCase()})</span>
      <span className="min-w-0 flex-1">{alt.texto}</span>
      {marca && <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wide">{marca}</span>}
    </p>
  );
}
