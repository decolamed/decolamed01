import type { Referencia, ResumoRenderizado } from "./tipos";

// ===========================================================================
// O RESUMO
//
// Esta é a peça que separa o Jarvis de um chat comum: o que sobra do estudo
// não é um rolo de conversa, é um documento com hierarquia visual — seção,
// bloco, termo grifado, fonte numerada.
//
// A gramática abaixo é markdown com quatro acréscimos. Ela é escrita PELO
// MODELO, então precisa ser simples o bastante para ele acertar sempre e
// tolerante o bastante para que um erro dele degrade em texto comum, nunca em
// tela quebrada. Toda linha que não casa com nada vira parágrafo.
//
//   # Título        ## Seção       ### Subseção
//   **negrito**     *itálico*      ==grifado==     `código`
//   - lista          1. numerada    > citação       ---
//   | tabela | com | pipes |
//
//   :::conceito Título opcional        o que é / definição
//   :::clinico  Título opcional        como aparece no paciente
//   :::atencao  Título opcional        pegadinha, erro comum, contraindicação
//   :::fluxo    Título opcional        passo a passo / conduta
//   conteúdo do bloco
//   :::
//
//   [@34567890]     citação — vira número sobrescrito ligado à fonte no fim
//
// SEGURANÇA: a primeira coisa que acontece com qualquer texto é escapar HTML.
// Daí para frente só emitimos marcação nossa. É isso que torna seguro entregar
// o resultado com `dangerouslySetInnerHTML` — nem a saída do modelo nem o que
// o aluno digitou conseguem injetar uma tag.
// ===========================================================================

const BLOCOS = {
  conceito: { rotulo: "Conceito", classe: "b-conceito" },
  clinico: { rotulo: "Na prática clínica", classe: "b-clinico" },
  atencao: { rotulo: "Atenção", classe: "b-atencao" },
  fluxo: { rotulo: "Passo a passo", classe: "b-fluxo" }
} as const;

type TipoBloco = keyof typeof BLOCOS;

function ehTipoBloco(v: string): v is TipoBloco {
  return v in BLOCOS;
}

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface OpcoesDeRender {
  /**
   * No resumo, o número da citação leva à lista de fontes no rodapé — a lista
   * existe e é ela que traz autor, revista e ano. Na conversa não há rodapé
   * nenhum, então ali o número tem que abrir o artigo no PubMed direto, senão
   * é um link para lugar nenhum.
   */
  citacaoAbrePubmed?: boolean;
}

/** Estado que atravessa o documento inteiro: a numeração das citações. */
interface Numeracao {
  ordem: string[];
  orfas: Set<string>;
  disponiveis: Map<string, Referencia>;
  opcoes: OpcoesDeRender;
}

function numeroDaCitacao(pmid: string, n: Numeracao): number {
  const existente = n.ordem.indexOf(pmid);
  if (existente >= 0) return existente + 1;
  n.ordem.push(pmid);
  if (!n.disponiveis.has(pmid)) n.orfas.add(pmid);
  return n.ordem.length;
}

// ---------------------------------------------------------------------------
// Formatação dentro da linha
// ---------------------------------------------------------------------------

// Sentinela que guarda trechos de código enquanto o resto da formatação roda.
// É um texto imprimível de propósito: um caractere de controle aqui é
// invisível em diff, em log e em revisão de código, e vira o tipo de defeito
// que ninguém enxerga lendo o arquivo.
const SENTINELA = "«COD";
const FIM_SENTINELA = "»";

