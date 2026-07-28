"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { corrigirQuestaoAtividade, submeterAtividade, type ResultadoAtividade } from "@/app/(aluno)/aluno/atividades/[id]/actions";
import { ImagensQuestao } from "./imagens-questao";

interface QuestaoAtividade {
  id: string;
  enunciado: string;
  alternativas: { id: string; texto: string }[];
  imagens: { url: string; legenda: string | null; ordem: number }[];
}

export function AtividadeRunner({
  atividadeId,
  titulo,
  gabaritoModo,
  tempoLimiteMinutos,
  questoes
}: {
  atividadeId: string;
  titulo: string;
  gabaritoModo: "imediato" | "apos_envio";
  tempoLimiteMinutos: number | null;
  questoes: QuestaoAtividade[];
}) {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [segundosRestantes, setSegundosRestantes] = useState(tempoLimiteMinutos ? tempoLimiteMinutos * 60 : null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAtividade | null>(null);
  const [feedbackImediato, setFeedbackImediato] = useState<Record<string, { correta: boolean; respostaCorreta: string; explicacao: string | null }>>({});
  const [corrigindo, setCorrigindo] = useState(false);

  const questao = questoes[indice];
  const respondidas = Object.keys(respostas).length;

  async function enviar() {
    if (enviando || resultado) return;
    setEnviando(true);
    const res = await submeterAtividade(atividadeId, respostas);
    setResultado(res);
    setEnviando(false);
  }

  async function responder(altId: string) {
    if (gabaritoModo === "imediato" && feedbackImediato[questao.id]) return; // já respondida
    setRespostas((r) => ({ ...r, [questao.id]: altId }));
    if (gabaritoModo === "imediato") {
      setCorrigindo(true);
      const res = await corrigirQuestaoAtividade(questao.id, altId);
      setCorrigindo(false);
      if (res.ok) {
        setFeedbackImediato((f) => ({ ...f, [questao.id]: { correta: res.correta, respostaCorreta: res.respostaCorreta, explicacao: res.explicacao } }));
      }
    }
  }

  // Cronômetro regressivo (só quando há tempo limite) — envia sozinho ao zerar.
  useEffect(() => {
    if (resultado || segundosRestantes === null) return;
    if (segundosRestantes <= 0) {
      enviar();
      return;
    }
    const t = setTimeout(() => setSegundosRestantes((s) => (s !== null ? s - 1 : s)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundosRestantes, resultado]);

  const tempoFormatado = useMemo(() => {
    if (segundosRestantes === null) return null;
    const m = Math.floor(segundosRestantes / 60);
    const s = segundosRestantes % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [segundosRestantes]);

  if (resultado) {
    return (
      <div>
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <span className="text-4xl">✅</span>
          <h1 className="mt-2 font-display text-2xl font-bold text-navy-dark">Atividade concluída!</h1>
          <p className="mt-2 text-navy-dark/70">Você acertou {resultado.acertos} de {resultado.total} questões.</p>
          <div className="mt-4 flex flex-col items-center gap-1">
            <p className="font-display text-5xl font-extrabold text-orange">{resultado.nota}%</p>
            {resultado.pesoFacape !== 1 && (
              <p className="text-xs text-navy-dark/50">Peso {resultado.pesoFacape}x na nota ponderada</p>
            )}
          </div>
          <Link href="/aluno/atividades" className="mt-6 inline-block rounded-full border border-navy/20 px-6 py-3 font-display font-semibold text-navy-dark hover:bg-navy/5">
            Voltar às atividades
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {resultado.gabarito.map((item, i) => (
            <div key={item.questaoId} className="rounded-2xl bg-white p-5 shadow">
              <p className="text-xs font-semibold text-navy-dark/50">Questão {i + 1}</p>
              <p className="mt-1 whitespace-pre-line font-display font-semibold text-navy-dark">{item.enunciado}</p>
              <ImagensQuestao imagens={item.imagens} />
              <div className="mt-3 space-y-1.5">
                {item.alternativas.map((alt) => {
                  const éCorreta = alt.id === item.respostaCorreta;
                  const éEscolhidaErrada = alt.id === item.escolhida && !item.correta;
                  return (
                    <p key={alt.id} className={`rounded-lg p-2 text-sm ${éCorreta ? "bg-green-50 text-green-800" : éEscolhidaErrada ? "bg-red-50 text-red-700" : "text-navy-dark/70"}`}>
                      <span className="font-bold">{alt.id.toUpperCase()})</span> {alt.texto}
                    </p>
                  );
                })}
              </div>
              {item.explicacao && <p className="mt-3 rounded-lg bg-navy/5 p-3 text-sm text-navy-dark/80">{item.explicacao}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const feedback = gabaritoModo === "imediato" ? feedbackImediato[questao.id] : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow">
        <div>
          <p className="font-display font-bold text-navy-dark">{titulo}</p>
          <p className="text-xs text-navy-dark/50">{respondidas} de {questoes.length} respondidas</p>
        </div>
        {tempoFormatado && (
          <span className={`rounded-full px-4 py-2 font-display text-lg font-bold ${segundosRestantes! < 60 ? "bg-red-50 text-red-600" : "bg-navy/5 text-navy-dark"}`}>
            ⏱️ {tempoFormatado}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {questoes.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setIndice(i)}
            className={`h-9 w-9 rounded-lg text-sm font-semibold ${i === indice ? "bg-orange text-white" : respostas[q.id] ? "bg-navy text-white" : "bg-white text-navy-dark shadow"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow sm:p-8">
        <p className="whitespace-pre-line font-display text-lg font-semibold text-navy-dark">{questao.enunciado}</p>
        <ImagensQuestao imagens={questao.imagens} />

        <div className="mt-5 space-y-2">
          {questao.alternativas.map((alt) => {
            const escolhida = respostas[questao.id] === alt.id;
            const mostrarCorreta = feedback && alt.id === feedback.respostaCorreta;
            const mostrarErrada = feedback && escolhida && !feedback.correta;
            return (
              <button
                key={alt.id}
                onClick={() => responder(alt.id)}
                disabled={!!feedback || corrigindo}
                className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${
                  mostrarCorreta
                    ? "border-green-500 bg-green-50"
                    : mostrarErrada
                    ? "border-red-400 bg-red-50"
                    : escolhida
                    ? "border-orange bg-orange/5"
                    : "border-navy/15 hover:border-orange/50"
                } disabled:cursor-default`}
              >
                <span className="font-display font-bold text-navy-dark">{alt.id.toUpperCase()})</span>
                <span className="text-navy-dark">{alt.texto}</span>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className={`mt-4 rounded-xl p-3 text-sm ${feedback.correta ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
            {feedback.correta ? "Você acertou!" : "Você errou."}
            {feedback.explicacao && <p className="mt-1 text-navy-dark/70">{feedback.explicacao}</p>}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setIndice((i) => Math.max(0, i - 1))}
            disabled={indice === 0}
            className="rounded-full border border-navy/20 px-5 py-2.5 font-semibold text-navy-dark disabled:opacity-30"
          >
            ← Anterior
          </button>

          {indice < questoes.length - 1 ? (
            <button onClick={() => setIndice((i) => i + 1)} className="rounded-full bg-navy px-5 py-2.5 font-semibold text-white">
              Próxima →
            </button>
          ) : (
            <button
              onClick={() => {
                if (confirm(`Enviar a atividade? Você respondeu ${respondidas} de ${questoes.length} questões.`)) enviar();
              }}
              disabled={enviando}
              className="rounded-full bg-orange px-6 py-2.5 font-display font-bold text-white hover:bg-orange-dark disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar atividade ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
