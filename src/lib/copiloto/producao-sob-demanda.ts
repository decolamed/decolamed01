import { createAdminClient } from "@/lib/supabase/server";
import { gerarFlashcardsIA, escolherMelhorVideo } from "@/lib/gemini/client";
import { buscarVideoAulas } from "@/lib/youtube/client";

const MIN_FLASHCARDS_ACEITAVEL = 3; // abaixo disso, considera "pouco material"

export interface ResultadoProducao {
  produziu: boolean;
  flashcardsGerados: number;
  videoEncontrado: boolean;
  flashcardsIds: string[];
  videoConteudoId: string | null;
  videoUrl: string | null;
  videoTitulo: string | null;
}

/**
 * Verifica se a plataforma já tem material suficiente sobre um assunto.
 * Só dispara produção sob demanda quando REALMENTE falta conteúdo —
 * nunca duplica o que já existe.
 */
async function verificarCobertura(materia: string, assunto: string) {
  const supabase = createAdminClient();

  const [{ count: qtdFlashcards }, { data: aulasExistentes }] = await Promise.all([
    supabase.from("flashcards")
      .select("id", { count: "exact", head: true })
      .eq("materia", materia)
      .eq("assunto", assunto)
      .eq("ativo", true),
    supabase.from("conteudos_biblioteca")
      .select("id")
      .eq("materia", materia)
      .eq("assunto", assunto)
      .in("tipo", ["aula", "video_externo"])
      .eq("ativo", true)
      .limit(1)
  ]);

  return {
    temFlashcardsSuficientes: (qtdFlashcards ?? 0) >= MIN_FLASHCARDS_ACEITAVEL,
    temAula: (aulasExistentes ?? []).length > 0
  };
}

/**
 * Produção sob demanda: gera flashcards e busca vídeo-aula real quando
 * a plataforma não tem material suficiente sobre um assunto crítico
 * (identificado pelo motor do Copiloto via GEN alto).
 *
 * Fluxo:
 *   1. Checa cobertura atual (nunca duplica material existente)
 *   2. Se faltam flashcards → Gemini gera (marcado gerado_por_ia=true)
 *   3. Se falta vídeo → YouTube Data API busca candidatos REAIS,
 *      filtrados por confiabilidade (canal, views, duração mínima)
 *   4. Gemini apenas ESCOLHE entre os candidatos reais (nunca inventa URL)
 *   5. Tudo registrado em copiloto_producoes_ia para auditoria
 *
 * Nunca lança — se Gemini/YouTube não estiverem configurados ou falharem,
 * retorna produziu:false e o Copiloto segue com o material que já existe.
 */
export async function produzirMaterialSobDemanda(
  alunoId: string,
  materia: string,
  assunto: string,
  motivo: string
): Promise<ResultadoProducao> {
  const supabase = createAdminClient();
  const resultado: ResultadoProducao = {
    produziu: false, flashcardsGerados: 0, videoEncontrado: false,
    flashcardsIds: [], videoConteudoId: null, videoUrl: null, videoTitulo: null
  };

  const cobertura = await verificarCobertura(materia, assunto);
  if (cobertura.temFlashcardsSuficientes && cobertura.temAula) {
    return resultado; // já tem material suficiente — não produz nada
  }

  // ---- Gerar flashcards se estiverem faltando ----
  if (!cobertura.temFlashcardsSuficientes) {
    const gerados = await gerarFlashcardsIA(materia, assunto, 4);
    if (gerados.length > 0) {
      const { data: inseridos } = await supabase
        .from("flashcards")
        .insert(
          gerados.map((f) => ({
            materia, assunto, frente: f.frente, verso: f.verso,
            ativo: true, gerado_por_ia: true
          }))
        )
        .select("id");
      resultado.flashcardsIds = (inseridos ?? []).map((f: any) => f.id);
      resultado.flashcardsGerados = resultado.flashcardsIds.length;
    }
  }

  // ---- Buscar vídeo-aula real se estiver faltando ----
  if (!cobertura.temAula) {
    const candidatos = await buscarVideoAulas(assunto, materia);
    if (candidatos.length > 0) {
      const videoIdEscolhido = await escolherMelhorVideo(candidatos, assunto, materia);
      const escolhido = candidatos.find((c) => c.videoId === videoIdEscolhido) ?? candidatos[0];

      const { data: conteudo, error: erroConteudo } = await supabase
        .from("conteudos_biblioteca")
        .insert({
          tipo: "video_externo",
          titulo: escolhido.titulo,
          materia,
          assunto,
          url: escolhido.url,
          duracao_minutos: Math.round(escolhido.duracaoSegundos / 60),
          descricao: `Canal: ${escolhido.canal} · ${escolhido.inscritosCanal.toLocaleString("pt-BR")} inscritos`,
          ativo: true,
          gerado_por_ia: true,
          metadados_youtube: {
            canal: escolhido.canal,
            canal_id: escolhido.canalId,
            inscritos: escolhido.inscritosCanal,
            visualizacoes: escolhido.visualizacoes,
            video_id: escolhido.videoId
          }
        })
        .select("id")
        .single();

      if (conteudo) {
        resultado.videoEncontrado = true;
        resultado.videoConteudoId = conteudo.id;
        resultado.videoUrl = escolhido.url;
        resultado.videoTitulo = escolhido.titulo;
      } else if (erroConteudo?.code === "23505") {
        // Outra execução do Copiloto criou a aula deste assunto no mesmo
        // instante (`conteudo_ia_unico_por_assunto`, migração 051). A checagem
        // de cobertura não segura essa corrida: as duas leem "não tem aula"
        // antes de qualquer uma gravar. A recomendação usa o vídeo que ficou —
        // o aluno precisa da aula, não de saber quem chegou primeiro.
        const { data: existente } = await supabase
          .from("conteudos_biblioteca")
          .select("id, titulo, url")
          .eq("materia", materia)
          .eq("assunto", assunto)
          .in("tipo", ["aula", "video_externo"])
          .eq("ativo", true)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (existente?.url) {
          resultado.videoEncontrado = true;
          resultado.videoConteudoId = existente.id;
          resultado.videoUrl = existente.url;
          resultado.videoTitulo = existente.titulo;
        }
      }
    }
  }

  resultado.produziu = resultado.flashcardsGerados > 0 || resultado.videoEncontrado;

  if (resultado.produziu) {
    await supabase.from("copiloto_producoes_ia").insert({
      aluno_id: alunoId,
      materia, assunto, motivo,
      flashcards_gerados: resultado.flashcardsGerados,
      video_encontrado: resultado.videoEncontrado,
      video_conteudo_id: resultado.videoConteudoId,
      flashcards_ids: resultado.flashcardsIds
    });
  }

  return resultado;
}
