"use client";

import { useState } from "react";
import Link from "next/link";
import { CartaoQuestao } from "@/components/aluno/cartao-questao";
import { ResultadoDaResposta } from "@/components/aluno/identificacao-questao";
import { Icon } from "@/components/admin/icon";
import {
  ALUNO_FICTICIO,
  DESEMPENHO_POR_MATERIA,
  MISSOES_DE_HOJE,
  QUESTAO_DEMO,
  RESPOSTA_CORRETA_DEMO,
  EXPLICACAO_DEMO,
  FLASHCARDS_DEMO,
  AULA_DEMO,
  RECURSOS
} from "@/lib/demonstracao/dados";

// ============================================================================
// A DEMONSTRAÇÃO
//
// Uma jornada curta, na ordem em que a plataforma faz sentido: o painel do
// aluno, uma questão de verdade para responder, o resultado com resolução, o
// Copiloto reagindo ao erro, e o mapa dos recursos.
//
// A tela da questão NÃO é uma imitação: são os mesmos `CartaoQuestao` e
// `ResultadoDaResposta` que o aluno pagante usa. Era o único jeito de a
// promessa "veja como é estudar aqui" ser honesta — e evita manter duas
// versões da mesma tela, que é como uma demonstração começa a mentir sem
// ninguém perceber.
//
// Todo o estado vive neste componente, em memória. Nada é enviado a lugar
// nenhum: não há server action, não há fetch, não há Supabase.
// ============================================================================

type Etapa = "painel" | "aula" | "questao" | "flashcard" | "recursos";

/**
 * As etapas, em ordem, e o que cada uma É.
 *
 * A frase de `oQueE` aparece no topo a cada passo. Sem ela o visitante via
 * telas bonitas sem saber que ferramenta estava usando — "mostrar o que é
 * cada coisa" é metade do trabalho de uma demonstração.
 */
const ETAPAS: { id: Etapa; rotulo: string; oQueE: string }[] = [
  {
    id: "painel",
    rotulo: "Painel",
    oQueE: "O painel de bordo: onde o aluno abre o app e vê o dia dele, o progresso e o que falta fazer."
  },
  {
    id: "aula",
    rotulo: "Aula",
    oQueE: "A videoaula do dia, que abre dentro da plataforma — sem procurar nada no YouTube."
  },
  {
    id: "questao",
    rotulo: "Questão",
    oQueE: "O banco de questões: você responde e recebe a correção e a resolução na hora."
  },
  {
    id: "flashcard",
    rotulo: "Flashcards",
    oQueE: "A revisão rápida, para o que precisa ficar na memória até o dia da prova."
  },
  {
    id: "recursos",
    rotulo: "Recursos",
    oQueE: "O Copiloto reagindo ao seu erro, e o resto do que tem dentro da plataforma."
  }
];

/**
 * O link do YouTube no formato que um iframe aceita.
 *
 * Mesma conversão que o app do aluno faz (`youtubeEmbedUrl` em
 * decola-app.tsx): a biblioteca guarda o endereço como a pessoa copiou —
 * `youtu.be/…`, `watch?v=…`, `shorts/…` — e só `/embed/` toca embutido.
 */
function urlIncorporavel(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/i);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

/**
 * "Falar com a equipe" — o botão do topo, que abre o WhatsApp.
 *
 * `target="_blank"` de propósito: no celular o link do wa.me sai para o
 * aplicativo do WhatsApp, e sem isto a demonstração seria FECHADA no caminho.
 * Quem volta do WhatsApp precisa reencontrar o tour onde parou.
 */
