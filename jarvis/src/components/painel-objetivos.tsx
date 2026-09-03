"use client";

import { useTransition } from "react";
import { alternarObjetivo } from "@/app/(app)/acoes";
import type { Objetivo } from "@/types/banco";

export function PainelObjetivos({ objetivos }: { objetivos: Objetivo[] }) {
  const [salvando, iniciarTransicao] = useTransition();

  if (objetivos.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-tinta-500">
        Nenhum objetivo ainda. Cole o enunciado e peça ao Jarvis para tirar os objetivos de
        aprendizagem dali — ou diga quais são, que ele registra.
      </p>
    );
  }

  const concluidos = objetivos.filter((o) => o.concluido).length;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-tinta-200">
          <div
            className="h-full rounded-full bg-ciano-500 transition-all"
            style={{ width: `${(concluidos / objetivos.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-tinta-500">
          {concluidos}/{objetivos.length}
        </span>
      </div>

      <ul className="space-y-2">
        {objetivos.map((o) => (
          <li key={o.id}>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-snug">
              <input
                type="checkbox"
                checked={o.concluido}
                disabled={salvando}
                onChange={(e) => {
                  const marcado = e.currentTarget.checked;
                  iniciarTransicao(() => void alternarObjetivo(o.id, marcado));
                }}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-tinta-300 accent-ciano-500"
              />
              <span className={o.concluido ? "text-tinta-400 line-through" : "text-tinta-700"}>
                <span className="mr-1 font-mono text-xs text-tinta-400">{o.ordem}.</span>
                {o.texto}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
