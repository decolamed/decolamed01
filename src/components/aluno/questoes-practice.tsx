"use client";

import { useState, useTransition } from "react";
import { registrarResposta } from "@/app/(aluno)/aluno/questoes/actions";
import type { Questao } from "@/types/database";

export function QuestoesPractice({ questoes }: { questoes: Questao[] }) {
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ correta: boolean; respostaCorreta: string; explicacao: string | null } | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [pending, startTransition] = useTransition();

  const questao = questoes[indice];

  if (!questao) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <p className="text-navy-dark/70">Nenhuma questão disponível com esse filtro no momento.</p>
      </div>
    );
  }

  function escolher(alternativaId: string) {
    if (resultado) return; // já respondeu essa questão, ignora novo clique
    setEscolha(alternativaId);
    startTransition(async () => {
      const resposta = await registrarResposta(questao.id, alternativaId);
      if (resposta.ok) {
        setResultado(resposta);
        if (resposta.correta) setAcertos((a) => a + 1);
      }
    });
  }

  function proxima() {
    setEscolha(null);
    setResultado(null);
    setIndice((i) => i + 1);
  }

  const terminou = indice >= questoes.length;

  if (terminou) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <span className="text-4xl">🏁</span>
        <h2 className="mt-3 font-display text-xl font-bold text-navy-dark">Rodada concluída!</h2>
        <p className="mt-2 text-navy-dark/70">
          Você acertou {acertos} de {questoes.length} questões.
        </p>
        <button
          onClick={() => {
            setIndice(0);
            setAcertos(0);
            setEscolha(null);
            setResultado(null);
          }}
          className="mt-5 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Praticar de novo
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow sm:p-8">
      <div className="flex items-center justify-between text-sm text-navy-dark/60">
        <span>
          Questão {indice + 1} de {questoes.length}
        </span>
        <span className="rounded-full bg-navy/5 px-3 py-1 font-semibold">{questao.materia}</span>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
        <div
          className="h-full bg-orange transition-all"
          style={{ width: `${(indice / questoes.length) * 100}%` }}
        />
      </div>

      <p className="mt-5 font-display text-lg font-semibold text-navy-dark">{questao.enunciado}</p>

      <div className="mt-5 space-y-2">
        {questao.alternativas.map((alt) => {
          const éEscolhida = escolha === alt.id;
          const éCorreta = resultado && alt.id === resultado.respostaCorreta;
          const éErradaEscolhida = resultado && éEscolhida && !resultado.correta;

          let estilo = "border-navy/15 hover:border-orange/50";
          if (resultado) {
            if (éCorreta) estilo = "border-green-500 bg-green-50";
            else if (éErradaEscolhida) estilo = "border-red-400 bg-red-50";
            else estilo = "border-navy/10 opacity-60";
          } else if (éEscolhida) {
            estilo = "border-orange bg-orange/5";
          }

          return (
            <button
              key={alt.id}
              onClick={() => escolher(alt.id)}
              disabled={pending || !!resultado}
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${estilo}`}
            >
              <span className="font-display font-bold text-navy-dark">{alt.id.toUpperCase()})</span>
              <span className="text-navy-dark">{alt.texto}</span>
            </button>
          );
        })}
      </div>

      {resultado && (
        <div className={`mt-5 rounded-xl p-4 text-sm ${resultado.correta ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
          <p className="font-bold">{resultado.correta ? "✅ Você acertou!" : "❌ Você errou."}</p>
          {resultado.explicacao && <p className="mt-1">{resultado.explicacao}</p>}
        </div>
      )}

      {resultado && (
        <button
          onClick={proxima}
          className="mt-5 w-full rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Próxima questão
        </button>
      )}
    </div>
  );
}
