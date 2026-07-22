"use client";

import { useTransition, useState } from "react";
import { marcarMissaoConcluida } from "@/app/(aluno)/aluno/cronograma/actions";

interface Missao {
  id: string;
  data: string;
  titulo: string;
  materia: string | null;
  assunto: string | null;
  tipo: string;
  duracao_minutos: number;
  prioridade: number;
  origem: string;
  motivo_copiloto: string | null;
  concluida: boolean;
}

const ICONE_TIPO: Record<string, string> = {
  aula: "🎬",
  questoes: "🎯",
  flashcards: "🃏",
  simulado: "⏱️",
  revisao: "🔁",
  livre: "☕"
};

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const d = new Date(ano, mes - 1, dia);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

export function CronogramaCopiloto({ missoes, hojeStr }: { missoes: Missao[]; hojeStr: string }) {
  const [pending, startTransition] = useTransition();
  const [otimista, setOtimista] = useState<Record<string, boolean>>({});

  if (missoes.length === 0) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow">
        <p className="text-navy-dark/70">
          Seu Copiloto está calibrando a rota. Assim que houver missões para os próximos dias, elas aparecem
          aqui.
        </p>
      </div>
    );
  }

  // Agrupa missões por data.
  const porData = new Map<string, Missao[]>();
  missoes.forEach((m) => {
    const atual = porData.get(m.data) ?? [];
    atual.push(m);
    porData.set(m.data, atual);
  });

  function toggle(id: string, atual: boolean) {
    const novo = !atual;
    setOtimista((o) => ({ ...o, [id]: novo }));
    startTransition(() => {
      marcarMissaoConcluida(id, novo);
    });
  }

  return (
    <div className="mt-6 space-y-6">
      {Array.from(porData.entries()).map(([data, lista]) => {
        const éHoje = data === hojeStr;
        return (
          <div key={data}>
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                éHoje ? "text-orange-dark" : "text-navy-dark/50"
              }`}
            >
              {éHoje ? "Hoje · " : ""}
              {formatarData(data)}
            </p>
            <div className="mt-2 space-y-2">
              {lista.map((m) => {
                const concluidaExibida = otimista[m.id] ?? m.concluida;
                const éCopiloto = m.origem === "copiloto";
                const corBorda =
                  m.prioridade >= 3
                    ? "border-red-400 bg-red-50"
                    : éCopiloto
                    ? "border-orange bg-orange/5"
                    : "border-navy/10 bg-white";
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-4 shadow-sm ${corBorda} ${
                      concluidaExibida ? "opacity-60" : ""
                    }`}
                  >
                    <button
                      onClick={() => toggle(m.id, concluidaExibida)}
                      disabled={pending}
                      aria-label={concluidaExibida ? "Marcar como não concluída" : "Marcar como concluída"}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                        concluidaExibida ? "border-green-600 bg-green-600 text-white" : "border-navy/30 bg-white"
                      }`}
                    >
                      {concluidaExibida ? "✓" : ""}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-navy-dark/50">
                        <span>{ICONE_TIPO[m.tipo] ?? "📌"}</span>
                        <span>
                          {m.materia}
                          {m.assunto ? ` · ${m.assunto}` : ""} · {m.duracao_minutos} min
                        </span>
                        {éCopiloto && (
                          <span className="rounded-full bg-orange/20 px-2 py-0.5 font-semibold text-orange-dark">
                            🤖 Copiloto
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 font-display font-bold ${
                          concluidaExibida ? "text-navy-dark/50 line-through" : "text-navy-dark"
                        }`}
                      >
                        {m.titulo}
                      </p>
                      {m.motivo_copiloto && (
                        <p className="mt-1 text-xs text-navy-dark/60">💡 {m.motivo_copiloto}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
