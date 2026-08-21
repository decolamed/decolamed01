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

// ============================================================================
// TÍTULOS EM LOTE
//
// A importação inicial do cronograma gravou as aulas como "Aula 1", "Aula 2"…
// Buscar o título real de cada uma pelo oEmbed custa UMA requisição por aula
// (253 no total), e o oEmbed nem sempre está acessível — em ambientes com
// proxy restritivo, youtube.com é bloqueado enquanto googleapis.com passa.
//
// O endpoint /videos da Data API aceita até 50 IDs por chamada, então as 253
// aulas saem em 6 requisições em vez de 253. É a mesma chave já usada pela
// Produção sob Demanda do Copiloto.
// ============================================================================

export function extrairVideoIdYoutube(url: string): string | null {
  return (
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/[?&]v=([\w-]{6,})/) ||
    url.match(/youtube\.com\/(?:embed|shorts)\/([\w-]{6,})/)
  )?.[1] ?? null;
}

export interface ResultadoTitulos {
  /** videoId → título real. Só contém os que a API devolveu. */
  titulos: Map<string, string>;
  /** Mensagem pronta para o admin quando nada pôde ser buscado. */
  erro: string | null;
}

/**
 * Busca o título real de vários vídeos de uma vez.
 *
 * Devolve `erro` preenchido — em vez de só uma lista vazia — porque as duas
 * causas de falha têm soluções opostas e o admin precisa saber qual é: chave
 * ausente se resolve colando a chave em Configurações; API não habilitada só
 * se resolve no console do Google. Sem essa distinção, o botão falharia em
 * silêncio e pareceria defeito da plataforma.
 */
