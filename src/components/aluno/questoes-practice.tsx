"use client";

import { useState, useTransition } from "react";
import { registrarResposta, revisaoCriadaApos } from "@/app/(aluno)/aluno/questoes/actions";
import { CartaoQuestao } from "./cartao-questao";
import { ResultadoDaResposta } from "./identificacao-questao";
import type { Questao } from "@/types/database";

export function QuestoesPractice({ questoes }: { questoes: Questao[] }) {
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ correta: boolean; respostaCorreta: string; explicacao: string | null } | null>(null);
  const [revisaoCriada, setRevisaoCriada] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [pending, startTransition] = useTransition();

  const questao = questoes[indice];

  if (!questao) {
    return (
      <div className="rounded-2xl border border-app-line bg-app-card p-8 text-center">
        <p className="text-app-sub">Nenhuma questão disponível com esse filtro no momento.</p>
      </div>
    );
  }

  function escolher(alternativaId: string) {
    if (resultado) return; // já respondeu essa questão, ignora novo clique
    setEscolha(alternativaId);
    const desde = new Date().toISOString();
    startTransition(async () => {
      const resposta = await registrarResposta(questao.id, alternativaId);
      if (!resposta.ok) return;
      setResultado(resposta);
      if (resposta.correta) {
        setAcertos((a) => a + 1);
        return;
      }
      // O Copiloto roda em segundo plano; a resposta do aluno não espera por
      // ele. Passado um instante, pergunta ao banco se a revisão existe mesmo
      // — e só então mostra o aviso. Se ainda não estiver gravada, o aviso
      // simplesmente não aparece, que é melhor do que prometer o que não há.
      setTimeout(() => {
        revisaoCriadaApos(resposta.materia, resposta.assunto, desde)
          .then(setRevisaoCriada)
          .catch(() => setRevisaoCriada(false));
      }, 1200);
    });
  }

  function proxima() {
    setEscolha(null);
    setResultado(null);
    setRevisaoCriada(false);
    setIndice((i) => i + 1);
  }

  const terminou = indice >= questoes.length;

  if (terminou) {
    return (
      <div className="rounded-2xl border border-app-line bg-app-card p-8 text-center">
        <span className="text-4xl">🏁</span>
        <h2 className="mt-3 font-display text-xl font-bold text-app-txt">Rodada concluída!</h2>
        <p className="mt-2 text-app-sub">
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
    <CartaoQuestao
      questao={questao}
      posicao={indice + 1}
      total={questoes.length}
      rotuloProgresso={`${indice + 1} de ${questoes.length} nesta rodada`}
      direita={<span>{acertos} acerto(s)</span>}
      escolhida={escolha}
      respostaCorreta={resultado?.respostaCorreta ?? null}
      correta={resultado?.correta}
      onEscolher={escolher}
      desabilitado={pending || !!resultado}
    >
      {resultado && (
        <ResultadoDaResposta
          correta={resultado.correta}
          respostaCorreta={resultado.respostaCorreta}
          explicacao={resultado.explicacao}
          revisaoCriada={revisaoCriada}
        >
          <button
            onClick={proxima}
            className="w-full rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
          >
            {indice + 1 >= questoes.length ? "Concluir rodada" : "Próxima questão →"}
          </button>
        </ResultadoDaResposta>
      )}
    </CartaoQuestao>
  );
}
