"use client";

import { useEffect } from "react";

// Error boundary do App Router: captura qualquer erro não tratado lançado
// durante a renderização de uma Server/Client Component abaixo dele (não
// captura erros do próprio layout raiz — para isso seria necessário um
// global-error.tsx, que substitui inclusive <html>/<body>; não adicionado
// aqui por ser um caso bem mais raro e fora do escopo desta auditoria).
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky px-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <h1 className="font-display text-xl font-bold text-navy-dark">Algo deu errado</h1>
        <p className="mt-2 text-sm text-navy-dark/70">
          Ocorreu um erro inesperado. Tente novamente — se o problema continuar, entre em contato com o suporte.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
