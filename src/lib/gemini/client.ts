import { createAdminClient } from "@/lib/supabase/server";

const CHAVE_CONFIG = "gemini_api_key";
// "-latest" é um alias que a própria Google mantém apontado pro modelo Flash
// vigente — evita fixar um nome de modelo específico (ex.: "gemini-2.0-flash")
// que em algum momento perde a cota gratuita/deixa de existir e quebra a
// integração sem nenhuma mudança no nosso código.
const MODELO = "gemini-flash-latest";

// ATENÇÃO ao mexer nos limites de token abaixo.
//
// O alias acima hoje aponta para um modelo de *raciocínio*, que gasta tokens
// pensando ANTES de escrever — e esses tokens saem do mesmo `maxOutputTokens`
// da resposta. Verificado contra a API real: com 300 tokens, 287 foram para o
// raciocínio e a frase voltou cortada no meio ("Cada hora de estudo te
// aproxima do"); com 50 tokens, os 47 do raciocínio consumiram tudo e o texto
// voltou VAZIO, sem erro nenhum — a chamada respondia HTTP 200 e a integração
// simplesmente não fazia efeito. Com 2000 tokens, o raciocínio ocupou ~700 e
// a resposta veio inteira.
//
// Por isso os limites são folgados: eles não são o tamanho esperado da
// resposta, são o teto de raciocínio + resposta. Apertá-los para "economizar"
// reintroduz uma falha silenciosa.
const TOKENS_TEXTO = 2000;
const TOKENS_ESCOLHA = 1500;
const TOKENS_FLASHCARDS = 8000;

// Ponto único de chamada da API. Antes as três funções abaixo repetiam o mesmo
// fetch, e por isso o mesmo defeito de orçamento existia em triplicata.
// Devolve null em qualquer falha — inclusive quando a resposta veio truncada,
// porque meia resposta é pior que nenhuma: um JSON pela metade quebra o parse
// e uma frase cortada chegaria ao aluno assim mesmo.
async function chamarGemini(
  apiKey: string,
  prompt: string,
  temperatura: number,
  maxOutputTokens: number,
  rotulo: string
): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: temperatura, maxOutputTokens }
      }),
      cache: "no-store"
    }
  );

  if (!res.ok) {
    console.error(`[gemini] ${rotulo}: erro ${res.status}:`, await res.text());
    return null;
  }

  const data = await res.json();
  const candidato = data?.candidates?.[0];

  if (candidato?.finishReason === "MAX_TOKENS") {
    // Log explícito: sem isso, o sintoma no ar é "a IA parou de funcionar" sem
    // nenhuma pista de causa, porque o HTTP foi 200.
    console.error(
      `[gemini] ${rotulo}: resposta truncada em ${maxOutputTokens} tokens ` +
      `(raciocínio: ${data?.usageMetadata?.thoughtsTokenCount ?? "?"}). Descartada.`
    );
    return null;
  }

  const texto = candidato?.content?.parts?.[0]?.text;
  return typeof texto === "string" ? texto.trim() : null;
}

// Prioriza variável de ambiente (mais seguro — nunca passa pelo banco) e só
// cai pro valor salvo em /admin/configuracoes se a env var não existir.
// Nunca lida com `configuracoes` (essa tabela tem SELECT público — ver
// migração 023) — sempre `configuracoes_secretas`, sem policy pública.
export async function getGeminiApiKey(): Promise<string | null> {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const supabase = createAdminClient();
  const { data } = await supabase.from("configuracoes_secretas").select("valor").eq("chave", CHAVE_CONFIG).maybeSingle();
  return data?.valor?.trim() || null;
}

export async function salvarGeminiApiKey(valor: string) {
  const supabase = createAdminClient();
  return supabase.from("configuracoes_secretas").upsert({ chave: CHAVE_CONFIG, valor: valor.trim() }, { onConflict: "chave" });
}

export async function removerGeminiApiKey() {
  const supabase = createAdminClient();
  return supabase.from("configuracoes_secretas").delete().eq("chave", CHAVE_CONFIG);
}

// Chama a API do Gemini com um prompt simples de texto → texto. Retorna
// null (nunca lança) quando a chave não está configurada ou a chamada
// falha — todo lugar que usa isso precisa ter um fallback sem IA, porque
// o Copiloto não pode travar a experiência do aluno por causa de uma
// chave ausente/inválida ou uma instabilidade da API do Google.
export async function gerarTextoGemini(prompt: string): Promise<string | null> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) return null;

  try {
    return await chamarGemini(apiKey, prompt, 0.7, TOKENS_TEXTO, "texto");
  } catch (e) {
    console.error("[gemini] falha na chamada:", e);
    return null;
  }
}

// ============================================================================
// PRODUÇÃO SOB DEMANDA — flashcards e seleção de vídeo
// ============================================================================

export interface FlashcardGerado {
  frente: string;
  verso: string;
}

