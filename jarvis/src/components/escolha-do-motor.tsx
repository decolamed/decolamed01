"use client";

import { useTransition } from "react";
import { salvarMotor } from "@/app/(app)/acoes";
import type { Motor } from "@/lib/ia/tipos";

interface Opcao {
  motor: Motor;
  nome: string;
  descricao: string;
  disponivel: boolean;
}

export function EscolhaDoMotor({ escolhido, opcoes }: { escolhido: Motor; opcoes: Opcao[] }) {
  const [salvando, iniciarTransicao] = useTransition();

  function escolher(motor: Motor) {
    const dados = new FormData();
    dados.set("motor", motor);
    iniciarTransicao(() => void salvarMotor({}, dados));
  }

  return (
    <div className="space-y-3">
      {opcoes.map((o) => {
        const ativo = o.motor === escolhido;
        return (
          <button
            key={o.motor}
            type="button"
            // Um motor sem chave no servidor fica desabilitado, não escondido:
            // assim quem está montando o próprio deploy vê que a opção existe
            // e o que falta para ligá-la.
            disabled={!o.disponivel || salvando}
            onClick={() => escolher(o.motor)}
            className={`w-full rounded-lg border p-4 text-left transition ${
              ativo ? "border-ciano-500 bg-ciano-100" : "border-tinta-200 hover:border-tinta-300"
            } ${o.disponivel ? "cursor-pointer" : "cursor-not-allowed opacity-55"}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                  ativo ? "border-ciano-500 bg-ciano-500" : "border-tinta-300"
                }`}
              />
              <span className="text-sm font-semibold text-tinta-900">{o.nome}</span>
              {!o.disponivel ? (
                <span className="ml-auto text-xs text-tinta-400">chave não configurada</span>
              ) : null}
            </div>
            <p className="mt-1.5 pl-[1.375rem] text-xs leading-relaxed text-tinta-500">{o.descricao}</p>
          </button>
        );
      })}
    </div>
  );
}
