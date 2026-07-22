"use client";

import type { ReactNode } from "react";

// Primitivas de interação para as seções de conteúdo do admin (Cursos,
// Cronograma, Questões, etc.) — todas client components simples, sem
// dependência de servidor. Reaproveitam a mesma linguagem visual de
// components/admin/card.tsx e icon.tsx.

export function Toggle({ on, onClick, title }: { on: boolean; onClick: () => void; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`h-[22px] w-10 shrink-0 rounded-full p-[3px] transition-colors ${on ? "bg-green" : "bg-navy-dark/15"}`}
    >
      <span
        className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[18px]" : "translate-x-0"}`}
      />
    </button>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${active ? "bg-navy-dark text-white" : "bg-navy-dark/5 text-navy-dark/60"}`}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  onClick,
  children,
  className = "",
  type = "button"
}: {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-[11px] bg-orange px-4 py-2.5 text-xs font-extrabold text-white hover:bg-orange-dark ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ onClick, children, className = "" }: { onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[11px] border border-navy-dark/15 px-4 py-2 text-xs font-bold text-navy-dark hover:bg-navy-dark/5 ${className}`}
    >
      {children}
    </button>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-[10px] border border-navy-dark/15 bg-white px-3 py-2.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy ${className}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full resize-y rounded-[10px] border border-navy-dark/15 bg-white px-3 py-2.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy ${className}`}
    />
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 mt-3 text-[10px] font-extrabold uppercase tracking-wide text-navy-dark/40">{children}</div>;
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl bg-navy-dark px-4 py-3.5 text-sm font-bold text-white shadow-2xl">
      {message}
    </div>
  );
}

export function DbNote({ children }: { children?: ReactNode }) {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-[11px] bg-blue-soft p-3 text-[10.5px] font-semibold leading-relaxed text-navy-dark">
      {children ?? "No app final, esta ação grava diretamente no banco de dados (Supabase) e vale imediatamente para todos os usuários."}
    </div>
  );
}

// Hook simples de toast (setTimeout) reutilizado em todas as páginas de
// demonstração — evita repetir a mesma lógica de estado em cada arquivo.
import { useCallback, useRef, useState } from "react";
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const show = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  return { toast, show };
}