function inline(bruto: string, n: Numeracao): string {
  let texto = escapar(bruto);

  // `código` sai de cena primeiro e volta no fim. Sem isso, um trecho como
  // `**ptr` seria lido como início de negrito e a formatação vazaria dali para
  // o resto do parágrafo.
  const guardados: string[] = [];
  texto = texto.replace(/`([^`]+)`/g, (_, conteudo: string) => {
    guardados.push(`<code class="r-codigo">${conteudo}</code>`);
    return `${SENTINELA}${guardados.length - 1}${FIM_SENTINELA}`;
  });

  texto = texto
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="r-forte">$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/==([^=\n]+)==/g, '<mark class="r-grifo">$1</mark>');

  // Citação. O número leva à lista de fontes no fim da página; a própria lista
  // é que leva ao PubMed. Assim o aluno confere a fonte sem perder o lugar
  // onde estava lendo.
  texto = texto.replace(/\[@(\d{1,10})\]/g, (_, pmid: string) => {
    const numero = numeroDaCitacao(pmid, n);
    const paraPubmed = n.opcoes.citacaoAbrePubmed;
    const destino = paraPubmed ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : `#fonte-${pmid}`;
    const extras = paraPubmed ? ' target="_blank" rel="noopener noreferrer"' : "";
    const titulo = paraPubmed ? `Abrir o PMID ${pmid} no PubMed` : `Ver a fonte ${numero}`;
    return `<a class="r-citacao" href="${destino}"${extras} title="${titulo}" data-pmid="${pmid}">${numero}</a>`;
  });

  // Link markdown comum. Só http/https: sem esta trava, um
  // `[texto](javascript:...)` escrito pelo modelo viraria link executável.
  texto = texto.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a class="r-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return texto.replace(
    new RegExp(`${SENTINELA}(\\d+)${FIM_SENTINELA}`, "g"),
    (_, i: string) => guardados[Number(i)] ?? ""
  );
}

// ---------------------------------------------------------------------------
// Blocos
// ---------------------------------------------------------------------------
function ehSeparadorDeTabela(linha: string): boolean {
  return /^\|?[\s:|-]+\|[\s:|-]*$/.test(linha.trim()) && linha.includes("-");
}

function celulas(linha: string): string[] {
  return linha
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function ehInicioDeOutroBloco(linha: string): boolean {
  return (
    linha === "" ||
    linha.startsWith(":::") ||
    linha.startsWith("#") ||
    linha.startsWith(">") ||
    linha.startsWith("|") ||
    /^(-{3,}|\*{3,})$/.test(linha) ||
    /^(?:[-*+]|\d+[.)])\s+/.test(linha)
  );
}

