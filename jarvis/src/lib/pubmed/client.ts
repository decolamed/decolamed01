import { XMLParser } from "fast-xml-parser";
import type { Artigo, FiltrosBusca, ResultadoBusca } from "./tipos";

// ===========================================================================
// PubMed via E-utilities do NCBI
//
// Dois passos, sempre: `esearch` devolve os PMIDs que casam com a expressão de
// busca, `efetch` devolve o registro completo de cada um. Não dá para pular o
// primeiro — não existe endpoint de "busca com conteúdo".
//
// Sobre as regras do NCBI (elas são levadas a sério e o bloqueio é por IP):
//   - 3 requisições por segundo sem chave, 10 com chave.
//   - `tool` e `email` são obrigatórios na política de uso.
//   - Volume grande deve rodar fora do horário comercial dos EUA. Nada aqui é
//     volume grande: uma busca do aluno são 2 requisições.
//
// Referência: https://www.ncbi.nlm.nih.gov/books/NBK25497/
// ===========================================================================

const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

// Teto de artigos por busca. Não é economia de rede — é economia de CONTEXTO:
// 20 resumos já são ~12 mil tokens, e passar disso faz o modelo começar a
// ignorar o meio da lista em vez de ler tudo.
const MAX_ARTIGOS = 20;
const PADRAO_ARTIGOS = 8;

function credenciais() {
  return {
    chave: process.env.NCBI_API_KEY?.trim() || "",
    email: process.env.NCBI_EMAIL?.trim() || "",
    ferramenta: process.env.NCBI_TOOL?.trim() || "jarvis-pbl"
  };
}

// ---------------------------------------------------------------------------
// Fila de saída
//
// O limite do NCBI é por IP, não por usuário — ou seja, dois alunos buscando ao
// mesmo tempo somam no mesmo balde. Por isso a espera é global ao processo, e
// não um `sleep` dentro de cada chamada: chamadas concorrentes se enfileiram
// aqui em vez de saírem juntas e tomarem 429.
//
// Isso vale por instância do servidor. Num deploy com várias instâncias (o caso
// da Vercel), o teto real é o desta fila multiplicado pelo número de instâncias
// ativas — quando o volume justificar, o certo é trocar isto por um limitador
// compartilhado (Redis) em vez de apertar o intervalo abaixo.
// ---------------------------------------------------------------------------
let ultimaSaida = 0;
let fila: Promise<unknown> = Promise.resolve();

function intervaloMinimo() {
  // Uma folga sobre o limite teórico (334ms / 100ms): a contagem do NCBI é
  // feita na chegada, e a variação da rede facilmente junta duas requisições
  // que saíram bem espaçadas daqui.
  return credenciais().chave ? 120 : 400;
}

function enfileirar<T>(tarefa: () => Promise<T>): Promise<T> {
  const proxima = fila.then(async () => {
    const espera = ultimaSaida + intervaloMinimo() - Date.now();
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    ultimaSaida = Date.now();
    return tarefa();
  });
  // A fila não pode morrer por causa de uma requisição que falhou: sem este
  // `catch`, o primeiro erro deixaria a promise rejeitada e TODA busca seguinte
  // seria rejeitada junto, para sempre.
  fila = proxima.catch(() => undefined);
  return proxima;
}

function url(endpoint: string, params: Record<string, string>) {
  const { chave, email, ferramenta } = credenciais();
  const q = new URLSearchParams({ db: "pubmed", tool: ferramenta, ...params });
  if (chave) q.set("api_key", chave);
  if (email) q.set("email", email);
  return `${BASE}/${endpoint}?${q.toString()}`;
}

async function buscarNoNcbi(endpoint: string, params: Record<string, string>): Promise<string> {
  return enfileirar(async () => {
    const controlador = new AbortController();
    const relogio = setTimeout(() => controlador.abort(), 20_000);
    try {
      const res = await fetch(url(endpoint, params), {
        cache: "no-store",
        signal: controlador.signal,
        headers: { "User-Agent": `${credenciais().ferramenta} (+jarvis)` }
      });
      if (!res.ok) {
        throw new Error(`PubMed respondeu ${res.status} em ${endpoint}`);
      }
      return await res.text();
    } finally {
      clearTimeout(relogio);
    }
  });
}

// ---------------------------------------------------------------------------
// Montagem da expressão de busca
// ---------------------------------------------------------------------------

/**
 * Embute os filtros na própria expressão do PubMed. Fazer isso aqui, e não
 * filtrando o resultado depois, é o que garante que `total` seja verdadeiro e
 * que os N artigos trazidos sejam os N melhores DENTRO do filtro — filtrar
 * depois traria os melhores do geral e jogaria fora quase todos.
 */
export function montarConsulta(termo: string, filtros: FiltrosBusca = {}): string {
  const partes = [`(${termo.trim()})`];

  if (filtros.apenasRevisoes) {
    partes.push(
      '(review[pt] OR "systematic review"[pt] OR meta-analysis[pt] OR guideline[pt] OR "practice guideline"[pt])'
    );
  }

  if (filtros.ultimosAnos && filtros.ultimosAnos > 0) {
    const ate = new Date().getFullYear();
    partes.push(`("${ate - filtros.ultimosAnos}"[dp] : "${ate + 1}"[dp])`);
  }

  return partes.join(" AND ");
}

