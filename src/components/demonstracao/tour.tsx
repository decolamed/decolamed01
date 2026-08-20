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

type Etapa = "painel" | "questao" | "recursos";

const ETAPAS: { id: Etapa; rotulo: string }[] = [
  { id: "painel", rotulo: "Painel" },
  { id: "questao", rotulo: "Questão" },
  { id: "recursos", rotulo: "Recursos" }
];

export function ChamadaDeCompraCompacta({ destino, ehCompra }: { destino: string; ehCompra: boolean }) {
  return <ChamadaDeCompra destino={destino} ehCompra={ehCompra} />;
}

export function TourDaDemonstracao({ destino, ehCompra }: { destino: string; ehCompra: boolean }) {
  const [etapa, setEtapa] = useState<Etapa>("painel");
  const [escolha, setEscolha] = useState<string | null>(null);
  const [respondida, setRespondida] = useState(false);

  const acertou = escolha === RESPOSTA_CORRETA_DEMO;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-4 sm:px-6">
      <PassosDaJornada atual={etapa} onIr={setEtapa} />

      <div className="mt-5">
        {etapa === "painel" && <Painel onAvancar={() => setEtapa("questao")} />}

        {etapa === "questao" && (
          <Questao
            escolha={escolha}
            respondida={respondida}
            acertou={acertou}
            onEscolher={setEscolha}
            onConfirmar={() => setRespondida(true)}
            onAvancar={() => setEtapa("recursos")}
          />
        )}

        {etapa === "recursos" && <Recursos destino={destino} ehCompra={ehCompra} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────── os três passos ─
function PassosDaJornada({ atual, onIr }: { atual: Etapa; onIr: (e: Etapa) => void }) {
  const indiceAtual = ETAPAS.findIndex((e) => e.id === atual);

  return (
    <nav aria-label="Etapas da demonstração" className="flex gap-2">
      {ETAPAS.map((e, i) => {
        const ativo = i === indiceAtual;
        const passado = i < indiceAtual;
        return (
          <button
            key={e.id}
            onClick={() => onIr(e.id)}
            aria-current={ativo ? "step" : undefined}
            className={`flex-1 rounded-full px-3 py-2 text-[11px] font-extrabold uppercase tracking-wide transition ${
              ativo
                ? "bg-orange text-white"
                : passado
                  ? "bg-app-chip text-app-txt"
                  : "bg-app-chip text-app-faint"
            }`}
          >
            {e.rotulo}
          </button>
        );
      })}
    </nav>
  );
}

// ──────────────────────────────────────────────────────────── etapa 1: painel ─
function Painel({ onAvancar }: { onAvancar: () => void }) {
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
        <ul className="mt-2.5 space-y-2">
          {MISSOES_DE_HOJE.map((m) => (
            <li
              key={m.titulo}
              className="flex items-center gap-3 rounded-xl border border-app-line bg-app-card2 px-3 py-2.5"
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

      <BotaoPrincipal onClick={onAvancar}>Responder uma questão →</BotaoPrincipal>
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
        Esta é a tela real de questões da plataforma. Escolha uma alternativa e confirme.
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

// ────────────────────────────────────────────────────────── etapa 3: recursos ─
function Recursos({ destino, ehCompra }: { destino: string; ehCompra: boolean }) {
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
  if (!destaque) {
    return (
      <Link
        href={destino}
        className="shrink-0 rounded-full bg-orange px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-orange-dark"
      >
        {ehCompra ? "Adquira já" : "Falar com a equipe"}
      </Link>
    );
  }

  return (
    <>
      <Link
        href={destino}
        className="block w-full rounded-full bg-orange px-6 py-4 text-center font-display text-lg font-extrabold text-white shadow-lg shadow-orange/20 hover:bg-orange-dark"
      >
        {ehCompra ? "Adquira já a plataforma" : "Falar com a equipe"}
      </Link>
      {ehCompra && (
        <p className="mt-2 text-[11px] font-semibold text-app-faint">
          Você vai para a página de compra, com valor e benefícios.
        </p>
      )}
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
