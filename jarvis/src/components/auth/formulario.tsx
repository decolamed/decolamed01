"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { EstadoDoFormulario } from "@/app/(auth)/acoes";

function Botao({ rotulo, carregando }: { rotulo: string; carregando: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-ciano-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-ciano-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? carregando : rotulo}
    </button>
  );
}

const CAMPO =
  "w-full rounded-lg border border-tinta-200 bg-white px-3.5 py-2.5 text-sm text-tinta-900 outline-none transition placeholder:text-tinta-400 focus:border-ciano-500 focus:ring-2 focus:ring-ciano-100";

const ROTULO = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-tinta-500";

export function FormularioAuth({
  modo,
  acao,
  destino
}: {
  modo: "entrar" | "criar";
  acao: (estado: EstadoDoFormulario, formulario: FormData) => Promise<EstadoDoFormulario>;
  destino?: string;
}) {
  const [estado, enviar] = useFormState(acao, {});

  return (
    <form action={enviar} className="space-y-4">
      {destino ? <input type="hidden" name="destino" value={destino} /> : null}

      {modo === "criar" ? (
        <div>
          <label className={ROTULO} htmlFor="nome">
            Como quer ser chamado
          </label>
          <input id="nome" name="nome" className={CAMPO} placeholder="Ana" autoComplete="name" required />
        </div>
      ) : null}

      <div>
        <label className={ROTULO} htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={CAMPO}
          placeholder="voce@email.com"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className={ROTULO} htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          className={CAMPO}
          placeholder={modo === "criar" ? "pelo menos 8 caracteres" : "sua senha"}
          autoComplete={modo === "criar" ? "new-password" : "current-password"}
          required
        />
      </div>

      {estado.erro ? (
        <p role="alert" className="rounded-lg bg-alerta-100 px-3.5 py-2.5 text-sm text-alerta-600">
          {estado.erro}
        </p>
      ) : null}

      {estado.aviso ? (
        <p role="status" className="rounded-lg bg-ciano-100 px-3.5 py-2.5 text-sm text-ciano-600">
          {estado.aviso}
        </p>
      ) : null}

      <Botao
        rotulo={modo === "criar" ? "Criar minha conta" : "Entrar"}
        carregando={modo === "criar" ? "Criando…" : "Entrando…"}
      />
    </form>
  );
}
