"use client";

import { useState, useTransition } from "react";
import { marcarNotificacaoLida } from "@/app/(aluno)/aluno/notificacoes-actions";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export function NotificacoesBell({ notificacoes }: { notificacoes: Notificacao[] }) {
  const [aberto, setAberto] = useState(false);
  const [lista, setLista] = useState(notificacoes);
  const [, startTransition] = useTransition();

  const naoLidas = lista.filter((n) => !n.lida).length;

  function abrir(n: Notificacao) {
    if (!n.lida) {
      setLista((atual) => atual.map((x) => (x.id === n.id ? { ...x, lida: true } : x)));
      startTransition(() => {
        marcarNotificacaoLida(n.id);
      });
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-label="Notificações"
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-navy-dark/20 text-lg"
      >
        🔔
        {naoLidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 text-[11px] font-bold text-white">
            {naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-12 z-40 max-h-96 w-80 overflow-y-auto rounded-2xl bg-white shadow-xl">
          {lista.length === 0 ? (
            <p className="p-6 text-center text-sm text-navy-dark/50">Nenhuma notificação por aqui.</p>
          ) : (
            <ul className="divide-y">
              {lista.map((n) => (
                <li
                  key={n.id}
                  onClick={() => abrir(n)}
                  className={`cursor-pointer p-4 text-sm hover:bg-navy/5 ${!n.lida ? "bg-orange/5" : ""}`}
                >
                  <p className="font-display font-bold text-navy-dark">{n.titulo}</p>
                  <p className="mt-0.5 text-navy-dark/60">{n.mensagem}</p>
                  <p className="mt-1 text-xs text-navy-dark/40">
                    {new Date(n.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