// ---------------------------------------------------------------------------
// Leitura do XML
//
// `stopNodes` faz o parser entregar o conteúdo de título e resumo como STRING
// crua, com as tags internas (<i>, <sup>, <b>) intactas. É de propósito: sem
// isso, um título como "Effect of <i>H. pylori</i> on gastritis" viraria um
// objeto e as palavras chegariam fora de ordem ao modelo. Aqui a ordem se
// preserva e as tags saem no `semTags` abaixo.
// ---------------------------------------------------------------------------
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#texto",
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  processEntities: true,
  stopNodes: ["*.ArticleTitle", "*.AbstractText", "*.VernacularTitle"]
});

const ENTIDADES_NOMEADAS: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " "
};

/**
 * Decodifica entidades XML numa passada só.
 *
 * Isto existe porque `stopNodes` entrega o conteúdo como XML CRU — e conteúdo
 * cru não passa pelo `processEntities` do parser. Justamente nos dois campos
 * que mais têm entidade: o título e o resumo, cheios de acento do português,
 * letra grega e subscrito de fórmula. Sem esta função, o aluno lê
 * "Dor tor&#xE1;cica" e "H&#x2082;O" no resumo dele.
 *
 * A passada única é proposital: fazer `&amp;` -> `&` num replace separado
 * transformaria "&amp;#x41;" (o texto literal "&#x41;") em "A".
 */
function decodificarEntidades(texto: string): string {
  return texto.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (inteiro, corpo: string) => {
    if (corpo.startsWith("#")) {
      const hex = corpo[1] === "x" || corpo[1] === "X";
      const codigo = parseInt(hex ? corpo.slice(2) : corpo.slice(1), hex ? 16 : 10);
      if (!Number.isFinite(codigo) || codigo <= 0 || codigo > 0x10ffff) return inteiro;
      return String.fromCodePoint(codigo);
    }
    return ENTIDADES_NOMEADAS[corpo.toLowerCase()] ?? inteiro;
  });
}

