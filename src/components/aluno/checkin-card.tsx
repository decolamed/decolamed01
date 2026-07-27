"use client";

import { useTransition } from "react";
import { responderCheckin } from "./checkin-actions";

interface Opcao {
  label: string;
  valor: string;
  descricao: string;
  acao_tipo: string;
  acao_payload: Record<string, unknown>;
}

interface Checkin {
  id: string;
  pergunta: string;
  contexto: string | null;
  opcoes: Opcao[];
}

export function CheckinCard({ checkin }: { checkin: Checkin }) {
  const [pending, start] = useTransition();

  function responder(opcao: Opcao) {
    start(() =>
      responderCheckin(checkin.id, opcao.valor, opcao.acao_tipo, opcao.acao_payload)
    );
  }

  return (
    <div className="rounded-2xl border-2 border-navy bg-navy/5 p-5 shadow-sm">
      {/* Ícone + pergunta */}
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-xl">
          🤖
        </span>
        <div className="flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/50">
            O Copiloto precisa da sua resposta
          </p>
          <p className="mt-1 font-display text-base font-bold leading-snug text-navy-dark">
            {checkin.pergunta}
          </p>
          {checkin.contexto && (
            <p className="mt-1.5 text-sm text-navy-dark/60">{checkin.contexto}</p>
          )}
        </div>
      </div>

      {/* Opções de resposta */}
      <div className="mt-4 flex flex-col gap-2">
        {checkin.opcoes.map((opcao) => (
          <button
            key={opcao.valor}
            onClick={() => responder(opcao)}
            disabled={pending}
            className={`flex flex-col items-start rounded-xl border-2 p-3 text-left transition ${
              opcao.valor === "sim"
                ? "border-orange bg-orange/5 hover:bg-orange/10"
                : "border-navy/15 bg-white hover:bg-navy/5"
            } disabled:opacity-60`}
          >
            <span className={`font-display font-bold ${opcao.valor === "sim" ? "text-orange-dark" : "text-navy-dark"}`}>
              {pending ? "Aplicando..." : opcao.label}
            </span>
            <span className="text-xs text-navy-dark/50">{opcao.descricao}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
