// ============================================================================
// AUTOAVALIAÇÃO DO BRIEFING — como matéria e sentimento viajam até o servidor
//
// O briefing pergunta, matéria a matéria, se o aluno tem Domínio, Atenção ou
// Turbulência. Isso ia no FormData com a MATÉRIA DENTRO DO NOME DO CAMPO:
//
//     fd.set(`sentimento_${materia}`, sentimento)   // sentimento_Física
//
// Nome de campo em multipart/form-data viaja no cabeçalho
// `Content-Disposition: form-data; name="..."`. Cabeçalho é território de
// bytes latin-1 por herança (RFC 2183/7578): não existe garantia de que um
// nome com acento chegue do outro lado como saiu. O VALOR, esse sim, tem
// codificação definida e atravessa intacto.
//
// Foi o que aconteceu de verdade neste banco — um briefing gravado com:
//
//     "FÃ­sica": "Turbulência"      ← chave corrompida, valor perfeito
//
// O aluno respondeu Turbulência para Física. O Copiloto lê o sentimento por
// `sentimentos[matéria]`; "FÃ­sica" nunca casa com "Física", então a resposta
// virava "Atenção" e a matéria que ele mais precisava perdia prioridade.
// Física, Química, Inglês, História e Matemática — as cinco acentuadas —
// eram descartadas; Biologia, Geografia, Linguagens e Espanhol passavam.
//
// A correção não é tratar acento: é PARAR DE USAR A MATÉRIA COMO NOME DE
// CAMPO. Aqui ela vira valor, e os nomes ficam ASCII e indexados:
//
//     sentimento_materia_0 = "Física"        sentimento_valor_0 = "Turbulência"
//     sentimento_materia_1 = "Biologia"      sentimento_valor_1 = "Domínio"
//
// Vale para qualquer caractere — acento, cedilha, hífen, maiúscula — porque
// nada do nome da matéria toca o cabeçalho. E o nome chega ao banco EXATO
// como está no conteúdo: "Física" continua "Física", nunca "Fisica".
// ============================================================================

export const SENTIMENTOS_VALIDOS = new Set(["Domínio", "Atenção", "Turbulência"]);

const PREFIXO_MATERIA = "sentimento_materia_";
const PREFIXO_VALOR = "sentimento_valor_";
/** Formato antigo, mantido só para leitura — ver `lerSentimentos`. */
const PREFIXO_LEGADO = "sentimento_";

/** Só o que estes helpers precisam de um FormData — o resto não interessa. */
interface FormLike {
  set(nome: string, valor: string): void;
  get(nome: string): unknown;
  entries(): IterableIterator<[string, unknown]>;
}

/**
 * Grava a autoavaliação no FormData: matéria e sentimento como VALORES de
 * campos de nome ASCII.
 */
export function escreverSentimentos(fd: FormLike, sentimentos: Record<string, string>): void {
  Object.entries(sentimentos).forEach(([materia, sentimento], i) => {
    fd.set(`${PREFIXO_MATERIA}${i}`, materia);
    fd.set(`${PREFIXO_VALOR}${i}`, sentimento);
  });
}

/**
 * Lê a autoavaliação do FormData, descartando sentimento que não seja um dos
 * três válidos e matéria vazia.
 *
 * Ainda entende o formato antigo (`sentimento_<Matéria>`) para uma aba já
 * aberta no navegador não perder a resposta durante a virada. O que chegar
 * por ali continua sujeito à corrupção de cabeçalho — é a razão de o formato
 * existir só na leitura, e nunca mais na escrita.
 */
export function lerSentimentos(fd: FormLike): Record<string, string> {
  const sentimentos: Record<string, string> = {};

  for (let i = 0; ; i++) {
    const materia = fd.get(`${PREFIXO_MATERIA}${i}`);
    const valor = fd.get(`${PREFIXO_VALOR}${i}`);
    if (materia == null || valor == null) break;
    const nome = String(materia).trim();
    const sentimento = String(valor);
    if (nome && SENTIMENTOS_VALIDOS.has(sentimento)) sentimentos[nome] = sentimento;
  }

  if (Object.keys(sentimentos).length > 0) return sentimentos;

  for (const [chave, valor] of fd.entries()) {
    if (!chave.startsWith(PREFIXO_LEGADO)) continue;
    if (chave.startsWith(PREFIXO_MATERIA) || chave.startsWith(PREFIXO_VALOR)) continue;
    const nome = chave.slice(PREFIXO_LEGADO.length).trim();
    const sentimento = String(valor);
    if (nome && SENTIMENTOS_VALIDOS.has(sentimento)) sentimentos[nome] = sentimento;
  }

  return sentimentos;
}