/** Tira a marcação inline que sobrou do `stopNodes` e normaliza o espaço. */
function semTags(bruto: unknown): string {
  if (bruto === null || bruto === undefined) return "";
  const texto = typeof bruto === "string" ? bruto : lerTexto(bruto);
  // A ordem importa: tira a tag ANTES de decodificar. Ao contrário, um
  // "&lt;i&gt;" — que no original era o texto literal "<i>" — viraria uma tag
  // de verdade e seria apagado no passo seguinte.
  return decodificarEntidades(texto.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/** Achata qualquer nó do parser em texto legível. */
function lerTexto(no: unknown): string {
  if (no === null || no === undefined) return "";
  if (typeof no === "string" || typeof no === "number") return String(no);
  if (Array.isArray(no)) return no.map(lerTexto).join(" ");
  if (typeof no === "object") {
    const obj = no as Record<string, unknown>;
    if ("#texto" in obj) return lerTexto(obj["#texto"]);
    return Object.entries(obj)
      .filter(([chave]) => !chave.startsWith("@_"))
      .map(([, valor]) => lerTexto(valor))
      .join(" ");
  }
  return "";
}

/** O E-utilities devolve um objeto quando há um item e um array quando há vários. */
function comoLista(valor: unknown): unknown[] {
  if (valor === null || valor === undefined) return [];
  return Array.isArray(valor) ? valor : [valor];
}

function lerResumo(abstract: unknown): string {
  const trechos = comoLista((abstract as Record<string, unknown>)?.AbstractText);
  if (trechos.length === 0) return "";

  return trechos
    .map((trecho) => {
      const rotulo =
        typeof trecho === "object" && trecho !== null
          ? String((trecho as Record<string, unknown>)["@_Label"] ?? "").trim()
          : "";
      const corpo = semTags(trecho);
      if (!corpo) return "";
      // Resumo estruturado do PubMed vem em blocos rotulados (BACKGROUND,
      // METHODS...). Manter o rótulo custa poucas palavras e muda muito a
      // qualidade da leitura: é a diferença entre o modelo saber que aquilo é
      // uma conclusão ou apenas o desenho do estudo.
      return rotulo ? `${rotulo.toUpperCase()}: ${corpo}` : corpo;
    })
    .filter(Boolean)
    .join("\n\n");
}

function lerAutores(lista: unknown): string[] {
  return comoLista((lista as Record<string, unknown>)?.Author)
    .map((autor) => {
      const a = autor as Record<string, unknown>;
      const sobrenome = lerTexto(a?.LastName).trim();
      const iniciais = lerTexto(a?.Initials).trim();
      if (sobrenome) return iniciais ? `${sobrenome} ${iniciais}` : sobrenome;
      // Consórcio ("The SPRINT Research Group") entra como CollectiveName.
      return lerTexto(a?.CollectiveName).trim();
    })
    .filter(Boolean);
}

function lerAno(article: Record<string, unknown>): string {
  const data = (article?.Journal as Record<string, unknown>)?.JournalIssue as Record<string, unknown>;
  const pubDate = data?.PubDate as Record<string, unknown> | undefined;
  const ano = lerTexto(pubDate?.Year).trim();
  if (ano) return ano;
  // Alguns registros só trazem MedlineDate ("2019 Jan-Feb", "1998-1999").
  const medline = lerTexto(pubDate?.MedlineDate);
  return medline.match(/\d{4}/)?.[0] ?? "";
}

function lerDoi(article: Record<string, unknown>, pubmedData: unknown): string | null {
  for (const id of comoLista(article?.ELocationID)) {
    const e = id as Record<string, unknown>;
    if (String(e?.["@_EIdType"]) === "doi") return lerTexto(e).trim() || null;
  }
  const lista = (pubmedData as Record<string, unknown>)?.ArticleIdList;
  for (const id of comoLista((lista as Record<string, unknown>)?.ArticleId)) {
    const e = id as Record<string, unknown>;
    if (String(e?.["@_IdType"]) === "doi") return lerTexto(e).trim() || null;
  }
  return null;
}

function converterArtigo(registro: unknown): Artigo | null {
  const citacao = (registro as Record<string, unknown>)?.MedlineCitation as Record<string, unknown>;
  if (!citacao) return null;

  const article = citacao.Article as Record<string, unknown>;
  if (!article) return null;

  const pmid = lerTexto(citacao.PMID).trim();
  if (!pmid) return null;

  const revista = (article.Journal as Record<string, unknown>) ?? {};

  return {
    pmid,
    titulo: semTags(article.ArticleTitle) || semTags(article.VernacularTitle) || "(sem título)",
    autores: lerAutores(article.AuthorList),
    revista: lerTexto(revista.ISOAbbreviation).trim() || lerTexto(revista.Title).trim(),
    ano: lerAno(article),
    doi: lerDoi(article, (registro as Record<string, unknown>)?.PubmedData),
    resumo: lerResumo(article.Abstract),
    tipos: comoLista((article.PublicationTypeList as Record<string, unknown>)?.PublicationType)
      .map((t) => lerTexto(t).trim())
      .filter(Boolean),
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
  };
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/** Busca no PubMed e já traz o registro completo de cada resultado. */
export async function buscar(termo: string, filtros: FiltrosBusca = {}): Promise<ResultadoBusca> {
  const consulta = montarConsulta(termo, filtros);
  const quantidade = Math.min(Math.max(filtros.quantidade ?? PADRAO_ARTIGOS, 1), MAX_ARTIGOS);

  const bruto = await buscarNoNcbi("esearch.fcgi", {
    term: consulta,
    retmode: "json",
    retmax: String(quantidade),
    sort: "relevance"
  });

  const dados = JSON.parse(bruto) as {
    esearchresult?: { idlist?: string[]; count?: string; ERROR?: string };
  };

  if (dados.esearchresult?.ERROR) {
    throw new Error(`PubMed recusou a busca: ${dados.esearchresult.ERROR}`);
  }

  const pmids = dados.esearchresult?.idlist ?? [];
  const total = Number(dados.esearchresult?.count ?? 0);

  if (pmids.length === 0) return { consulta, total, artigos: [] };

  return { consulta, total, artigos: await porPmid(pmids) };
}

/**
 * Converte a resposta XML do `efetch` em artigos.
 *
 * Separada de `porPmid` de propósito: é a única parte frágil deste arquivo (o
 * XML do PubMed tem uns cinco jeitos diferentes de dizer a mesma coisa) e é a
 * única que dá para testar sem rede. Ver client.test.mjs.
 */
export function interpretarXml(xml: string): Artigo[] {
  const arvore = parser.parse(xml) as Record<string, unknown>;
  const conjunto = arvore?.PubmedArticleSet as Record<string, unknown> | undefined;

  return comoLista(conjunto?.PubmedArticle)
    .map(converterArtigo)
    .filter((a): a is Artigo => a !== null);
}

/** Traz os registros completos de uma lista de PMIDs, na ordem em que vieram. */
export async function porPmid(pmids: string[]): Promise<Artigo[]> {
  const limpos = pmids.map((p) => p.trim()).filter((p) => /^\d+$/.test(p));
  if (limpos.length === 0) return [];

  const xml = await buscarNoNcbi("efetch.fcgi", {
    id: limpos.slice(0, MAX_ARTIGOS).join(","),
    retmode: "xml"
  });

  // O efetch devolve na ordem dele, não na que pedimos. Como a ordem do
  // esearch é a de RELEVÂNCIA, perder isso jogaria fora o ranking do PubMed.
  const porId = new Map(interpretarXml(xml).map((a) => [a.pmid, a]));
  return limpos.map((id) => porId.get(id)).filter((a): a is Artigo => a !== undefined);
}
