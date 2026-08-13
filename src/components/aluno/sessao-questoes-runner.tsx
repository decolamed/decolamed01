"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { registrarResposta } from "@/app/(aluno)/aluno/questoes/actions";
import { alternarConclusaoItem } from "@/app/(aluno)/aluno/progresso-actions";
import { ImagensQuestao } from "./imagens-questao";
import type { Questao } from "@/types/database";

// ============================================================================
// Executor da atividade diária: uma sessão FECHADA de N questões.
//
// Diferente do Banco de Questões de propósito. Lá o aluno navega o acervo;
// aqui ele tem 5 questões, vê "Questão 3 de 5" e termina na quinta. Não há
// como sair desta sessão para o resto do banco — era exatamente isso que
// acontecia antes, quando o item do cronograma era só um link com filtro.
//
// O registro de resposta é o MESMO `registrarResposta` do banco de questões:
// cada resposta continua indo para `respostas_aluno` e disparando o Copiloto.
// Nada do fluxo de desempenho muda.
// ============================================================================

export function SessaoQuestoesRunner({
  questoes,
  chave,
  materia,
  quantidadePedida,
  voltarPara
}: {
  questoes: Questao[];
  /** Chave do item no cronograma — é ela que marca a atividade como concluída. */
  chave: string;
  materia: string;
  quantidadePedida: number;
  voltarPara: string;
}) {
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [resultado, setResultado] = useState<
    { correta: boolean; respostaCorreta: string; explicacao: string | null } | null
  >(null);
  const [acertos, setAcertos] = useState(0);
  const [pending, startTransition] = useTransition();

  const total = questoes.length;
  const questao = questoes[indice];
  const terminou = indice >= total;

  function escolher(alternativaId: string) {
    if (resultado || !questao) return;
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
    const seguinte = indice + 1;
    setIndice(seguinte);
    // A atividade só conta como concluída depois da ÚLTIMA questão. Em 3/5
    // ela continua pendente no cronograma, como pede a regra.
    if (seguinte >= total) {
      alternarConclusaoItem(chave, true).catch(() => {
        /* a nota já foi registrada; a marca de conclusão tenta de novo depois */
      });
    }
  }

  if (terminou) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <span className="text-4xl">🏁</span>
        <h2 className="mt-3 font-display text-xl font-bold text-navy-dark">Atividade concluída!</h2>
        <p className="mt-2 text-navy-dark/70">
          Você acertou {acertos} de {total} {total === 1 ? "questão" : "questões"} de {materia}.
        </p>
        <p className="mt-1 text-sm text-navy-dark/50">
          Na próxima atividade de {materia}, você recebe questões novas — estas não se repetem.
        </p>
        <Link
          href={voltarPara}
          className="mt-5 inline-block rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Voltar ao cronograma
        </Link>
      </div>
    );
  }

  if (!questao) {
    // Sem questões inéditas: a atividade não vira "o banco inteiro". O aluno
    // recebe a explicação e o caminho para revisar por conta própria.
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <span className="text-4xl">✅</span>
        <h2 className="mt-3 font-display text-xl font-bold text-navy-dark">
          Você já respondeu todas as questões de {materia}
        </h2>
        <p className="mt-2 text-navy-dark/70">
          Não há questões inéditas para montar esta atividade. Você pode revisar as que já fez no Banco de Questões.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href={`/aluno/questoes?materia=${encodeURIComponent(materia)}`}
            className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
          >
            Revisar no Banco de Questões
          </Link>
          <Link href={voltarPara} className="rounded-full bg-navy/5 px-6 py-3 font-display font-bold text-navy-dark">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow sm:p-8">
      <div className="flex items-center justify-between text-sm text-navy-dark/60">
        {/* "Questão 3 de 5" — o total é o da sessão, nunca o do banco. */}
        <span className="font-semibold">
          Questão {indice + 1} de {total}
        </span>
        <span className="rounded-full bg-navy/5 px-3 py-1 font-semibold">{questao.materia}</span>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
        <div className="h-full bg-orange transition-all" style={{ width: `${(indice / total) * 100}%` }} />
      </div>

      {total < quantidadePedida && (
        <p className="mt-3 rounded-xl bg-orange/10 px-3 py-2 text-xs font-semibold text-orange-dark">
          Restavam apenas {total} {total === 1 ? "questão inédita" : "questões inéditas"} de {materia}, então esta
          atividade tem {total} em vez de {quantidadePedida}.
        </p>
      )}

      <p className="mt-5 whitespace-pre-line font-display text-lg font-semibold text-navy-dark">{questao.enunciado}</p>
      <ImagensQuestao imagens={questao.imagens} />

      <div className="mt-5 space-y-2">
        {questao.alternativas.map((alt) => {
          const ehEscolhida = escolha === alt.id;
          const ehCorreta = resultado && alt.id === resultado.respostaCorreta;
          const ehErradaEscolhida = resultado && ehEscolhida && !resultado.correta;

          let estilo = "border-navy/15 hover:border-orange/50";
          if (resultado) {
            if (ehCorreta) estilo = "border-green-500 bg-green-50";
            else if (ehErradaEscolhida) estilo = "border-red-400 bg-red-50";
            else estilo = "border-navy/10 opacity-60";
          } else if (ehEscolhida) {
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
        <div
          className={`mt-5 rounded-xl p-4 text-sm ${
            resultado.correta ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          <p className="font-bold">{resultado.correta ? "✅ Você acertou!" : "❌ Você errou."}</p>
          {resultado.explicacao && <p className="mt-1">{resultado.explicacao}</p>}
        </div>
      )}

      {resultado && (
        <button
          onClick={proxima}
          className="mt-5 w-full rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          {indice + 1 >= total ? "Concluir atividade" : "Próxima questão"}
        </button>
      )}
    </div>
  );
}
