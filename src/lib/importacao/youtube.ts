"use server";

import { requireAdmin } from "@/lib/auth/permissions";

export interface AulaYoutubeInfo {
  url: string;
  titulo: string | null;
  materiaSugerida: string | null;
  erro: string | null;
}

// Heurística simples de matéria a partir do título do vídeo — só uma
// sugestão pré-preenchida; o admin sempre revisa e pode trocar antes de
// importar. Nenhuma API de categorização de verdade: é palavra-chave.
const MATERIAS_PALAVRAS: Record<string, string[]> = {
  Biologia: ["biologia", "célula", "genética", "ecologia", "botânica", "zoologia", "corpo humano", "fisiologia", "citologia"],
  Química: ["química", "estequiometria", "átomo", "molécula", "reação química", "tabela periódica", "ph"],
  Física: ["física", "cinemática", "termodinâmica", "eletricidade", "óptica", "mecânica", "ondulatória"],
  Matemática: ["matemática", "álgebra", "geometria", "trigonometria", "função", "equação", "logaritmo"],
  "Português/Literatura": ["português", "gramática", "literatura", "interpretação de texto", "redação", "sintaxe"],
  História: ["história", "revolução", "guerra mundial", "brasil colônia", "idade média", "república"],
  Geografia: ["geografia", "clima", "relevo", "geopolítica", "urbanização", "cartografia"]
};

function sugerirMateria(titulo: string): string | null {
  const t = titulo.toLowerCase();
  for (const [materia, palavras] of Object.entries(MATERIAS_PALAVRAS)) {
    if (palavras.some((p) => t.includes(p))) return materia;
  }
  return null;
}

function extrairIdYoutube(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/i);
  return m ? m[1] : null;
}

// Busca título real do vídeo via oEmbed (endpoint público do YouTube, sem
// precisar de chave de API) e sugere uma matéria pelo título. Usado pelo
// importador em massa de aulas em /admin/cursos.
export async function buscarInfoYoutube(urls: string[]): Promise<AulaYoutubeInfo[]> {
  await requireAdmin();
  const resultados: AulaYoutubeInfo[] = [];

  for (const urlBruta of urls) {
    const url = urlBruta.trim();
    if (!url) continue;
    const id = extrairIdYoutube(url);
    if (!id) {
      resultados.push({ url, titulo: null, materiaSugerida: null, erro: "Link do YouTube não reconhecido." });
      continue;
    }
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, {
        cache: "no-store"
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { title?: string };
      const titulo = data.title ?? null;
      resultados.push({ url, titulo, materiaSugerida: titulo ? sugerirMateria(titulo) : null, erro: titulo ? null : "Vídeo sem título disponível." });
    } catch (e) {
      resultados.push({ url, titulo: null, materiaSugerida: null, erro: "Não foi possível buscar informações desse vídeo (ele pode ser privado ou ter sido removido)." });
    }
  }

  return resultados;
}
