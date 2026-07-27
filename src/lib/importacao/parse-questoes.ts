// Parser heurístico de questões coladas como texto (ou extraídas de um PDF
// — ver actions.ts). Reconhece o formato mais comum de banco de questões:
//
//   1) Enunciado da questão...
//   a) alternativa 1
//   b) alternativa 2
//   c) alternativa 3
//   Gabarito: B
//
// Números/letras podem vir com ")", "." ou "-" depois, e entre parênteses.
// Não é um parser universal — é um ponto de partida que deixa tudo revisável
// (e editável) antes de salvar, exatamente pra cobrir os casos que o regex
// não acertar de primeira.

export interface QuestaoParseada {
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  gabarito: string | null;
  erro: string | null;
}

const RE_QUESTAO_INICIO = /^\s*(?:quest[ãa]o\s*)?(\d{1,3})[.)\-:]\s*(.*)$/i;
const RE_ALTERNATIVA = /^\s*\(?([a-eA-E])\)[.)\-:]?\s*(.*)$|^\s*\(?([a-eA-E])\)\s*(.*)$|^\s*([a-eA-E])[.)\-]\s+(.*)$/;
const RE_GABARITO = /^\s*(?:gabarito|resposta(?:\s+correta)?|resp\.?)\s*:?\s*\(?([a-eA-E])\)?\s*$/i;

function casarAlternativa(linha: string): { letra: string; texto: string } | null {
  const m = linha.match(RE_ALTERNATIVA);
  if (!m) return null;
  const letra = (m[1] || m[3] || m[5])?.toLowerCase();
  const texto = (m[2] ?? m[4] ?? m[6] ?? "").trim();
  if (!letra) return null;
  return { letra, texto };
}

export function parseQuestoesTexto(texto: string): QuestaoParseada[] {
  const linhas = texto.split(/\r?\n/);
  const blocos: string[][] = [];
  let atual: string[] | null = null;

  for (const linhaRaw of linhas) {
    const linha = linhaRaw.trim();
    if (!linha) continue;
    const inicio = linha.match(RE_QUESTAO_INICIO);
    if (inicio) {
      if (atual && atual.length) blocos.push(atual);
      atual = [inicio[2]];
    } else if (atual) {
      atual.push(linha);
    }
  }
  if (atual && atual.length) blocos.push(atual);

  return blocos.map((linhasBloco) => {
    const enunciadoLinhas: string[] = [];
    const alternativas: { letra: string; texto: string }[] = [];
    let gabarito: string | null = null;
    let entrouEmAlternativas = false;

    for (const linha of linhasBloco) {
      const mGab = linha.match(RE_GABARITO);
      if (mGab) {
        gabarito = mGab[1].toLowerCase();
        continue;
      }
      const alt = casarAlternativa(linha);
      if (alt) {
        entrouEmAlternativas = true;
        alternativas.push(alt);
        continue;
      }
      if (!entrouEmAlternativas) enunciadoLinhas.push(linha);
    }

    const enunciado = enunciadoLinhas.join(" ").replace(/\s+/g, " ").trim();
    let erro: string | null = null;
    if (!enunciado) erro = "Enunciado não identificado.";
    else if (alternativas.length < 2) erro = "Menos de 2 alternativas identificadas.";
    else if (!gabarito) erro = "Gabarito não identificado.";
    else if (!alternativas.some((a) => a.letra === gabarito)) erro = "Gabarito não corresponde a nenhuma alternativa encontrada.";

    return { enunciado, alternativas, gabarito, erro };
  });
}
