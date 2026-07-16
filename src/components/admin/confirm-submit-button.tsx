"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

/**
 * Igual ao SubmitButton, mas pede confirmação do navegador (window.confirm)
 * antes de deixar o form submeter. Usado nas ações administrativas que a
 * spec pede confirmação (desativar, tornar admin, reenviar e-mail, etc.).
 * Continua sendo um <button type="submit"> normal dentro do <form
 * action={serverAction}>: se o usuário cancelar, o preventDefault barra o
 * submit e a server action nunca roda.
 */
export function ConfirmSubmitButton({
  children,
  pendingText,
  confirmMessage,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string; confirmMessage: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-60`}
      {...props}
    >
      {pending ? pendingText ?? "Processando..." : children}
    </button>
  );
}