function renderizarBlocos(linhas: string[], n: Numeracao): string {
  const saida: string[] = [];
  let i = 0;

  while (i < linhas.length) {
    const linha = linhas[i];
    const cru = linha.trim();

    if (cru === "") {
      i++;
      continue;
    }

    // ---- bloco destacado :::tipo ----
    const abertura = cru.match(/^:::\s*([a-zA-Z]+)\s*(.*)$/);
    if (abertura) {
      const tipo = abertura[1].toLowerCase();
      const tituloDoBloco = abertura[2].trim();
      const dentro: string[] = [];
      i++;
      while (i < linhas.length && linhas[i].trim() !== ":::") {
        dentro.push(linhas[i]);
        i++;
      }
      i++; // consome o ":::" de fechamento

      // Tipo desconhecido não vira tela em branco: cai no bloco neutro e o
      // conteúdo continua legível.
      const def = ehTipoBloco(tipo)
        ? BLOCOS[tipo]
        : { rotulo: tituloDoBloco || "Nota", classe: "b-nota" };
      const rotulo = ehTipoBloco(tipo) ? tituloDoBloco || def.rotulo : def.rotulo;

      saida.push(
        `<aside class="r-bloco ${def.classe}">` +
          `<p class="r-bloco-rotulo">${inline(rotulo, n)}</p>` +
          `<div class="r-bloco-corpo">${renderizarBlocos(dentro, n)}</div>` +
          `</aside>`
      );
      continue;
    }

    // ---- título ----
    const titulo = cru.match(/^(#{1,4})\s+(.*)$/);
    if (titulo) {
      const nivel = titulo[1].length;
      saida.push(`<h${nivel} class="r-h${nivel}">${inline(titulo[2], n)}</h${nivel}>`);
      i++;
      continue;
    }

    // ---- linha divisória ----
    if (/^(-{3,}|\*{3,})$/.test(cru)) {
      saida.push('<hr class="r-regua" />');
      i++;
      continue;
    }

    // ---- tabela ----
    if (cru.startsWith("|") && i + 1 < linhas.length && ehSeparadorDeTabela(linhas[i + 1])) {
      const cabecalho = celulas(linha);
      i += 2;
      const corpo: string[][] = [];
      while (i < linhas.length && linhas[i].trim().startsWith("|")) {
        corpo.push(celulas(linhas[i]));
        i++;
      }
      saida.push(
        // A rolagem fica no invólucro, não na tabela: numa tela de celular a
        // tabela rola sozinha em vez de empurrar a página inteira para o lado.
        '<div class="r-tabela-rolagem"><table class="r-tabela"><thead><tr>' +
          cabecalho.map((c) => `<th>${inline(c, n)}</th>`).join("") +
          "</tr></thead><tbody>" +
          corpo
            .map(
              (linhaCorpo) =>
                "<tr>" +
                cabecalho
                  .map((_, coluna) => `<td>${inline(linhaCorpo[coluna] ?? "", n)}</td>`)
                  .join("") +
                "</tr>"
            )
            .join("") +
          "</tbody></table></div>"
      );
      continue;
    }

    // ---- listas ----
    const marcadorLista = cru.match(/^[-*+]\s+(.*)$/);
    const marcadorNumero = cru.match(/^\d+[.)]\s+(.*)$/);
    if (marcadorLista || marcadorNumero) {
      const ordenada = Boolean(marcadorNumero);
      const itens: string[] = [];

      while (i < linhas.length) {
        const atual = linhas[i];
        const recuo = atual.length - atual.trimStart().length;
        const conteudo = atual.trim();
        const item = ordenada
          ? conteudo.match(/^\d+[.)]\s+(.*)$/)
          : conteudo.match(/^[-*+]\s+(.*)$/);

        if (!item) break;

        if (recuo >= 2 && itens.length > 0) {
          // Sublista: entra dentro do último item em vez de virar item irmão.
          const filhos: string[] = [];
          while (i < linhas.length) {
            const filho = linhas[i];
            const recuoFilho = filho.length - filho.trimStart().length;
            const textoFilho = filho.trim().match(/^(?:[-*+]|\d+[.)])\s+(.*)$/);
            if (recuoFilho < 2 || !textoFilho) break;
            filhos.push(`<li>${inline(textoFilho[1], n)}</li>`);
            i++;
          }
          itens[itens.length - 1] = itens[itens.length - 1].replace(
            /<\/li>$/,
            `<ul class="r-lista-interna">${filhos.join("")}</ul></li>`
          );
          continue;
        }

        itens.push(`<li>${inline(item[1], n)}</li>`);
        i++;
      }

      const tag = ordenada ? "ol" : "ul";
      saida.push(`<${tag} class="r-lista">${itens.join("")}</${tag}>`);
      continue;
    }

    // ---- citação em bloco ----
    if (cru.startsWith(">")) {
      const trechos: string[] = [];
      while (i < linhas.length && linhas[i].trim().startsWith(">")) {
        trechos.push(linhas[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      saida.push(
        `<blockquote class="r-citacao-bloco">${inline(trechos.join(" "), n)}</blockquote>`
      );
      continue;
    }

    // ---- parágrafo ----
    const paragrafo: string[] = [];
    while (i < linhas.length && !ehInicioDeOutroBloco(linhas[i].trim())) {
      paragrafo.push(linhas[i].trim());
      i++;
    }
    if (paragrafo.length > 0) {
      saida.push(`<p class="r-p">${inline(paragrafo.join(" "), n)}</p>`);
    } else {
      // Rede de segurança: se nada casou E o parágrafo saiu vazio, o `i` não
      // andaria e o laço giraria para sempre. Não deveria acontecer — mas um
      // laço infinito no servidor é caro demais para depender de "não deveria".
      i++;
    }
  }

  return saida.join("");
}

/** Transforma o corpo do resumo em HTML pronto para a tela e para a impressão. */
export function renderizar(
  corpo: string,
  referencias: Referencia[] = [],
  opcoes: OpcoesDeRender = {}
): ResumoRenderizado {
  const numeracao: Numeracao = {
    ordem: [],
    orfas: new Set(),
    disponiveis: new Map(referencias.map((r) => [r.pmid, r])),
    opcoes
  };

  const linhas = corpo.replace(/\r\n?/g, "\n").split("\n");
  const html = renderizarBlocos(linhas, numeracao);

  const citadas = numeracao.ordem
    .map((pmid) => numeracao.disponiveis.get(pmid))
    .filter((r): r is Referencia => r !== undefined);

  return { html, citadas, citacoesOrfas: [...numeracao.orfas] };
}

/** "Choi IJ, Kook MC, Park JY, et al." — corta em 3, como manda a Vancouver. */
export function autoresAbreviados(autores: string[]): string {
  if (autores.length === 0) return "";
  if (autores.length <= 3) return autores.join(", ");
  return `${autores.slice(0, 3).join(", ")}, et al.`;
}