/**
 * Gera flashcards sobre um assunto específico usando o Gemini.
 * Isso é geração de CONTEÚDO (não verificação de fato externo como um
 * link), então o risco é diferente do vídeo: aqui o risco é imprecisão
 * pedagógica, não um link inexistente. Por isso:
 *   - Todo flashcard gerado é marcado com gerado_por_ia=true (auditável)
 *   - O prompt pede conteúdo alinhado ao nível de vestibular/pré-medicina,
 *     conciso, sem inventar dados estatísticos ou números específicos
 *     que não seja possível confirmar
 *   - Retorna [] (nunca lança) em qualquer falha
 */
export async function gerarFlashcardsIA(
  materia: string,
  assunto: string,
  quantidade: number = 4
): Promise<FlashcardGerado[]> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) return [];

  const prompt = `Você é um professor especialista em ${materia}, preparando material para alunos de vestibular de Medicina.

Crie exatamente ${quantidade} flashcards de estudo sobre "${assunto}".

Regras OBRIGATÓRIAS:
- Cada flashcard tem uma "frente" (pergunta ou conceito-chave, curta) e um "verso" (resposta clara e completa, mas objetiva)
- Conteúdo tecnicamente correto e didático, nível de vestibular
- NUNCA invente números, estatísticas ou fatos específicos que você não tenha certeza absoluta
- Se o assunto envolver fórmulas, escreva-as por extenso (não use símbolos especiais que quebrem JSON)
- Varie o tipo de pergunta: definição, mecanismo, exemplo prático, diferenciação de conceitos

Responda APENAS com um JSON válido neste formato exato, sem markdown, sem comentários, sem texto antes ou depois:
[{"frente":"...","verso":"..."},{"frente":"...","verso":"..."}]`;

  try {
    const texto = await chamarGemini(apiKey, prompt, 0.4, TOKENS_FLASHCARDS, "flashcards");
    if (typeof texto !== "string") return [];

    // Remove possíveis cercas de código markdown (```json ... ```)
    const limpo = texto.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(limpo);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((f: any) => typeof f?.frente === "string" && typeof f?.verso === "string")
      .map((f: any) => ({ frente: f.frente.trim(), verso: f.verso.trim() }))
      .slice(0, quantidade);
  } catch (e) {
    console.error("[gemini] falha ao gerar flashcards:", e);
    return [];
  }
}

/**
 * Pede ao Gemini para ESCOLHER o melhor vídeo entre candidatos REAIS
 * (já verificados pela YouTube Data API — ver src/lib/youtube/client.ts).
 *
 * CRÍTICO: o Gemini nunca recebe permissão para inventar um videoId.
 * Ele só pode devolver um dos IDs que já estão na lista de candidatos.
 * Validamos isso explicitamente depois da resposta (defesa em profundidade
 * contra alucinação) — se o ID devolvido não bater com nenhum candidato,
 * descartamos e caímos no candidato de maior visualização como fallback.
 */
export async function escolherMelhorVideo(
  candidatos: Array<{ videoId: string; titulo: string; canal: string; descricao: string; visualizacoes: number; inscritosCanal: number; duracaoSegundos: number }>,
  assunto: string,
  materia: string
): Promise<string | null> {
  if (candidatos.length === 0) return null;
  if (candidatos.length === 1) return candidatos[0].videoId;

  const apiKey = await getGeminiApiKey();
  // Sem Gemini configurado: usa o de maior visualização como critério objetivo
  if (!apiKey) return candidatos[0].videoId;

  const listaFormatada = candidatos
    .map((c, i) => `${i + 1}. ID:${c.videoId} | Canal: ${c.canal} (${c.inscritosCanal.toLocaleString("pt-BR")} inscritos) | Título: ${c.titulo} | Duração: ${Math.round(c.duracaoSegundos / 60)}min | Views: ${c.visualizacoes.toLocaleString("pt-BR")}`)
    .join("\n");

  const prompt = `Você vai escolher a MELHOR vídeo-aula sobre "${assunto}" (matéria: ${materia}) para um aluno de vestibular de Medicina, entre estas opções REAIS já verificadas:

${listaFormatada}

Critérios: conteúdo completo e aprofundado (não superficial), canal educacional reconhecido, título que indica cobertura direta do assunto "${assunto}" (não apenas tangencial).

Responda APENAS com o ID exato de uma das opções acima (a parte depois de "ID:"), sem nenhum texto adicional, sem explicação.`;

  try {
    const texto = await chamarGemini(apiKey, prompt, 0.1, TOKENS_ESCOLHA, "escolha de vídeo");
    const idEscolhido = texto?.trim();

    // Defesa contra alucinação: só aceita se o ID devolvido é EXATAMENTE
    // um dos candidatos reais que enviamos. Qualquer coisa fora disso é
    // descartada e cai no fallback objetivo (mais visualizado).
    const valido = candidatos.find((c) => idEscolhido?.includes(c.videoId));
    return valido ? valido.videoId : candidatos[0].videoId;
  } catch (e) {
    console.error("[gemini] falha ao escolher vídeo:", e);
    return candidatos[0].videoId; // fallback objetivo, nunca quebra o fluxo
  }
}
