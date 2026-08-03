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
  confirmar,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
  /**
   * Texto do confirm() exibido antes de enviar o formulário. Serve para as
   * ações destrutivas do painel — exclusões precisam de confirmação, e sem
   * isso cada tela teria que montar a sua.
   */
  confirmar?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-60`}
      onClick={(e) => {
        if (confirmar && !window.confirm(confirmar)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      {pending ? pendingText ?? "Salvando..." : children}
    </button>
  );
}
