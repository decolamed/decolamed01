"use server";

import { requireAdmin } from "@/lib/auth/permissions";

// Extrai o texto puro de um PDF enviado pelo admin (base64) — usado pelos
// importadores em massa de questões e flashcards antes de rodar o parser de
// texto (parse-questoes.ts / parse-flashcards.ts). Só extrai texto corrido:
// não entende colunas, tabelas ou layout, então PDFs com diagramação
// complexa podem sair fora de ordem — por isso o resultado sempre passa
// pela tela de revisão antes de qualquer gravação no banco.
export async function extrairTextoPdf(base64: string): Promise<{ ok: true; texto: string } | { ok: false; erro: string }> {
  await requireAdmin();
  try {
    const { default: pdfParse } = await import("pdf-parse");
    const buffer = Buffer.from(base64, "base64");
    const resultado = await pdfParse(buffer);
    return { ok: true, texto: resultado.text };
  } catch (e) {
    console.error("Falha ao extrair texto do PDF:", e);
    return { ok: false, erro: "Não foi possível ler esse PDF. Tente colar o texto diretamente." };
  }
}
