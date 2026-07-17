"use client";

import { useState } from "react";
import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
}

// A barra lateral do admin (components/(admin)/admin/layout.tsx) só aparece
// a partir da tela "sm" do Tailwind (640px+) — em celular ela fica
// completamente escondida, sem nenhuma outra forma de navegar entre as
// páginas do painel. Este componente cobre exatamente essa lacuna: um botão
// "≡" que só aparece em telas pequenas (sm:hidden) e abre/fecha uma lista
// com os mesmos links.
export function AdminMobileNav({ nav }: { nav: NavItem[] }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label="Abrir menu"
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-navy-dark/20"
      >
        <span className="h-0.5 w-5 bg-navy-dark" />
        <span className="h-0.5 w-5 bg-navy-dark" />
        <span className="h-0.5 w-5 bg-navy-dark" />
      </button>

      {aberto && (
        <nav className="absolute left-0 right-0 top-[64px] z-40 flex flex-col gap-1 border-b bg-navy-dark p-4 text-white shadow-lg">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setAberto(false)}
              className="rounded-lg px-3 py-3 text-sm hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
