"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRef } from "react";
import type { Estado } from "@/app/(app)/acoes";

export const CAMPO =
  "w-full rounded-lg border border-tinta-200 bg-white px-3.5 py-2.5 text-sm text-tinta-900 outline-none transition placeholder:text-tinta-400 focus:border-ciano-500 focus:ring-2 focus:ring-ciano-100";

export const ROTULO = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-tinta-500";

export function BotaoEnviar({
  children,
  carregando,
  variante = "primario"
}: {
  children: React.ReactNode;
  carregando?: string;
  variante?: "primario" | "discreto";
}) {
  const { pending } = useFormStatus();
  const estilo =
    variante === "primario"
      ? "bg-ciano-500 text-white hover:bg-ciano-600"
      : "border border-tinta-200 bg-white text-tinta-700 hover:bg-tinta-100";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${estilo}`}
    >
      {pending && carregando ? carregando : children}
    </button>
  );
}

/**
 * Formulário com `useFormState`, o erro logo abaixo dos campos.
 *
 * `limparAoSucesso` zera os campos quando a ação volta sem erro. Sem isso, o
 * formulário de "nova situação-problema" continua preenchido com a SP anterior
 * e a pessoa cria a 1.2 sem perceber que o texto ainda é o da 1.1.
 */
export function FormularioSimples({
  acao,
  children,
  className = "",
  limparAoSucesso = false
}: {
  acao: (estado: Estado, formulario: FormData) => Promise<Estado>;
  children: React.ReactNode;
  className?: string;
  limparAoSucesso?: boolean;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [estado, enviar] = useFormState(async (anterior: Estado, dados: FormData) => {
    const resultado = await acao(anterior, dados);
    if (limparAoSucesso && !resultado.erro) ref.current?.reset();
    return resultado;
  }, {});

  return (
    <form ref={ref} action={enviar} className={className}>
      {children}
      {estado.erro ? (
        <p role="alert" className="mt-3 rounded-lg bg-alerta-100 px-3.5 py-2.5 text-sm text-alerta-600">
          {estado.erro}
        </p>
      ) : null}
    </form>
  );
}