export function FalarComAEquipe({ whatsapp }: { whatsapp: string }) {
  return (
    <a
      href={whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 rounded-full border border-app-line bg-app-chip px-3 py-1.5 text-[11px] font-extrabold text-app-txt hover:border-orange/50"
    >
      Falar com a equipe
    </a>
  );
}

export function TourDaDemonstracao({
  destino,
  ehCompra,
  whatsapp
}: {
  destino: string;
  ehCompra: boolean;
  whatsapp: string;
}) {
  const [etapa, setEtapa] = useState<Etapa>("painel");
  // Até onde o visitante já CHEGOU. Voltar é livre; pular à frente não é —
  // sem isso dava para ir do painel ao encerramento sem ver a aula nem
  // responder nada, e a demonstração deixava de demonstrar.
  const [maxIndice, setMaxIndice] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [cartaoVirado, setCartaoVirado] = useState(false);
  const [cartaoJulgado, setCartaoJulgado] = useState<"acertei" | "errei" | null>(null);
  const [indiceCartao, setIndiceCartao] = useState(0);

  // Passar ao próximo cartão zera o gesto: o seguinte começa com a pergunta
  // à mostra, como numa sessão de verdade.
  function proximoCartao() {
    setIndiceCartao((i) => i + 1);
    setCartaoVirado(false);
    setCartaoJulgado(null);
  }

  const indiceAtual = ETAPAS.findIndex((e) => e.id === etapa);

  /** Vai para uma etapa, respeitando a ordem. */
  function irPara(destinoEtapa: Etapa) {
    const i = ETAPAS.findIndex((e) => e.id === destinoEtapa);
    // O passo seguinte é sempre permitido: é ele que faz a jornada andar.
    if (i > maxIndice + 1) return;
    setEtapa(destinoEtapa);
    setMaxIndice((m) => Math.max(m, i));
  }

  const acertou = escolha === RESPOSTA_CORRETA_DEMO;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-4 sm:px-6">
      <PassosDaJornada atual={etapa} maxIndice={maxIndice} onIr={irPara} />

      <div className="mt-5">
        {etapa === "painel" && (
          <Painel onAvancar={() => irPara("aula")} onAbrir={irPara} maxIndice={maxIndice} />
        )}

        {etapa === "aula" && <Aula onAvancar={() => irPara("questao")} />}

        {etapa === "questao" && (
          <Questao
            escolha={escolha}
            respondida={respondida}
            acertou={acertou}
            onEscolher={setEscolha}
            onConfirmar={() => setRespondida(true)}
            onAvancar={() => irPara("flashcard")}
          />
        )}

        {etapa === "flashcard" && (
          <Flashcard
            indice={indiceCartao}
            virado={cartaoVirado}
            julgado={cartaoJulgado}
            onVirar={() => setCartaoVirado((v) => !v)}
            onJulgar={setCartaoJulgado}
            onProximo={proximoCartao}
            onAvancar={() => irPara("recursos")}
          />
        )}

        {etapa === "recursos" && <Recursos destino={destino} ehCompra={ehCompra} whatsapp={whatsapp} />}
      </div>

      {/* A COMPRA ACOMPANHA O VISITANTE EM TODOS OS PASSOS.
          Ela ficava só no encerramento, e quem se convencia no passo 2 tinha
          de percorrer o resto para conseguir comprar — ou desistir. Agora a
          barra fica presa ao rodapé desde o primeiro passo.

          No último passo ela some, porque ali o mesmo botão já está no meio da
          tela, em tamanho grande: duas chamadas idênticas empilhadas diriam ao
          visitante que ele perdeu alguma coisa. */}
      {etapa !== "recursos" && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-app-line bg-app-card/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto max-w-2xl">
            <ChamadaDeCompra destino={destino} ehCompra={ehCompra} destaque />
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────── o progresso ─
//
// Eram cinco abas com o rótulo escrito, dividindo a largura igualmente. Em
// 360px "FLASHCARD" e "RECURSOS" não cabem, e como cada aba tinha largura
// mínima de conteúdo a faixa empurrava a PÁGINA para o lado: aparecia uma
// borda branca à direita e o último passo ficava cortado.
//
// Trocado por bolinhas mais o nome do passo atual. Cabe em qualquer largura
// sem rolagem lateral, e diz melhor o que a jornada virou: uma sequência, não
// um menu de onde se escolhe qualquer ponto.
function PassosDaJornada({
  atual,
  maxIndice,
  onIr
}: {
  atual: Etapa;
  maxIndice: number;
  onIr: (e: Etapa) => void;
}) {
  const indiceAtual = ETAPAS.findIndex((e) => e.id === atual);
  const etapaAtual = ETAPAS[indiceAtual];

  return (
    <div>
      <nav aria-label="Etapas da demonstração" className="flex items-center gap-2">
        {ETAPAS.map((e, i) => {
          const alcancada = i <= maxIndice;
          const ativo = i === indiceAtual;
          return (
            <button
              key={e.id}
              onClick={() => onIr(e.id)}
              disabled={!alcancada}
              aria-current={ativo ? "step" : undefined}
              aria-label={`Passo ${i + 1}: ${e.rotulo}${alcancada ? "" : " (ainda não liberado)"}`}
              className={`h-2 flex-1 rounded-full transition ${
                ativo
                  ? "bg-orange"
                  : alcancada
                    ? "cursor-pointer bg-app-sub hover:bg-app-txt"
                    : "cursor-not-allowed bg-app-chip"
              }`}
            />
          );
        })}
      </nav>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-widest text-orange">
          Passo {indiceAtual + 1} de {ETAPAS.length}
        </span>
        <span className="truncate font-display text-sm font-extrabold text-app-txt">
          {etapaAtual.rotulo}
        </span>
      </div>

      <p className="mt-1 text-[13px] font-semibold leading-relaxed text-app-sub">{etapaAtual.oQueE}</p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────── etapa 1: painel ─
function Painel({
  onAvancar,
  onAbrir,
  maxIndice
}: {
  onAvancar: () => void;
  onAbrir: (e: Etapa) => void;
  maxIndice: number;
}) {
  const a = ALUNO_FICTICIO;

  return (
    <div className="space-y-3">
      <Cartao>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-app-faint">Painel de bordo</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-app-txt">Bom voo, {a.nome}! ✈️</h2>
        <p className="mt-1 text-sm font-semibold text-app-sub">
          Dia {a.diaDaRota} de {a.totalDeDias} do seu plano de voo
        </p>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-app-chip">
          <div
            className="h-full rounded-full bg-orange"
            style={{ width: `${Math.round((a.diaDaRota / a.totalDeDias) * 100)}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Numero valor={`${a.xp}`} rotulo="XP" />
          <Numero valor={`Nível ${a.nivel}`} rotulo="Patente" />
          <Numero valor={`${a.sequenciaDias} dias`} rotulo="Sequência" />
          <Numero valor={`${a.precisao}%`} rotulo="Precisão" />
        </div>
      </Cartao>

      <Cartao>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-app-faint">Missões de hoje</p>
        <p className="mt-1 text-[11px] font-semibold text-app-sub">
          As missões abrem de verdade — a demonstração segue a ordem do dia.
        </p>
        <ul className="mt-2.5 space-y-2">
          {MISSOES_DE_HOJE.map((m) => (
            <li key={m.titulo}>
              {/* Botão, e não <li> decorativo: na conta de verdade tocar num
                  item do cronograma é como se estuda.
                  Mas só abre o que a jornada já alcançou (ou o passo logo
                  adiante): deixar qualquer missão pular para o fim é o que
                  fazia o visitante chegar ao encerramento sem ter visto a
                  aula nem respondido nada. A missão travada não vira clique
                  morto — ela diz que vem a seguir. */}
              {(() => {
                const destino = ETAPAS.findIndex((e) => e.id === m.abre);
                const liberada = destino <= maxIndice + 1;
                const Elemento = liberada ? "button" : "div";
                return (
              <Elemento
                {...(liberada ? { onClick: () => onAbrir(m.abre) } : { "aria-disabled": true })}
                className={`flex w-full items-center gap-3 rounded-xl border border-app-line bg-app-card2 px-3 py-2.5 text-left transition ${
                  liberada ? "hover:border-orange/50 hover:bg-app-chip" : "opacity-60"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                    m.concluida ? "bg-app-green-soft text-app-green" : "bg-app-chip text-app-faint"
                  }`}
                >
                  {m.concluida ? "✓" : ""}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-bold ${
                      m.concluida ? "text-app-faint line-through" : "text-app-txt"
                    }`}
                  >
                    {m.titulo}
                  </p>
                  <p className="text-[11px] font-semibold text-app-faint">{m.minutos} min</p>
                </div>
                {m.doCopiloto && (
                  <span className="shrink-0 rounded-full bg-app-orange-soft px-2 py-1 text-[10px] font-extrabold text-app-orange-txt">
                    🤖 Copiloto
                  </span>
                )}
                {liberada ? (
                  <span aria-hidden className="shrink-0 text-app-faint">›</span>
                ) : (
                  <span className="shrink-0 rounded-full bg-app-chip px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-app-faint">
                    a seguir
                  </span>
                )}
              </Elemento>
                );
              })()}
            </li>
          ))}
        </ul>
      </Cartao>

      <Cartao>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-app-faint">Mapa de voo</p>
        <div className="mt-2.5 space-y-2.5">
          {DESEMPENHO_POR_MATERIA.map((m) => (
            <div key={m.materia}>
              <div className="flex items-baseline justify-between text-xs font-bold">
                <span className="text-app-txt">{m.materia}</span>
                <span className={m.precisao >= 70 ? "text-app-green" : "text-app-red"}>{m.precisao}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-app-chip">
                <div
                  className={`h-full rounded-full ${m.precisao >= 70 ? "bg-app-green" : "bg-app-red"}`}
                  style={{ width: `${m.precisao}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Cartao>

      <BotaoPrincipal onClick={onAvancar}>Começar pela aula do dia →</BotaoPrincipal>
    </div>
  );
}

// ────────────────────────────────────────────────────────────── etapa: aula ─
//
// A aula toca AQUI, embutida, e não num link que joga a pessoa para fora da
// demonstração — quem sai para o YouTube não volta. É uma aula real da
// biblioteca da plataforma: o visitante abre exatamente o que um aluno abre.
function Aula({ onAvancar }: { onAvancar: () => void }) {
  const a = AULA_DEMO;
  const embed = urlIncorporavel(a.url);

  return (
    <div className="space-y-3">
      <p className="px-1 text-sm font-semibold text-app-sub">
        Toque no play — é a mesma aula que abre no cronograma do aluno.
      </p>

      <Cartao>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-app-faint">
            Videoaula
          </span>
          <span className="shrink-0 rounded-full bg-app-chip px-2.5 py-1 text-[11px] font-bold text-app-sub">
            {a.materia} · {a.assunto}
          </span>
        </div>

        <h2 className="mt-2 font-display text-lg font-extrabold leading-snug text-app-txt">{a.titulo}</h2>
        <p className="mt-0.5 text-[11px] font-semibold text-app-faint">
          {a.canal} · {a.minutos} min
        </p>

        {embed ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-app-line bg-black">
            {/* 16:9 pelo padding, que funciona em qualquer cliente sem
                depender de aspect-ratio. */}
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={embed}
                title={a.titulo}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        ) : (
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-xl border border-app-line bg-app-card2 p-4 text-center text-sm font-bold text-orange"
          >
            Abrir a aula →
          </a>
        )}

        <div className="mt-4">
          <BotaoPrincipal onClick={onAvancar}>Agora responder uma questão →</BotaoPrincipal>
        </div>
      </Cartao>
    </div>
  );
}

// ─────────────────────────────────────────────────────────── etapa 2: questão ─
function Questao({
  escolha,
  respondida,
  acertou,
  onEscolher,
  onConfirmar,
  onAvancar
}: {
  escolha: string | null;
  respondida: boolean;
  acertou: boolean;
  onEscolher: (id: string) => void;
  onConfirmar: () => void;
  onAvancar: () => void;
}) {
  return (
    <div className="space-y-3">
      <p className="px-1 text-sm font-semibold text-app-sub">
        Escolha uma alternativa e confirme. A tela é a mesma que o aluno usa.
      </p>

      <CartaoQuestao
        questao={QUESTAO_DEMO}
        posicao={1}
        total={1}
        rotuloProgresso="Questão de demonstração"
        escolhida={escolha}
        respostaCorreta={respondida ? RESPOSTA_CORRETA_DEMO : null}
        correta={respondida ? acertou : undefined}
        onEscolher={onEscolher}
        desabilitado={respondida}
        onConfirmar={escolha && !respondida ? onConfirmar : undefined}
      >
        {respondida && (
          <ResultadoDaResposta
            correta={acertou}
            respostaCorreta={RESPOSTA_CORRETA_DEMO}
            explicacao={EXPLICACAO_DEMO}
            // O momento do Copiloto: ele aparece quando o aluno erra, que é
            // exatamente quando ele age na plataforma de verdade.
            revisaoCriada={!acertou}
          >
            <BotaoPrincipal onClick={onAvancar}>
              {acertou ? "Ver os recursos da plataforma →" : "Ver o que o Copiloto fez →"}
            </BotaoPrincipal>
          </ResultadoDaResposta>
        )}
      </CartaoQuestao>
    </div>
  );
}

// ────────────────────────────────────────────────────── etapa 3: flashcard ─
//
// Mesma mecânica da tela real (flashcards-study.tsx): o cartão vira ao toque
// e o aluno julga a própria memória. Aqui o julgamento não grava revisão
// nenhuma — só muda o texto na tela, para a pessoa entender o gesto.
function Flashcard({
  indice,
  virado,
  julgado,
  onVirar,
  onJulgar,
  onProximo,
  onAvancar
}: {
  indice: number;
  virado: boolean;
  julgado: "acertei" | "errei" | null;
  onVirar: () => void;
  onJulgar: (v: "acertei" | "errei") => void;
  onProximo: () => void;
  onAvancar: () => void;
}) {
  const total = FLASHCARDS_DEMO.length;
  // O índice é limitado em vez de reiniciar: passar do último não pode
  // devolver o visitante ao primeiro cartão como se a sessão não acabasse.
  const posicao = Math.min(indice, total - 1);
  const c = FLASHCARDS_DEMO[posicao];
  const ehUltimo = posicao >= total - 1;

  return (
    <div className="space-y-3">
      <p className="px-1 text-sm font-semibold text-app-sub">
        Toque no cartão para virar e depois julgue a sua memória.
      </p>

      <Cartao>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-app-faint">
            Cartão {posicao + 1} de {total}
          </span>
          <span className="rounded-full bg-app-chip px-2.5 py-1 text-[11px] font-bold text-app-sub">
            {c.materia} · {c.assunto}
          </span>
        </div>

        <button
          onClick={onVirar}
          aria-label={virado ? "Ver a pergunta" : "Ver a resposta"}
          className={`mt-3 flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border p-6 text-center transition ${
            virado ? "border-app-green/30 bg-app-green-soft" : "border-app-line bg-app-card2"
          }`}
        >
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-app-faint">
            {virado ? "Resposta" : "Pergunta — toque para virar"}
          </span>
          <p className="mt-3 font-display text-lg font-bold leading-snug text-app-txt">
            {virado ? c.verso : c.frente}
          </p>
        </button>

        {/* Os dois botões só aparecem depois de virar: julgar a própria
            memória antes de ver a resposta não quer dizer nada. */}
        {virado && !julgado && (
          <div className="mt-4 flex gap-2.5">
            <button
              onClick={() => onJulgar("errei")}
              className="flex-1 rounded-full border-2 border-app-red px-4 py-3 font-display text-sm font-bold text-app-red"
            >
              Errei
            </button>
            <button
              onClick={() => onJulgar("acertei")}
              className="flex-1 rounded-full bg-app-green px-4 py-3 font-display text-sm font-bold text-white"
            >
              Acertei ✓
            </button>
          </div>
        )}

        {julgado && (
          <div className="mt-4 rounded-xl border border-app-line bg-app-card2 p-3.5">
            <p className="text-sm font-bold text-app-txt">
              {julgado === "acertei" ? "Boa. 🎯" : "Sem problema. 🔁"}
            </p>
            <p className="mt-1 text-[13px] font-semibold leading-relaxed text-app-sub">
              {julgado === "acertei"
                ? "Na plataforma, um cartão que você acerta volta a aparecer mais adiante — só o suficiente para não esquecer."
                : "Na plataforma, um cartão que você erra volta logo, e volta mais vezes, até parar de escapar."}
            </p>
            <div className="mt-3">
              {ehUltimo ? (
                <BotaoPrincipal onClick={onAvancar}>Ver os recursos da plataforma →</BotaoPrincipal>
              ) : (
                <BotaoPrincipal onClick={onProximo}>Próximo cartão →</BotaoPrincipal>
              )}
            </div>
          </div>
        )}
      </Cartao>
    </div>
  );
}

// ─────────────────────────────────────────────────────────── etapa 4: recursos ─
function Recursos({
  destino,
  ehCompra,
  whatsapp
}: {
  destino: string;
  ehCompra: boolean;
  whatsapp: string;
}) {
  return (
    <div className="space-y-3">
      <Cartao className="border-orange/30 bg-app-orange-soft">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-app-orange-txt">
          🤖 O Copiloto
        </p>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-app-txt">
          Quando você erra, ele não espera você pedir. Identifica o assunto, cria uma revisão e encaixa no
          seu cronograma — no dia em que ela ainda faz diferença.
        </p>
        <div className="mt-3 rounded-xl border border-app-line bg-app-card p-3">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-app-faint">
            Amanhã no seu plano de voo
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span aria-hidden className="text-lg">🔁</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-app-txt">Revisão: Osmose e transporte de membrana</p>
              <p className="text-[11px] font-semibold text-app-faint">
                Adicionada pelo Copiloto · 20 min
              </p>
            </div>
          </div>
        </div>
      </Cartao>

      <Cartao>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-app-faint">
          O que tem dentro
        </p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {RECURSOS.map((r) => (
            <div key={r.titulo} className="rounded-xl border border-app-line bg-app-card2 p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-chip text-orange">
                <Icon name={r.icone} size={16} />
              </span>
              <p className="mt-2 text-sm font-extrabold text-app-txt">{r.titulo}</p>
              <p className="mt-0.5 text-xs font-semibold leading-relaxed text-app-sub">{r.texto}</p>
            </div>
          ))}
        </div>
      </Cartao>

      <Cartao className="text-center">
        <p className="font-display text-2xl font-extrabold text-app-txt">Gostou do que viu?</p>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-app-sub">
          Tenha acesso completo à Decola MED e comece sua jornada rumo à aprovação. Na sua conta, o
          cronograma é montado a partir da sua data de prova e do tempo que você tem.
        </p>
        <div className="mt-5">
          <ChamadaDeCompra destino={destino} ehCompra={ehCompra} destaque />
        </div>

        {/* Quem chegou até aqui e ainda tem dúvida não deveria precisar
            voltar ao topo para achar como perguntar. */}
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-[13px] font-bold text-app-sub underline decoration-app-line underline-offset-4 hover:text-app-txt"
        >
          Prefere tirar uma dúvida antes? Fale com a equipe
        </a>
      </Cartao>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── primitivas ─
function Cartao({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-app-line bg-app-card p-4 sm:p-5 ${className}`}>{children}</div>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-xl bg-app-card2 px-3 py-2.5">
      <p className="font-display text-lg font-extrabold text-app-txt">{valor}</p>
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-app-faint">{rotulo}</p>
    </div>
  );
}

/**
 * O botão que leva à compra.
 *
 * Quem decide o destino é a página (ver lib/demonstracao/destino-da-compra):
 * o plano de origem vence, e na falta dele vale o link que o administrador
 * configurou no painel. Aqui só resta desenhar — e ajustar o texto, porque
 * prometer "Adquira já a plataforma" e abrir um formulário de contato seria
 * enganar quem clicou.
 */
function ChamadaDeCompra({
  destino,
  ehCompra,
  destaque = false
}: {
  destino: string;
  ehCompra: boolean;
  destaque?: boolean;
}) {
  // Endereço de fora da plataforma (o WhatsApp, ou um checkout externo que o
  // administrador tenha configurado) abre em outra aba. Sem isto, o clique
  // FECHA a demonstração — e quem só queria conferir o preço não tem como
  // voltar para onde parou.
  const externo = /^https?:\/\//i.test(destino);

  // O rótulo diz o que o botão FAZ, e o que ele faz muda com o destino.
  // Prometer "Adquira já a plataforma" e abrir uma conversa seria enganar
  // quem clicou; mas mandar quem quer comprar para um botão escrito "falar
  // com a equipe" também esconde a intenção de compra — que é a razão de
  // este botão existir em todos os passos.
  const rotulo = ehCompra
    ? destaque
      ? "Adquira já a plataforma"
      : "Adquira já"
    : destaque
      ? "Quero adquirir a plataforma"
      : "Quero adquirir";

  const classe = destaque
    ? "block w-full rounded-full bg-orange px-6 py-4 text-center font-display text-lg font-extrabold text-white shadow-lg shadow-orange/20 hover:bg-orange-dark"
    : "shrink-0 rounded-full bg-orange px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-orange-dark";

  const botao = externo ? (
    <a href={destino} target="_blank" rel="noopener noreferrer" className={classe}>
      {rotulo}
    </a>
  ) : (
    <Link href={destino} className={classe}>
      {rotulo}
    </Link>
  );

  if (!destaque) return botao;

  return (
    <>
      {botao}
      <p className="mt-2 text-center text-[11px] font-semibold text-app-faint">
        {ehCompra
          ? "Você vai para a página de compra, com valor e benefícios."
          : "Você fala com a equipe no WhatsApp e recebe o link de compra."}
      </p>
    </>
  );
}

function BotaoPrincipal({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-full bg-orange px-6 py-3.5 font-display text-base font-bold text-white hover:bg-orange-dark"
    >
      {children}
    </button>
  );
}
