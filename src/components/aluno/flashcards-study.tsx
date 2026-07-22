"use client";

import { useState, useTransition } from "react";
import { registrarRevisao } from "@/app/(aluno)/aluno/flashcards/actions";
import type { Flashcard } from "@/types/database";

export function FlashcardsStudy({ cards }: { cards: Flashcard[] }) {
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [lembrados, setLembrados] = useState(0);
  const [, startTransition] = useTransition();

  const card = cards[indice];

  if (!card) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <p className="text-navy-dark/70">Nenhum flashcard disponível com esse filtro no momento.</p>
      </div>
    );
  }

  function marcar(lembrou: boolean) {
    startTransition(() => {
      registrarRevisao(card.id, lembrou);
    });
    if (lembrou) setLembrados((n) => n + 1);
    setVirado(false);
    setIndice((i) => i + 1);
  }

  const terminou = indice >= cards.length;

  if (terminou) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <span className="text-4xl">🏁</span>
        <h2 className="mt-3 font-display text-xl font-bold text-navy-dark">Revisão concluída!</h2>
        <p className="mt-2 text-navy-dark/70">
          Você lembrou {lembrados} de {cards.length} flashcards.
        </p>
        <button
          onClick={() => {
            setIndice(0);
            setLembrados(0);
            setVirado(false);
          }}
          className="mt-5 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Revisar de novo
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-navy-dark/60">
        <span>
          Cartão {indice + 1} de {cards.length}
        </span>
        <span className="rounded-full bg-navy/5 px-3 py-1 font-semibold">{card.materia}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
        <div className="h-full bg-orange transition-all" style={{ width: `${(indice / cards.length) * 100}%` }} />
      </div>

      <button
        onClick={() => setVirado((v) => !v)}
        className="mt-6 flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl p-8 text-center shadow transition"
        style={{ background: virado ? "#F2F7FB" : "linear-gradient(160deg,#0d4a79,#01395E)" }}
      >
        <span className={`text-xs font-semibold uppercase tracking-widest ${virado ? "text-navy-dark/50" : "text-white/50"}`}>
          {virado ? "Resposta" : "Pergunta — toque para virar"}
        </span>
        <p className={`mt-3 font-display text-xl font-bold ${virado ? "text-navy-dark" : "text-white"}`}>
          {virado ? card.verso : card.frente}
        </p>
      </button>

      {virado && (
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => marcar(false)}
            className="flex-1 rounded-full border-2 border-red-400 px-6 py-3 font-display font-bold text-red-500 hover:bg-red-50"
          >
            Errei
          </button>
          <button
            onClick={() => marcar(true)}
            className="flex-1 rounded-full bg-green-600 px-6 py-3 font-display font-bold text-white hover:bg-green-700"
          >
            Acertei ✓
          </button>
        </div>
      )}
    </div>
  );
}