export async function buscarTitulosYoutube(videoIds: string[]): Promise<ResultadoTitulos> {
  const titulos = new Map<string, string>();
  if (videoIds.length === 0) return { titulos, erro: null };

  const apiKey = await getYoutubeApiKey();
  if (!apiKey) {
    return { titulos, erro: "Nenhuma chave da YouTube Data API configurada. Cadastre em Configurações." };
  }

  const LOTE = 50; // teto do endpoint /videos
  for (let i = 0; i < videoIds.length; i += LOTE) {
    const ids = videoIds.slice(i, i + LOTE);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.join(",")}&key=${encodeURIComponent(apiKey)}`,
        { cache: "no-store", signal: AbortSignal.timeout(15000) }
      );
      const data = await res.json();

      if (!res.ok) {
        const motivo: string = data?.error?.message ?? `HTTP ${res.status}`;
        console.error("[youtube] falha ao buscar títulos:", motivo);
        // Duas causas diferentes, com correções em telas diferentes do
        // console — e a mensagem genérica ("are blocked") não distingue as
        // duas. O que separa é o `reason` estruturado:
        //
        //   API_KEY_SERVICE_BLOCKED → a chave existe e a API pode estar
        //     habilitada, mas a CHAVE está restrita a uma lista de APIs que
        //     não inclui o YouTube. Corrige-se em Credenciais.
        //   SERVICE_DISABLED / "has not been used" → a API não está
        //     habilitada no projeto. Corrige-se na Biblioteca.
        const razoes: string = JSON.stringify(data?.error?.details ?? "");
        if (/API_KEY_SERVICE_BLOCKED/.test(razoes)) {
          return {
            titulos,
            erro:
              "A chave do YouTube está restrita e não permite a YouTube Data API v3. " +
              "Em console.cloud.google.com → APIs e Serviços → Credenciais → (sua chave) → " +
              "Restrições de API, inclua “YouTube Data API v3” na lista permitida."
          };
        }
        if (/SERVICE_DISABLED|has not been used|disabled/i.test(motivo + razoes)) {
          return {
            titulos,
            erro:
              "A YouTube Data API v3 não está habilitada no projeto desta chave. " +
              "Ative em console.cloud.google.com → APIs e Serviços → Biblioteca → YouTube Data API v3."
          };
        }
        if (/blocked/i.test(motivo)) {
          return { titulos, erro: "O Google recusou a chave para esta API. Verifique as restrições da chave no console." };
        }
        if (/quota/i.test(motivo)) {
          return { titulos, erro: "Cota diária da YouTube Data API esgotada. Tente amanhã." };
        }
        return { titulos, erro: "Não foi possível consultar o YouTube agora." };
      }

      ((data?.items ?? []) as { id: string; snippet?: { title?: string } }[]).forEach((item) => {
        const t = item.snippet?.title?.trim();
        if (item.id && t) titulos.set(item.id, t);
      });
    } catch (e) {
      console.error("[youtube] erro de rede ao buscar títulos:", e);
      return { titulos, erro: "Falha de rede ao consultar o YouTube." };
    }
  }

  return { titulos, erro: null };
}

// ============================================================================
// O ESTADO DE UM VÍDEO: DURA QUANTO, E DÁ PARA ASSISTIR AQUI DENTRO?
//
// Uma consulta só responde às duas perguntas, e as duas são necessárias:
//
//   - `duracaoMinutos` alimenta o cálculo de capacidade do cronograma, para
//     uma aula de 10 minutos não ocupar o mesmo espaço de uma de 50.
//   - `disponivel` / `incorporavel` dizem se o aluno consegue assistir. Vídeo
//     removido ou privado simplesmente não volta na resposta da API; vídeo
//     que o dono proibiu de incorporar volta com `embeddable: false` e falha
//     dentro do player sem dar nenhum sinal ao servidor.
//
// Consultar as duas juntas evita gastar duas chamadas de cota por vídeo.
// ============================================================================

export interface EstadoDoVideo {
  videoId: string;
  /** O vídeo existe e está público/não listado. */
  disponivel: boolean;
  /** Pode tocar dentro da plataforma (o dono não bloqueou a incorporação). */
  incorporavel: boolean;
  duracaoMinutos: number;
  titulo: string | null;
  canal: string | null;
  canalId: string | null;
  /** Por que não dá para usar, quando não dá. Texto para o admin ler. */
  motivo: string | null;
}

export interface ResultadoEstados {
  estados: Map<string, EstadoDoVideo>;
  erro: string | null;
}

function indisponivel(videoId: string, motivo: string): EstadoDoVideo {
  return { videoId, disponivel: false, incorporavel: false, duracaoMinutos: 0, titulo: null, canal: null, canalId: null, motivo };
}

/**
 * O estado de vários vídeos de uma vez.
 *
 * Vídeo que não volta na resposta é vídeo que não existe mais para quem
 * consulta: removido, privado ou id errado. O YouTube não devolve erro nesse
 * caso — ele simplesmente omite o item, e é por isso que a ausência precisa
 * ser tratada explicitamente aqui em vez de virar "não sei".
 */
export async function estadoDosVideos(videoIds: string[]): Promise<ResultadoEstados> {
  const estados = new Map<string, EstadoDoVideo>();
  const ids = [...new Set(videoIds.filter(Boolean))];
  if (ids.length === 0) return { estados, erro: null };

  const apiKey = await getYoutubeApiKey();
  if (!apiKey) {
    return { estados, erro: "Nenhuma chave da YouTube Data API configurada. Cadastre em Configurações." };
  }

  const LOTE = 50; // teto do endpoint /videos
  for (let i = 0; i < ids.length; i += LOTE) {
    const lote = ids.slice(i, i + LOTE);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status,snippet&id=${lote.join(",")}&key=${encodeURIComponent(apiKey)}`,
        { cache: "no-store", signal: AbortSignal.timeout(15000) }
      );
      const data = await res.json();
      if (!res.ok) {
        const motivo: string = data?.error?.message ?? `HTTP ${res.status}`;
        console.error("[youtube] falha ao consultar estado dos vídeos:", motivo);
        return { estados, erro: motivo };
      }

      const vistos = new Set<string>();
      for (const v of data.items ?? []) {
        vistos.add(v.id);
        const privado = v.status?.privacyStatus === "private";
        const processado = v.status?.uploadStatus === "processed";
        const incorporavel = v.status?.embeddable !== false;
        const segundos = parseDuracaoISO8601(v.contentDetails?.duration ?? "PT0S");

        estados.set(v.id, {
          videoId: v.id,
          disponivel: !privado && processado,
          incorporavel,
          duracaoMinutos: Math.max(0, Math.round(segundos / 60)),
          titulo: v.snippet?.title ?? null,
          canal: v.snippet?.channelTitle ?? null,
          canalId: v.snippet?.channelId ?? null,
          motivo: privado
            ? "O vídeo está privado."
            : !processado
              ? "O vídeo não está disponível no YouTube."
              : !incorporavel
                ? "O dono do vídeo não permite reprodução fora do YouTube."
                : null
        });
      }

      // O que não voltou: removido, privado ou id inválido. Ausência é
      // resposta, não silêncio.
      for (const id of lote) {
        if (!vistos.has(id)) estados.set(id, indisponivel(id, "O vídeo foi removido ou está indisponível."));
      }
    } catch (e) {
      console.error("[youtube] erro de rede ao consultar vídeos:", e instanceof Error ? e.message : e);
      return { estados, erro: "Não foi possível falar com o YouTube agora." };
    }
  }

  return { estados, erro: null };
}
