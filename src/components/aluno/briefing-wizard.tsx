"use client";

import { useState } from "react";
import { salvarBriefing } from "@/app/(aluno)/aluno/briefing/actions";

const MATERIAS = ["Biologia", "Química", "Física", "Matemática", "Português", "História", "Geografia"];
type Sentimento = "Domínio" | "Atenção" | "Turbulência";
const PROXIMO: Record<Sentimento, Sentimento> = {
  Domínio: "Atenção",
  Atenção: "Turbulência",
  Turbulência: "Domínio"
};
const CORES: Record<Sentimento, { fg: string; bg: string }> = {
  Domínio: { fg: "#0a8a4d", bg: "#dcf5e6" },
  Atenção: { fg: "#a06b00", bg: "rgba(255,201,77,.18)" },
  Turbulência: { fg: "#c53f36", bg: "#fde3e0" }
};

interface Props {
  briefingInicial?: {
    data_prova: string | null;
    inicio_estudos: string | null;
    horas_por_dia_semana: number | null;
    dias_estuda: string[] | null;
    sentimentos: Record<string, Sentimento> | null;
  } | null;
  erro?: string;
}

export function BriefingWizard({ briefingInicial, erro }: Props) {
  const [step, setStep] = useState(0);
  const [dataProva, setDataProva] = useState(briefingInicial?.data_prova ?? "");
  const [inicioEstudos, setInicioEstudos] = useState(briefingInicial?.inicio_estudos ?? "");
  const [dias, setDias] = useState(briefingInicial?.dias_estuda?.length ?? 5);
  const [horas, setHoras] = useState(briefingInicial?.horas_por_dia_semana ?? 3);
  const [sentimentos, setSentimentos] = useState<Record<string, Sentimento>>(
    () => {
      const inicial: Record<string, Sentimento> = {};
      MATERIAS.forEach((m) => {
        const v = briefingInicial?.sentimentos?.[m];
        inicial[m] = v === "Domínio" || v === "Atenção" || v === "Turbulência" ? v : "Atenção";
      });
      return inicial;
    }
  );

  function alternarSentimento(materia: string) {
    setSentimentos((s) => ({ ...s, [materia]: PROXIMO[s[materia] ?? "Atenção"] }));
  }

  const podeAvancar = step === 0 || (step === 1 && Boolean(dataProva));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Barra de progresso 3 passos */}
      <div className="flex gap-1.5 px-6 pt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{ background: i <= step ? "#F36C21" : "#e6ecf1" }}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {step === 0 && (
          <div className="mx-auto flex max-w-md flex-col items-center pt-8 text-center">
            <div
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: "rgba(243,108,33,.15)" }}
            >
              <span className="text-4xl">🗼</span>
            </div>
            <h1 className="font-display text-2xl font-black text-navy-dark">
              Bem-vindo à torre de controle, piloto.
            </h1>
            <p className="mt-3 text-navy-dark/70">
              Antes de decolar, precisamos montar seu plano de voo até a FACAPE.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="mx-auto max-w-md">
            <h2 className="font-display text-xl font-black text-navy-dark">Briefing de Voo</h2>
            <p className="mt-1 text-sm text-navy-dark/70">Conte como será sua preparação.</p>

            {erro && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{erro}</p>
            )}

            <div className="mt-5 space-y-3">
              <LinhaBriefing label="Data da prova">
                <input
                  type="date"
                  value={dataProva}
                  onChange={(e) => setDataProva(e.target.value)}
                  className="bg-transparent text-right font-display text-sm font-extrabold text-navy-dark outline-none"
                />
              </LinhaBriefing>
              <LinhaBriefing label="Início dos estudos">
                <input
                  type="date"
                  value={inicioEstudos}
                  onChange={(e) => setInicioEstudos(e.target.value)}
                  className="bg-transparent text-right font-display text-sm font-extrabold text-navy-dark outline-none"
                />
              </LinhaBriefing>
              <LinhaBriefing label="Dias por semana">
                <Stepper valor={dias} setValor={setDias} min={1} max={7} sufixo=" dias" />
              </LinhaBriefing>
              <LinhaBriefing label="Horas por dia">
                <Stepper valor={horas} setValor={setHoras} min={1} max={12} sufixo="h" />
              </LinhaBriefing>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-wide text-navy-dark/70">
              Como você se sente em cada matéria?
            </p>
            <p className="mt-1 text-xs text-navy-dark/50">
              Toque para alternar: Domínio (facilidade) → Atenção → Turbulência (dificuldade). O algoritmo usa
              isso para priorizar seu cronograma.
            </p>

            <div className="mt-3 space-y-2">
              {MATERIAS.map((m) => {
                const s = sentimentos[m] ?? "Atenção";
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => alternarSentimento(m)}
                    className="flex w-full items-center gap-3 rounded-xl border border-navy/10 bg-white p-3 text-left transition hover:bg-navy/5"
                  >
                    <span className="flex-1 text-sm font-bold text-navy-dark">{m}</span>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-extrabold"
                      style={{ color: CORES[s].fg, background: CORES[s].bg }}
                    >
                      {s}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <form
            action={async (fd) => {
              // Injeta todos os dados dos passos 1 no FormData
              fd.set("data_prova", dataProva);
              fd.set("inicio_estudos", inicioEstudos);
              fd.set("dias_por_semana", String(dias));
              fd.set("horas_por_dia", String(horas));
              Object.entries(sentimentos).forEach(([m, s]) => fd.set(`sentimento_${m}`, s));
              await salvarBriefing(fd);
            }}
            className="mx-auto flex max-w-md flex-col items-center text-center"
          >
            <div
              className="mb-5 mt-6 flex h-28 w-28 animate-pulse items-center justify-center rounded-full"
              style={{ background: "rgba(243,108,33,.15)" }}
            >
              <span className="text-6xl">✈️</span>
            </div>
            <h2 className="font-display text-xl font-black text-navy-dark">
              Calculando sua rota até a FACAPE...
            </h2>
            <div className="mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-navy/10">
              <div className="h-full bg-orange" style={{ width: "86%" }} />
            </div>
            <p className="mt-3 text-sm text-navy-dark/70">
              Seu plano de voo está pronto. Voo 001 decola agora.
            </p>
            <button
              type="submit"
              className="mt-8 w-full rounded-full bg-orange px-6 py-4 font-display font-black uppercase tracking-wide text-white hover:bg-orange-dark"
            >
              Decolar →
            </button>
          </form>
        )}
      </div>

      {step < 2 && (
        <div className="px-6 pb-8">
          <button
            type="button"
            disabled={!podeAvancar}
            onClick={() => setStep((s) => s + 1)}
            className="w-full rounded-full bg-orange px-6 py-4 font-display font-black uppercase tracking-wide text-white hover:bg-orange-dark disabled:opacity-40"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}

function LinhaBriefing({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-navy/10 bg-white p-3">
      <span className="text-sm font-semibold text-navy-dark/70">{label}</span>
      {children}
    </div>
  );
}

function Stepper({
  valor,
  setValor,
  min,
  max,
  sufixo
}: {
  valor: number;
  setValor: (n: number) => void;
  min: number;
  max: number;
  sufixo: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setValor(Math.max(min, valor - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy/5 font-black text-navy-dark/70"
      >
        −
      </button>
      <span className="min-w-16 text-center font-display text-sm font-extrabold text-navy-dark">
        {valor}
        {sufixo}
      </span>
      <button
        type="button"
        onClick={() => setValor(Math.min(max, valor + 1))}
        className="flex h-7 w-7 items-center justify-center rounded-lg font-black text-orange"
        style={{ background: "rgba(243,108,33,.15)" }}
      >
        +
      </button>
    </div>
  );
}
