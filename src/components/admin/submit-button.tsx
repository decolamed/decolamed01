"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

/**
 * Botão de submit para forms com server action, com estado de carregamento.
 * useFormStatus só funciona dentro de um <form> — este componente precisa
 * ficar como filho direto (ou descendente) do <form action={...}>.
 */
export function SubmitButton({
  children,
  pendingText,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-60`}
      {...props}
    >
      {pending ? pendingText ?? "Salvando..." : children}
    </button>
  );
}
