import {
  ErroDeMotor,
  type Acao,
  type Conversa,
  type EsquemaFerramenta,
  type Ferramenta,
  type PropriedadeEsquema,
  type Resposta
} from "./tipos";

// ===========================================================================
// Motor Gemini — mesmo laço de ferramentas, API completamente diferente.
// ===========================================================================

// Alias mantido pela própria Google apontando para o Flash vigente. Fixar um
// nome com versão ("gemini-2.0-flash") funciona até o dia em que aquele modelo
// sai do ar ou perde a cota gratuita — e aí a integração quebra sozinha, sem
// nenhuma mudança no nosso código.
const MODELO = "gemini-flash-latest";

// ATENÇÃO ao mexer neste número.
//
// O alias acima aponta para um modelo que RACIOCINA antes de escrever, e os
// tokens do raciocínio saem deste mesmo teto. Com um teto apertado acontece a
// pior falha possível: a API responde HTTP 200, o raciocínio come o orçamento
// inteiro e o campo de texto volta VAZIO — sem erro nenhum. Por isso o valor é
// folgado: ele não é o tamanho esperado da resposta, é o teto de
// raciocínio + resposta.
const MAX_TOKENS = 16_000;
const MAX_PASSOS = 8;

export function geminiDisponivel(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function chave(): string {
  const k = process.env.GEMINI_API_KEY?.trim();
  if (!k) {
    throw new ErroDeMotor("gemini", "O motor Gemini não está configurado neste servidor (falta GEMINI_API_KEY).");
  }
  return k;
}

// ---------------------------------------------------------------------------
// Tradução do esquema
//
// O Gemini usa um subconjunto do OpenAPI, e não JSON Schema: os tipos vão em
// MAIÚSCULA e campos que ele não conhece fazem a requisição inteira ser
// recusada com 400. Por isso a conversão é por lista de permissão — só passa o
// que está escrito aqui.
// ---------------------------------------------------------------------------
function traduzirPropriedade(p: PropriedadeEsquema): Record<string, unknown> {
  const saida: Record<string, unknown> = { type: p.type.toUpperCase() };
  if (p.description) saida.description = p.description;
  if (p.enum) saida.enum = p.enum;
  if (p.items) saida.items = traduzirPropriedade(p.items);
  if (p.properties) {
    saida.properties = Object.fromEntries(
      Object.entries(p.properties).map(([nome, sub]) => [nome, traduzirPropriedade(sub)])
    );
  }
  if (p.required?.length) saida.required = p.required;
  return saida;
}

function traduzirEsquema(e: EsquemaFerramenta): Record<string, unknown> {
  return {
    type: "OBJECT",
    properties: Object.fromEntries(
      Object.entries(e.properties).map(([nome, p]) => [nome, traduzirPropriedade(p)])
    ),
    ...(e.required?.length ? { required: e.required } : {})
  };
}

// ---------------------------------------------------------------------------
// Formato da conversa
// ---------------------------------------------------------------------------
interface Parte {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
}

interface Conteudo {
  role: "user" | "model";
  parts: Parte[];
}

interface RespostaApi {
  candidates?: Array<{
    content?: { parts?: Parte[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
}

async function chamar(corpo: unknown): Promise<RespostaApi> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent` +
    `?key=${encodeURIComponent(chave())}`;

  const controlador = new AbortController();
  const relogio = setTimeout(() => controlador.abort(), 120_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      cache: "no-store",
      signal: controlador.signal
    });

    const dados = (await res.json().catch(() => ({}))) as RespostaApi;

    if (!res.ok) {
      if (res.status === 400 || res.status === 403) {
        throw new ErroDeMotor("gemini", "A chave do Gemini foi recusada ou o pedido é inválido.", dados.error);
      }
      if (res.status === 429) {
        throw new ErroDeMotor("gemini", "A cota do Gemini estourou. Tente de novo em alguns minutos.", dados.error);
      }
      throw new ErroDeMotor("gemini", "Não consegui falar com o Gemini agora.", dados.error);
    }

    return dados;
  } catch (e) {
    if (e instanceof ErroDeMotor) throw e;
    throw new ErroDeMotor("gemini", "Não consegui falar com o Gemini agora.", e);
  } finally {
    clearTimeout(relogio);
  }
}

function lerPartes(resposta: RespostaApi): Parte[] {
  if (resposta.promptFeedback?.blockReason) {
    throw new ErroDeMotor(
      "gemini",
      "O Gemini bloqueou este pedido por filtro de conteúdo. Se for um caso clínico legítimo, reescreva com os termos técnicos."
    );
  }

  const candidato = resposta.candidates?.[0];

  // O caso silencioso: HTTP 200, `finishReason: MAX_TOKENS`, texto vazio.
  // Sem esta checagem, o aluno recebe uma mensagem em branco e nada no log.
  if (candidato?.finishReason === "MAX_TOKENS") {
    throw new ErroDeMotor("gemini", "A resposta do Gemini foi cortada no meio. Tente uma pergunta mais específica.");
  }
  if (candidato?.finishReason === "SAFETY" || candidato?.finishReason === "PROHIBITED_CONTENT") {
    throw new ErroDeMotor("gemini", "O Gemini bloqueou a resposta por filtro de conteúdo.");
  }

  return candidato?.content?.parts ?? [];
}

export async function conversarComGemini(conversa: Conversa): Promise<Resposta> {
  const porNome = new Map(conversa.ferramentas.map((f) => [f.nome, f]));
  const maxPassos = conversa.maxPassos ?? MAX_PASSOS;
  const acoes: Acao[] = [];

  const contents: Conteudo[] = conversa.turnos.map((t) => ({
    role: t.papel === "usuario" ? "user" : "model",
    parts: [{ text: t.texto }]
  }));

  const declaracoes = conversa.ferramentas.map((f: Ferramenta) => ({
    name: f.nome,
    description: f.descricao,
    parameters: traduzirEsquema(f.esquema)
  }));

  for (let passo = 0; passo <= maxPassos; passo++) {
    const ultimoPasso = passo === maxPassos;

    const resposta = await chamar({
      systemInstruction: { parts: [{ text: conversa.sistema }] },
      contents,
      tools: [{ functionDeclarations: declaracoes }],
      toolConfig: { functionCallingConfig: { mode: ultimoPasso ? "NONE" : "AUTO" } },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: conversa.maxTokens ?? MAX_TOKENS
      }
    });

    const partes = lerPartes(resposta);
    const chamadas = partes.filter((p) => p.functionCall).map((p) => p.functionCall!);

    if (chamadas.length === 0) {
      const texto = partes
        .map((p) => p.text ?? "")
        .join("\n")
        .trim();
      return { texto, acoes, motor: "gemini" };
    }

    contents.push({ role: "model", parts: partes });

    const respostas: Parte[] = await Promise.all(
      chamadas.map(async (chamada): Promise<Parte> => {
        const ferramenta = porNome.get(chamada.name);
        if (!ferramenta) {
          acoes.push({ ferramenta: chamada.name, descricao: `Ferramenta desconhecida: ${chamada.name}`, erro: true });
          return { functionResponse: { name: chamada.name, response: { erro: `A ferramenta ${chamada.name} não existe.` } } };
        }

        try {
          const r = await ferramenta.executar(chamada.args ?? {});
          acoes.push({ ferramenta: chamada.name, descricao: r.paraTela, erro: Boolean(r.erro) });
          return { functionResponse: { name: chamada.name, response: { resultado: r.paraModelo } } };
        } catch (e) {
          const motivo = e instanceof Error ? e.message : "falha desconhecida";
          acoes.push({ ferramenta: chamada.name, descricao: motivo, erro: true });
          return { functionResponse: { name: chamada.name, response: { erro: motivo } } };
        }
      })
    );

    // O Gemini espera o resultado da função com papel "user" — não existe um
    // papel "tool" aqui, ao contrário do Claude.
    contents.push({ role: "user", parts: respostas });
  }

  throw new ErroDeMotor("gemini", "A conversa passou do limite de passos sem chegar a uma resposta.");
}
