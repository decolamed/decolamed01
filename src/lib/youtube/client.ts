import { createAdminClient } from "@/lib/supabase/server";

const CHAVE_CONFIG = "youtube_api_key";

/**
 * Gerencia a chave da YouTube Data API v3 — mesmo padrão do Gemini
 * (prioriza env var, cai pro banco em configuracoes_secretas).
 *
 * IMPORTANTE: essa chave é diferente da do Gemini. O Gemini sozinho NÃO
 * consegue verificar se um vídeo existe de verdade — ele só "lembra" de
 * padrões de treinamento e pode inventar um link com ID de vídeo que
 * parece real mas não existe. A YouTube Data API devolve resultados
 * reais, verificáveis (canal, visualizações, duração) — é a única forma
 * segura de recomendar vídeo-aula automaticamente.
 */
export async function getYoutubeApiKey(): Promise<string | null> {
  if (process.env.YOUTUBE_API_KEY) return process.env.YOUTUBE_API_KEY;
  const supabase = createAdminClient();
  const { data } = await supabase.from("configuracoes_secretas").select("valor").eq("chave", CHAVE_CONFIG).maybeSingle();
  return data?.valor?.trim() || null;
}

export async function salvarYoutubeApiKey(valor: string) {
  const supabase = createAdminClient();
  return supabase.from("configuracoes_secretas").upsert({ chave: CHAVE_CONFIG, valor: valor.trim() }, { onConflict: "chave" });
}

export async function removerYoutubeApiKey() {
  const supabase = createAdminClient();
  return supabase.from("configuracoes_secretas").delete().eq("chave", CHAVE_CONFIG);
}

export interface VideoCandidato {
  videoId: string;
  titulo: string;
  canal: string;
  canalId: string;
  descricao: string;
  duracaoSegundos: number;
  visualizacoes: number;
  inscritosCanal: number;
  url: string;
}

/**
 * Busca vídeo-aulas REAIS no YouTube sobre um assunto específico.
 * Filtros de qualidade aplicados:
 *   - videoDuration=long (>20min) → evita shorts e resumos superficiais
 *   - relevanceLanguage=pt → prioriza conteúdo em português
 *   - ordenado por relevância, depois filtrado por engajamento mínimo
 *
 * Retorna [] (nunca lança) se a chave não estiver configurada ou a
 * busca falhar — quem chama precisa ter fallback sem vídeo.
 */
export async function buscarVideoAulas(
  assunto: string,
  materia: string
): Promise<VideoCandidato[]> {
  const apiKey = await getYoutubeApiKey();
  if (!apiKey) return [];

  try {
    const query = `${assunto} ${materia} aula completa vestibular`;
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoDuration", "long"); // > 20 minutos — aula completa, não short
    searchUrl.searchParams.set("relevanceLanguage", "pt");
    searchUrl.searchParams.set("regionCode", "BR");
    searchUrl.searchParams.set("maxResults", "8");
    searchUrl.searchParams.set("safeSearch", "strict");
    searchUrl.searchParams.set("key", apiKey);

    const searchRes = await fetch(searchUrl.toString(), { cache: "no-store" });
    if (!searchRes.ok) {
      console.error(`[youtube] busca falhou ${searchRes.status}:`, await searchRes.text());
      return [];
    }
    const searchData = await searchRes.json();
    const items: any[] = searchData.items ?? [];
    if (items.length === 0) return [];

    const videoIds = items.map((i) => i.id.videoId).filter(Boolean).join(",");
    const channelIds = [...new Set(items.map((i) => i.snippet.channelId))].join(",");

    // Segunda chamada: pega estatísticas reais (views, duração) e dados do canal
    // (inscritos) — usados para filtrar canais pequenos/pouco confiáveis.
    const [videosRes, canaisRes] = await Promise.all([
      fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`,
        { cache: "no-store" }
      ),
      fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${apiKey}`,
        { cache: "no-store" }
      )
    ]);

    if (!videosRes.ok || !canaisRes.ok) return [];

    const videosData = await videosRes.json();
    const canaisData = await canaisRes.json();

    const inscritosPorCanal = new Map<string, number>();
    (canaisData.items ?? []).forEach((c: any) => {
      inscritosPorCanal.set(c.id, Number(c.statistics?.subscriberCount ?? 0));
    });

    const detalhesPorVideo = new Map<string, { duracao: number; views: number }>();
    (videosData.items ?? []).forEach((v: any) => {
      detalhesPorVideo.set(v.id, {
        duracao: parseDuracaoISO8601(v.contentDetails?.duration ?? "PT0S"),
        views: Number(v.statistics?.viewCount ?? 0)
      });
    });

    const candidatos: VideoCandidato[] = items
      .map((item: any) => {
        const videoId = item.id.videoId;
        const canalId = item.snippet.channelId;
        const detalhes = detalhesPorVideo.get(videoId);
        const inscritos = inscritosPorCanal.get(canalId) ?? 0;
        return {
          videoId,
          titulo: item.snippet.title,
          canal: item.snippet.channelTitle,
          canalId,
          descricao: item.snippet.description ?? "",
          duracaoSegundos: detalhes?.duracao ?? 0,
          visualizacoes: detalhes?.views ?? 0,
          inscritosCanal: inscritos,
          url: `https://www.youtube.com/watch?v=${videoId}`
        };
      })
      // Filtro de confiabilidade: canal com pelo menos 5 mil inscritos E
      // vídeo com pelo menos 1 mil visualizações — evita canais spam/
      // recém-criados ou vídeos sem nenhum engajamento real.
      .filter((v) => v.inscritosCanal >= 5000 && v.visualizacoes >= 1000)
      // Duração mínima de 8 minutos — "aula completa", não resumo raso.
      .filter((v) => v.duracaoSegundos >= 480)
      .sort((a, b) => b.visualizacoes - a.visualizacoes);

    return candidatos;
  } catch (e) {
    console.error("[youtube] falha na busca:", e);
    return [];
  }
}

function parseDuracaoISO8601(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
}
