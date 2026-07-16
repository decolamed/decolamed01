"use client";

import { montarLinkWhatsapp } from "@/lib/site/whatsapp";

// Reaproveita o mesmo helper já usado no site público (src/lib/site/whatsapp.ts)
// para montar o link wa.me — mesma limpeza de dígitos, mesmo padrão.
export function WhatsappButton({ telefone, nome }: { telefone: string | null; nome: string }) {
  if (!telefone || telefone.replace(/\D/g, "").length < 8) {
    return (
      <button
        type="button"
        title="Este aluno não tem telefone cadastrado"
        onClick={() => window.alert(`${nome} não tem telefone/WhatsApp cadastrado.`)}
        className="text-navy-dark/30 hover:underline"
      >
        WhatsApp
      </button>
    );
  }

  const link = montarLinkWhatsapp(telefone);

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
      WhatsApp
    </a>
  );
}
