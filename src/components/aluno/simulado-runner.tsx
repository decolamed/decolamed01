"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { submeterSimulado, type ItemGabarito, type ResultadoSimulado } from "@/app/(aluno)/aluno/simulados/[id]/actions";
import { ImagensQuestao } from "./imagens-questao";
import { IdentificacaoQuestao } from "./identificacao-questao";
import { filtrarPorIdioma } from "@/lib/site/idioma-aluno";

interface QuestaoSimulado {
  id: string;
  enunciado: string;
  alternativas: { id: string; texto: string }[];
  materia: string;
  imagens: { url: string; legenda: string | null; ordem: number }[];
  // Origem: num simulado ela vale ainda mais, porque a experiência é a de
  // uma prova e o aluno precisa saber de qual caderno a questão saiu.
  prova_nome?: string | null;
  modalidade?: string | null;
  ano?: number | null;
  semestre?: number | null;
  numero_questao?: number | null;
  fonte?: string | null;
  anulada?: boolean | null;
}

export interface PropostaRedacao {
  tema: string;
  textos_motivadores?: string | null;
  instrucoes?: string | null;
}

export function SimuladoRunner({
  simuladoId,
  titulo,
  tempoMinutos,
  questoes,
  rotuloNota,
  nomeVestibular,
  variavelIdioma = false,
  idiomaDoBriefing = null,
  redacao = null
}: {
  simuladoId: string;
  titulo: string;
  tempoMinutos: number;
  questoes: QuestaoSimulado[];
  // Rótulo da nota ponderada e nome do vestibular vêm de
  // /admin/configuracoes (ver lib/site/marca.ts) — nada de instituição
  // escrita no código.
  rotuloNota: string;
  nomeVestibular: string;
  /** Item 16: o simulado tem questões de Inglês E Espanhol. */
  variavelIdioma?: boolean;
  /** Idioma já escolhido no briefing — vira a sugestão inicial. */
  idiomaDoBriefing?: "ingles" | "espanhol" | null;
  /** Item 17: proposta de redação, quando o admin cadastrou uma. */
  redacao?: PropostaRedacao | null;
}) {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [segundosRestantes, setSegundosRestantes] = useState(tempoMinutos * 60);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoSimulado | null>(null);
  const [verGabarito, setVerGabarito] = useState(false);
  // Item 16.2: com a variável ligada, o simulado só começa depois de o aluno
  // dizer qual idioma vai fazer. Sem escolha, ele veria as questões dos dois
  // e seria avaliado por questões que nem deveria responder.
  const [idioma, setIdioma] = useState<"ingles" | "espanhol" | null>(
    variavelIdioma ? idiomaDoBriefing : null
  );

  // Questões efetivamente na prova DESTE aluno. As do idioma não escolhido
  // não aparecem, não contam no total e não entram na nota — o servidor
  // aplica o mesmo corte em submeterSimulado(), então a tela e o cálculo
  // nunca divergem.
  const questoesDaProva = useMemo(
    () => (variavelIdioma ? filtrarPorIdioma(questoes, idioma) : questoes),
    [questoes, variavelIdioma, idioma]
  );

  // Item 17.2: a redação é o último item, depois das questões objetivas.
  const totalItens = questoesDaProva.length + (redacao ? 1 : 0);
  const naRedacao = Boolean(redacao) && indice >= questoesDaProva.length;
  const questao = questoesDaProva[indice];

  async function enviar() {
    if (enviando || resultado) return;
    setEnviando(true);
    const res = await submeterSimulado(simuladoId, respostas, idioma);
    setResultado(res);
    setEnviando(false);
  }

  // Cronômetro regressivo — envia automaticamente quando chega a zero.
  useEffect(() => {
    if (resultado) return;
    if (segundosRestantes <= 0) {
      enviar();
      return;
    }
    const t = setTimeout(() => setSegundosRestantes((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundosRestantes, resultado]);

  const tempoFormatado = useMemo(() => {
    const m = Math.floor(segundosRestantes / 60);
    const s = segundosRestantes % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [segundosRestantes]);

  const respondidas = Object.keys(respostas).length;

  // ---------- TELA DE RESULTADO ----------
  if (resultado) {
    return (
      <div>
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <span className="mx-auto block h-1 w-10 rounded-full bg-orange" />
          <h1 className="mt-2 font-display text-2xl font-bold text-navy-dark">Simulado concluído!</h1>
          <p className="mt-2 text-navy-dark/70">
            Você acertou {resultado.acertos} de {resultado.total} questões.
          </p>

          {/* Nota ponderada em destaque + nota simples menor */}
          <div className="mt-4 flex flex-col items-center gap-1">
            <p className="text-xs font-bold uppercase tracking-widest text-navy-dark/50">{rotuloNota}</p>
            <p className="font-display text-5xl font-extrabold text-orange">{resultado.notaFacape}%</p>
            <p className="text-xs text-navy-dark/50">
              Acerto simples: {resultado.nota}% · calculado pelos pesos oficiais das disciplinas
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => setVerGabarito((v) => !v)}
              className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
            >
              {verGabarito ? "Esconder gabarito comentado" : "Ver gabarito comentado"}
            </button>
            <Link
              href="/aluno/atividades"
              className="rounded-full border border-navy/20 px-6 py-3 font-display font-semibold text-navy-dark hover:bg-navy/5"
            >
              Voltar às atividades
            </Link>
          </div>
        </div>

        {/* Desempenho por matéria — o "raio-x" do simulado */}
        {resultado.desempenhoPorMateria.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow">
            <h2 className="font-display font-bold text-navy-dark">Desempenho por matéria</h2>
            <p className="mt-1 text-xs text-navy-dark/50">
              {`Ordenado do maior peso ${nomeVestibular === "vestibular" ? "no vestibular" : `na ${nomeVestibular}`} pro menor.`}
            </p>
            <div className="mt-4 space-y-3">
              {[...resultado.desempenhoPorMateria]
                .sort((a, b) => b.peso - a.peso || b.precisao - a.precisao)
                .map((m) => {
                  const cor = m.precisao >= 70 ? "bg-green-500" : m.precisao >= 40 ? "bg-orange" : "bg-red-400";
                  return (
                    <div key={m.materia}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-navy-dark">
                          {m.materia}
                          <span className="ml-2 rounded-full bg-navy/5 px-2 py-0.5 text-xs font-bold text-navy-dark/60">
                            peso {m.peso}
                          </span>
                        </span>
                        <span className="text-navy-dark/60">
                          {m.precisao}% ({m.acertos}/{m.total})
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-navy/10">
                        <div className={`h-full ${cor}`} style={{ width: `${m.precisao}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {verGabarito && (
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
                      <p
                        key={alt.id}
                        className={`rounded-lg p-2 text-sm ${
                          éCorreta ? "bg-green-50 text-green-800" : éEscolhidaErrada ? "bg-red-50 text-red-700" : "text-navy-dark/70"
                        }`}
                      >
                        <span className="font-bold">{alt.id.toUpperCase()})</span> {alt.texto}
                      </p>
                    );
                  })}
                </div>
                {!item.escolhida && (
                  <p className="mt-2 text-xs font-semibold text-orange-dark">Você não respondeu esta questão.</p>
                )}
                {item.explicacao && (
                  <p className="mt-3 rounded-lg bg-navy/5 p-3 text-sm text-navy-dark/80">{item.explicacao}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- TELA DA PROVA ----------
  // ---------- ESCOLHA DE IDIOMA (item 16.2) ----------
  // Vem antes de tudo, inclusive do cronômetro: o tempo só começa a correr
  // depois que o aluno sabe qual prova vai fazer.
  if (variavelIdioma && !idioma) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <h1 className="font-display text-xl font-bold text-navy-dark">{titulo}</h1>
        <p className="mt-3 text-sm text-navy-dark/70">
          Este simulado tem questões de língua estrangeira. Qual idioma você vai fazer?
        </p>
        <p className="mt-1 text-xs text-navy-dark/50">
          Você responde apenas às questões do idioma escolhido, e só elas contam na sua nota.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {([
            { valor: "ingles", rotulo: "Inglês" },
            { valor: "espanhol", rotulo: "Espanhol" }
          ] as const).map((op) => (
            <button
              key={op.valor}
              onClick={() => setIdioma(op.valor)}
              className="rounded-xl border-2 border-navy/15 p-4 font-display font-bold text-navy-dark transition hover:border-orange hover:bg-orange/5"
            >
              {op.rotulo}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow">
        <div>
          <p className="font-display font-bold text-navy-dark">{titulo}</p>
          <p className="text-xs text-navy-dark/50">
            {respondidas} de {questoesDaProva.length} respondidas
            {redacao ? " · + redação" : ""}
            {idioma ? ` · ${idioma === "ingles" ? "Inglês" : "Espanhol"}` : ""}
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-2 font-display text-lg font-bold ${
            segundosRestantes < 60 ? "bg-red-50 text-red-600" : "bg-navy/5 text-navy-dark"
          }`}
        >
          {tempoFormatado}
        </span>
      </div>

      {/* Grade de navegação entre questões (+ redação no fim, se houver) */}
      <div className="mt-4 flex flex-wrap gap-2">
        {questoesDaProva.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setIndice(i)}
            className={`h-9 w-9 rounded-lg text-sm font-semibold ${
              i === indice
                ? "bg-orange text-white"
                : respostas[q.id]
                ? "bg-navy text-white"
                : "bg-white text-navy-dark shadow"
            }`}
          >
            {i + 1}
          </button>
        ))}
        {redacao && (
          <button
            onClick={() => setIndice(questoesDaProva.length)}
            className={`h-9 rounded-lg px-3 text-xs font-extrabold uppercase tracking-wide ${
              naRedacao ? "bg-orange text-white" : "bg-white text-navy-dark shadow"
            }`}
          >
            Redação
          </button>
        )}
      </div>

      {/* ---------- REDAÇÃO (item 17) ----------
          Só a proposta. Não existe campo de digitação nem upload aqui de
          propósito: o aluno escreve à mão, dentro do mesmo cronômetro, e
          envia depois pelo fluxo de correção que já existe. */}
      {naRedacao && redacao ? (
        <div className="mt-4 rounded-2xl bg-white p-6 shadow sm:p-8">
          <span className="rounded-full bg-orange/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-orange">
            Redação
          </span>
          <h2 className="mt-4 font-display text-lg font-bold text-navy-dark">{redacao.tema}</h2>

          {redacao.textos_motivadores && (
            <div className="mt-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40">Textos motivadores</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-dark">
                {redacao.textos_motivadores}
              </p>
            </div>
          )}

          {redacao.instrucoes && (
            <div className="mt-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40">Instruções</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-dark">{redacao.instrucoes}</p>
            </div>
          )}

          <div className="mt-5 rounded-xl bg-navy/5 p-4 text-sm leading-relaxed text-navy-dark/80">
            <p className="font-bold text-navy-dark">Como fazer esta redação</p>
            <p className="mt-1">
              Não há espaço para escrever aqui na plataforma. Escreva à mão, no caderno, durante o próprio tempo deste
              simulado — o cronômetro acima é o mesmo. Ao terminar, você pode enviar sua redação para a professora pelo
              fluxo de correção em <span className="font-semibold">Redação</span>.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setIndice((i) => Math.max(0, i - 1))}
              className="rounded-full border border-navy/20 px-5 py-2.5 font-semibold text-navy-dark"
            >
              ← Anterior
            </button>
            <button
              onClick={() => {
                if (confirm(`Enviar o simulado? Você respondeu ${respondidas} de ${questoesDaProva.length} questões.`))
                  enviar();
              }}
              disabled={enviando}
              className="rounded-full bg-orange px-6 py-2.5 font-display font-bold text-white hover:bg-orange-dark disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar simulado"}
            </button>
          </div>
        </div>
      ) : (
      <div className="mt-4 rounded-2xl bg-white p-6 shadow sm:p-8">
        {/* Mesma faixa de identificação da atividade: linguagem visual
            compartilhada, com a numeração da prova de origem em destaque
            porque aqui a experiência é a de um caderno de prova. */}
        <IdentificacaoQuestao questao={questao} posicao={indice + 1} className="mb-4" />
        <p className="whitespace-pre-line font-display text-lg font-semibold text-navy-dark">{questao.enunciado}</p>
        <ImagensQuestao imagens={questao.imagens} />

        <div className="mt-5 space-y-2">
          {questao.alternativas.map((alt) => (
            <button
              key={alt.id}
              onClick={() => setRespostas((r) => ({ ...r, [questao.id]: alt.id }))}
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${
                respostas[questao.id] === alt.id ? "border-orange bg-orange/5" : "border-navy/15 hover:border-orange/50"
              }`}
            >
              <span className="font-display font-bold text-navy-dark">{alt.id.toUpperCase()})</span>
              <span className="text-navy-dark">{alt.texto}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setIndice((i) => Math.max(0, i - 1))}
            disabled={indice === 0}
            className="rounded-full border border-navy/20 px-5 py-2.5 font-semibold text-navy-dark disabled:opacity-30"
          >
            ← Anterior
          </button>

          {indice < totalItens - 1 ? (
            <button
              onClick={() => setIndice((i) => i + 1)}
              className="rounded-full bg-navy px-5 py-2.5 font-semibold text-white"
            >
              {indice === questoesDaProva.length - 1 && redacao ? "Ir para a redação →" : "Próxima →"}
            </button>
          ) : (
            <button
              onClick={() => {
                if (confirm(`Enviar o simulado? Você respondeu ${respondidas} de ${questoesDaProva.length} questões.`))
                  enviar();
              }}
              disabled={enviando}
              className="rounded-full bg-orange px-6 py-2.5 font-display font-bold text-white hover:bg-orange-dark disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar simulado"}
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
