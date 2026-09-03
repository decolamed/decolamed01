"use client";

import { useState, useTransition } from "react";
import { testarMotor, type ResultadoDoTeste } from "@/app/diagnostico/acoes";
import type { Motor } from "@/lib/ia/tipos";

export function TesteDeMotor({ motor, nome }: { motor: Motor; nome: string }) {
  const [resultado, setResultado] = useState<ResultadoDoTeste | null>(null);
  const [testando, iniciar] = useTransition();

  return (
    <div className="rounded-lg border border-tinta-200 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-tinta-900">{nome}</span>
        <button
          type="button"
          disabled={testando}
          onClick={() =>
            iniciar(async () => {
              setResultado(await testarMotor(motor));
            })
          }
          className="shrink-0 rounded-lg border border-tinta-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-tinta-700 transition hover:bg-tinta-100 disabled:opacity-50"
        >
          {testando ? "Testando…" : "Testar"}
        </button>
      </div>

      {resultado ? (
        <p
          role="status"
          className={`mt-2.5 rounded-md px-3 py-2 text-xs leading-relaxed ${
            resultado.ok ? "bg-ciano-100 text-ciano-600" : "bg-alerta-100 text-alerta-600"
          }`}
        >
          {resultado.ok ? "Funcionando. " : "Falhou. "}
          {resultado.detalhe}
        </p>
      ) : null}
    </div>
  );
}
