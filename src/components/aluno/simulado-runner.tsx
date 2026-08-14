"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { submeterSimulado, type ItemGabarito, type ResultadoSimulado } from "@/app/(aluno)/aluno/simulados/[id]/actions";
import { ImagensQuestao } from "./imagens-questao";
import { CartaoQuestao, AlternativaDoGabarito } from "./cartao-questao";
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
        <div className="rounded-2xl border border-app-line bg-app-card p-8 text-center">
          <span className="mx-auto block h-1 w-10 rounded-full bg-orange" />
          <h1 className="mt-2 font-display text-2xl font-bold text-app-txt">Simulado concluído!</h1>
          <p className="mt-2 text-app-sub">
            Você acertou {resultado.acertos} de {resultado.total} questões.
          </p>

          {/* Nota ponderada em destaque + nota simples menor */}
          <div className="mt-4 flex flex-col items-center gap-1">
            <p className="text-xs font-bold uppercase tracking-widest text-app-faint">{rotuloNota}</p>
            <p className="font-display text-5xl font-extrabold text-orange">{resultado.notaFacape}%</p>
            <p className="text-xs text-app-faint">
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
              className="rounded-full border border-app-line bg-app-chip px-6 py-3 font-display font-semibold text-app-txt"
            >
              Voltar às atividades
            </Link>
          </div>
        </div>

        {/* Desempenho por matéria — o "raio-x" do simulado */}
        {resultado.desempenhoPorMateria.length > 0 && (
          <div className="mt-6 rounded-2xl border border-app-line bg-app-card p-6">
            <h2 className="font-display font-bold text-app-txt">Desempenho por matéria</h2>
            <p className="mt-1 text-xs text-app-faint">
              {`Ordenado do maior peso ${nomeVestibular === "vestibular" ? "no vestibular" : `na ${nomeVestibular}`} pro menor.`}
            </p>
            <div className="mt-4 space-y-3">
              {[...resultado.desempenhoPorMateria]
                .sort((a, b) => b.peso - a.peso || b.precisao - a.precisao)
                .map((m) => {
                  // Classes escritas por inteiro e que EXISTEM neste tema:
                  // `bg-green-500`/`bg-red-400` não são geradas (ver
                  // tailwind.config.ts), e a barra saía sem cor nenhuma.
                  const cor = m.precisao >= 70 ? "bg-app-green" : m.precisao >= 40 ? "bg-orange" : "bg-app-red";
                  return (
                    <div key={m.materia}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-app-txt">
                          {m.materia}
                          <span className="ml-2 rounded-full bg-app-chip px-2 py-0.5 text-xs font-bold text-app-sub">
                            peso {m.peso}
                          </span>
                        </span>
                        <span className="text-app-sub">
                          {m.precisao}% ({m.acertos}/{m.total})
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-app-chip">
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
              <div key={item.questaoId} className="rounded-2xl border border-app-line bg-app-card p-5">
                <p className="text-xs font-semibold text-app-faint">Questão {i + 1}</p>
                <p className="mt-1 whitespace-pre-line font-display font-semibold text-app-txt">{item.enunciado}</p>
                <ImagensQuestao imagens={item.imagens} />
                <div className="mt-3 space-y-1.5">
                  {item.alternativas.map((alt) => (
                    <AlternativaDoGabarito
                      key={alt.id}
                      alt={alt}
                      correta={alt.id === item.respostaCorreta}
                      escolhidaErrada={alt.id === item.escolhida && !item.correta}
                    />
                  ))}
                </div>
                {!item.escolhida && (
                  <p className="mt-2 text-xs font-semibold text-orange">Você não respondeu esta questão.</p>
                )}
                {item.explicacao && (
                  <p className="mt-3 rounded-xl border border-app-line bg-app-bg p-3 text-sm text-app-sub">
                    {item.explicacao}
                  </p>
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
      <div className="mx-auto max-w-md rounded-2xl border border-app-line bg-app-card p-8 text-center">
        <h1 className="font-display text-xl font-bold text-app-txt">{titulo}</h1>
        <p className="mt-3 text-sm text-app-sub">
          Este simulado tem questões de língua estrangeira. Qual idioma você vai fazer?
        </p>
        <p className="mt-1 text-xs text-app-faint">
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
              className="rounded-[14px] border-[1.5px] border-app-line bg-app-bg p-4 font-display font-bold text-app-txt transition hover:border-orange"
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-app-line bg-app-card p-4">
        <div>
          <p className="font-display font-bold text-app-txt">{titulo}</p>
          <p className="text-xs text-app-sub">
            {respondidas} de {questoesDaProva.length} respondidas
            {redacao ? " · + redação" : ""}
            {idioma ? ` · ${idioma === "ingles" ? "Inglês" : "Espanhol"}` : ""}
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-2 font-display text-lg font-bold ${
            segundosRestantes < 60 ? "bg-app-red-soft text-app-red" : "bg-app-chip text-app-txt"
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
            aria-current={i === indice ? "true" : undefined}
            className={`h-9 w-9 rounded-lg border text-sm font-bold ${
              i === indice
                ? "border-orange bg-orange text-white"
                : respostas[q.id]
                ? "border-app-green bg-app-green-soft text-app-green-deep"
                : "border-app-line bg-app-card text-app-sub"
            }`}
          >
            {i + 1}
          </button>
        ))}
        {redacao && (
          <button
            onClick={() => setIndice(questoesDaProva.length)}
            className={`h-9 rounded-lg border px-3 text-xs font-extrabold uppercase tracking-wide ${
              naRedacao ? "border-orange bg-orange text-white" : "border-app-line bg-app-card text-app-sub"
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
        <div className="mt-4 rounded-2xl border border-app-line bg-app-card p-6 sm:p-8">
          <span className="rounded-full bg-app-orange-soft px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-orange">
            Redação
          </span>
          <h2 className="mt-4 font-display text-lg font-bold text-app-txt">{redacao.tema}</h2>

          {redacao.textos_motivadores && (
            <div className="mt-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-app-faint">Textos motivadores</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-app-txt">
                {redacao.textos_motivadores}
              </p>
            </div>
          )}

          {redacao.instrucoes && (
            <div className="mt-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-app-faint">Instruções</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-app-txt">{redacao.instrucoes}</p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-app-line bg-app-bg p-4 text-sm leading-relaxed text-app-sub">
            <p className="font-bold text-app-txt">Como fazer esta redação</p>
            <p className="mt-1">
              Não há espaço para escrever aqui na plataforma. Escreva à mão, no caderno, durante o próprio tempo deste
              simulado — o cronômetro acima é o mesmo. Ao terminar, você pode enviar sua redação para a professora pelo
              fluxo de correção em <span className="font-semibold">Redação</span>.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setIndice((i) => Math.max(0, i - 1))}
              className="rounded-full border border-app-line px-5 py-2.5 font-semibold text-app-sub"
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
      <CartaoQuestao
        questao={questao}
        posicao={indice + 1}
        total={totalItens}
        rotuloProgresso={`${indice + 1} de ${totalItens} neste simulado`}
        direita={<span>{Object.keys(respostas).length} respondida(s)</span>}
        escolhida={respostas[questao.id] ?? null}
        // Sem correção durante a prova: o gabarito só aparece no envio, que é
        // o que separa a experiência de simulado da de prática.
        respostaCorreta={null}
        onEscolher={(alt) => setRespostas((r) => ({ ...r, [questao.id]: alt }))}
      >
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setIndice((i) => Math.max(0, i - 1))}
            disabled={indice === 0}
            className="rounded-full border border-app-line px-5 py-2.5 font-semibold text-app-sub disabled:opacity-30"
          >
            ← Anterior
          </button>

          {indice < totalItens - 1 ? (
            <button
              onClick={() => setIndice((i) => i + 1)}
              className="rounded-full bg-orange px-6 py-2.5 font-display font-bold text-white hover:bg-orange-dark"
            >
              {indice === questoesDaProva.length - 1 && redacao ? "Ir para a redação →" : "Próxima questão →"}
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
      </CartaoQuestao>
      )}
    </div>
  );
}
