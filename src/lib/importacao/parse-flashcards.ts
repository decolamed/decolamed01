// Parser heurístico de flashcards colados como texto (ou extraídos de PDF).
// Aceita dois formatos, tentando o primeiro e caindo pro segundo:
//
// 1) Blocos separados por linha em branco, com "Frente:"/"Verso:":
//      Frente: O que é mitose?
//      Verso: Divisão celular que gera duas células idênticas.
//
// 2) Uma linha por card, frente e verso separados por tab, "|" ou ";"
//    (útil pra colar de uma planilha):
//      O que é mitose? | Divisão celular que gera duas células idênticas.

export interface FlashcardParseado {
  frente: string;
  verso: string;
  erro: string | null;
}

const RE_FRENTE = /frente\s*:\s*([\s\S]*?)(?=\n\s*verso\s*:|$)/i;
const RE_VERSO = /verso\s*:\s*([\s\S]*)$/i;

export function parseFlashcardsTexto(texto: string): FlashcardParseado[] {
  const blocos = texto
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocos.map((bloco) => {
    const mFrente = bloco.match(RE_FRENTE);
    const mVerso = bloco.match(RE_VERSO);
    if (mFrente && mVerso) {
      const frente = mFrente[1].trim();
      const verso = mVerso[1].trim();
      return { frente, verso, erro: !frente || !verso ? "Frente ou verso vazios." : null };
    }

    // Formato de planilha: só funciona se o bloco for uma única linha.
    if (!bloco.includes("\n")) {
      const partes = bloco.split(/\t|\s*\|\s*|\s*;\s*/);
      if (partes.length >= 2 && partes[0].trim() && partes[1].trim()) {
        return { frente: partes[0].trim(), verso: partes.slice(1).join(" ").trim(), erro: null };
      }
    }

    return { frente: bloco, verso: "", erro: 'Não foi possível separar frente/verso — use "Frente:"/"Verso:" ou "frente | verso".' };
  });
}
