import { normalizar } from "@/lib/trilha/catalogo";

// ============================================================================
// CLASSIFICAÇÃO AUTOMÁTICA DE MATÉRIA
//
// As 253 aulas importadas foram classificadas pela matéria do item de
// "questões" do MESMO DIA do cronograma — a única pista disponível quando os
// títulos ainda eram "Aula 1", "Aula 2". A heurística errou muito: um dia de
// Linguagens com uma aula de Química colocava a aula em Linguagens. Havia
// "REAÇÕES ORGÂNICAS" em Linguagens e "Figuras de Linguagem" em Física.
//
// Com os títulos reais e o canal do YouTube dá para acertar de verdade.
// Dois sinais, nesta ordem:
//
//   1. Assunto no título — "mitose", "estequiometria", "Segunda Guerra".
//      É o sinal mais específico: diz do que a aula TRATA.
//   2. Canal — "Biologia com Samuel Cunha" só publica Biologia. Serve de
//      desempate e cobre títulos que não citam o assunto explicitamente.
//
// O título vem primeiro de propósito: canais generalistas (ProEnem,
// Descomplica, Brasil Escola) publicam de tudo, e confiar no canal deles
// classificaria errado.
// ============================================================================

/** Nomes oficiais — os mesmos de `materias_peso`, senão o peso não casa. */
export const MATERIAS_OFICIAIS = [
  "Biologia",
  "Física",
  "Geografia",
  "História",
  "Inglês/Espanhol",
  "Matemática",
  "Linguagens",
  "Química",
  "Redação"
] as const;

export type MateriaOficial = (typeof MATERIAS_OFICIAIS)[number];

// Palavras-chave por matéria. Termos ambíguos ficam de fora de propósito:
// "reação" sozinho aparece em Química e em Biologia, "energia" em Física e
// Biologia. Só entram termos que, sozinhos, decidem a matéria.
const TERMOS: Record<MateriaOficial, string[]> = {
  Biologia: [
    "biologia", "celula", "celular", "citologia", "membrana plasmatica", "organela", "mitocondria",
    "cloroplasto", "fotossintese", "respiracao celular", "mitose", "meiose", "dna", "rna",
    "acidos nucleicos", "genetica", "mendel", "cromossom", "mutac", "biotecnologia", "transgenic",
    "clonagem", "pcr", "dna recombinante", "evolucao", "darwin", "lamarck", "selecao natural",
    "especiacao", "filogenia", "cladograma", "taxonomia", "lineu", "ecologia", "ecossistema",
    "cadeia alimentar", "teia alimentar", "bioma", "nicho ecologico", "habitat", "eutrofizacao",
    "bioacumulacao", "sucessao ecologica", "fisiologia", "sistema nervoso", "sistema digestorio",
    "sistema respiratorio", "sistema circulatorio", "sistema excretor", "sistema endocrino",
    "sistema imunologico", "imunidade", "hormonio", "homeostase", "metabolismo", "enzima",
    "histologia", "tecido epitelial", "tecido conjuntivo", "tecido muscular", "tecido nervoso",
    "tecido osseo", "tecido adiposo", "tecido sanguineo", "tecido cartilaginoso", "anatomia",
    "coracao", "valvas cardiacas", "botanica", "raiz", "caule", "folha", "fisiologia vegetal",
    "zoologia", "microbiologia", "bacteria", "virus", "fungi", "fungo", "protozoario",
    "verme", "verminose", "parasita", "parasitose", "vacina", "soro", "epidemia", "pandemia",
    "endemia", "doenca autoimune", "diabetes", "ciclo menstrual", "embriologia", "origem da vida",
    "abiogenese", "biogenese", "endossimbiose", "atp", "carboidrato", "lipidio", "proteina",
    "bioquimica", "camuflagem", "mimetismo", "orgaos homologos", "sistema abo", "tipos sanguineos",
    "ciclo de krebs", "reino"
  ],
  Física: [
    "fisica", "cinematica", "mru", "mruv", "movimento uniforme", "dinamica", "leis de newton",
    "forca centripeta", "trabalho de uma forca", "energia cinetica", "energia potencial",
    "energia mecanica", "potencia media", "hidrostatica", "hidrodinamica", "empuxo", "arquimedes",
    "stevin", "pascal", "prensa hidraulica", "bernoulli", "vazao", "termodinamica", "gases",
    "maquinas termicas", "calorimetria", "ondulatoria", "onda", "fenomenos ondulatorios",
    "eletrodinamica", "eletrostatica", "corrente eletrica", "carga eletrica", "resistor",
    "lei de ohm", "potencia eletrica", "energia eletrica", "associacao de resistores",
    "eletromagnetismo", "lei de faraday", "inducao", "gravitacao", "leis de kepler", "vetores",
    "optica", "lente", "espelho", "refracao", "reflexao"
  ],
  Química: [
    "quimica", "estequiometria", "mol", "molaridade", "concentracao molar", "solucoes",
    "ligacoes quimicas", "tabela periodica", "funcoes inorganicas", "acidos", "bases", "sais",
    "oxidos", "ph", "poh", "hidrolise", "equilibrio ionico", "eletroquimica", "pilha",
    "eletrolise", "nox", "oxidacao", "reducao", "termoquimica", "cinetica quimica",
    "radioatividade", "fissao", "fusao nuclear", "organica", "alcool", "enol", "fenol",
    "aldeido", "cetona", "acido carboxilico", "eter", "ester", "anidrido", "amina", "amida",
    "nitrilo", "nitrocomposto", "haleto organico", "tiol", "cadeias carbonicas", "isomeria",
    "nomenclatura usual", "propriedades coligativas", "separacao de misturas", "corrosao",
    "reacoes organicas", "neutralizacao"
  ],
  Matemática: [
    "matematica", "funcao do primeiro grau", "funcao afim", "funcao do segundo grau",
    "funcao quadratica", "progressao", "progressoes aritmeticas", "progressao geometica",
    "progressao geometrica", "pa", "pg", "sequencias numerica", "termo geral",
    "analise combinatoria", "permutacao", "arranjo", "combinacao", "probabilidade",
    "estatistica", "media, moda", "moda e mediana", "porcentagem", "regra de tres",
    "razao e proporcao", "proporcionalidade", "juros simples", "juros compostos",
    "matematica financeira", "geometria plana", "geometria espacial", "poliedro", "prisma",
    "piramide", "cilindro", "cone", "esfera", "tetraedro", "paralelepipedo", "tronco de cone",
    "tronco de piramide", "relacao de euler", "pappus", "trigonometria", "seno", "cosseno",
    "tangente", "triangulo retangulo", "areas e volumes", "figuras planas", "logaritmo",
    "matriz", "determinante", "equacao"
  ],
  Linguagens: [
    "portugues", "gramatica", "figuras de linguagem", "metafora", "metonimia", "comparacao",
    "hiperbole", "ironia", "catacrese", "perifrase", "antonomasia", "silepse", "zeugma",
    "pleonasmo", "eufemismo", "antitese", "paradoxo", "prosopopeia", "aliteracao",
    "oracoes coordenadas", "oracoes subordinadas", "periodo composto", "sintaxe", "morfologia",
    "sujeito e predicado", "crase", "regencia", "concordancia", "pontuacao", "acentuacao",
    "ortografia", "verbo", "substantivo", "adjetivo", "pronome", "literatura", "modernismo",
    "romantismo", "realismo", "barroco", "arcadismo", "parnasianismo", "simbolismo",
    "interpretacao de texto", "generos textuais", "coesao", "coerencia", "variacao linguistica",
    "funcoes da linguagem"
  ],
  História: [
    "historia", "guerra mundial", "primeira guerra", "segunda guerra", "guerra fria", "nazismo",
    "fascismo", "era vargas", "revolta", "revoltas", "inconfidencia", "conjuracao",
    "revolucao farroupilha", "canudos", "cisplatina", "republica", "imperio", "colonia",
    "escravidao", "abolicao", "independencia", "ditadura", "revolucao francesa",
    "revolucao industrial", "revolucoes industriais", "idade media", "feudalismo",
    "iluminismo", "renascimento", "grecia antiga", "roma antiga", "periodo entre guerras",
    "nativista"
  ],
  Geografia: [
    "geografia", "cartografia", "escala cartografica", "projecoes cartograficas", "geopolitica",
    "globalizacao", "nova ordem mundial", "multipolar", "urbanizacao", "uberizacao",
    "demografia", "populacao", "migracao", "clima", "relevo", "hidrografia", "solo",
    "biomas brasileiros", "desenvolvimento sustentavel", "impactos ambientais",
    "problemas ambientais", "agronegocio", "industrializacao", "blocos economicos"
  ],
  "Inglês/Espanhol": [
    "ingles", "espanhol", "english", "spanish", "reading", "vocabulary", "verb tenses",
    "present perfect", "simple past", "phrasal verb", "false friends", "interpretacao em ingles"
  ],
  Redação: ["redacao", "dissertativo", "argumentativo", "proposta de intervencao", "competencia"]
};

// Canais dedicados a uma única matéria. Só entram os inequívocos: ProEnem,
// Descomplica, Brasil Escola e Khan Academy publicam de tudo e ficam de fora.
const CANAIS: Record<string, MateriaOficial> = {
  "prof. guilherme goulart - biologia": "Biologia",
  "biologia com samuel cunha": "Biologia",
  "biologia com o tubarao": "Biologia",
  "anatomia e etc. com natalia reinecke": "Biologia",
  "anatomia papel e caneta": "Biologia",
  "prof. aleksandro rodrigues - biologia": "Biologia",
  "paulo jubilut": "Biologia",
  "renata aquino - do basico ao clinico": "Biologia",
  "professor boaro": "Física",
  "davi oliveira - fisica 2.0": "Física",
  "rodrigo fraga da silva": "Física",
  "quimica do monstro": "Química",
  "vem de quimica bb": "Química",
  "cafe com quimica - prof michel": "Química",
  "professor gabriel cabral": "Química",
  "prof. silvio predis - quimica nota 10": "Química",
  "quimicapontocom - prof. zanin": "Química",
  "equaciona com paulo pereira": "Matemática",
  "matematica rio com prof. rafael procopio": "Matemática",
  "escola de numeros com thyago araujo": "Matemática",
  "dicasdemat sandro curio": "Matemática",
  "eureka matematica": "Matemática",
  "matematica no papel": "Matemática",
  "xequemat enem": "Matemática",
  "professor ferretto | enem e vestibulares": "Matemática",
  "professor noslen": "Linguagens",
  "debora aladim": "História",
  "geobrasil": "Geografia",
  "professor ricardo marcilio": "Geografia"
};

/**
 * Casa o termo como PALAVRA INTEIRA.
 *
 * A primeira versão marcava os termos curtos com espaços (" pa ") e usava
 * includes — mas `normalizar()` faz trim, os espaços sumiam, e "pa" passou a
 * casar dentro de "parte": uma aula de "GEOPOLÍTICA MUNDIAL - PARTE 1" foi
 * classificada como Matemática. Delimitar por não-alfanumérico resolve sem
 * depender de como o termo foi escrito.
 */
function contemTermo(texto: string, termo: string): boolean {
  const t = normalizar(termo);
  if (!t) return false;
  const escapado = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escapado}([^a-z0-9]|$)`).test(texto);
}

export interface ResultadoClassificacao {
  materia: MateriaOficial | null;
  /** "titulo" | "canal" | null — de onde veio a decisão. */
  origem: "titulo" | "canal" | null;
  /** Quantos termos do título casaram, para medir a confiança. */
  forca: number;
}

/**
 * Descobre a matéria de uma aula pelo título e, se preciso, pelo canal.
 *
 * Devolve `null` quando nenhum sinal é conclusivo, em vez de chutar: uma aula
 * sem classificação é visível e corrigível pelo admin; uma aula classificada
 * errado passa despercebida — que é exatamente o problema que estamos
 * corrigindo.
 */
export function classificarMateria(titulo: string, canal?: string | null): ResultadoClassificacao {
  const t = normalizar(titulo);

  let melhor: MateriaOficial | null = null;
  let melhorPontos = 0;
  (Object.keys(TERMOS) as MateriaOficial[]).forEach((materia) => {
    const pontos = TERMOS[materia].reduce((s, termo) => (contemTermo(t, termo) ? s + 1 : s), 0);
    // Empate mantém o primeiro da ordem de declaração, então a comparação é
    // estritamente ">". Termos ambíguos ficam fora das listas justamente para
    // que empates sejam raros.
    if (pontos > melhorPontos) {
      melhorPontos = pontos;
      melhor = materia;
    }
  });

  if (melhor && melhorPontos > 0) return { materia: melhor, origem: "titulo", forca: melhorPontos };

  const doCanal = canal ? CANAIS[normalizar(canal)] : undefined;
  if (doCanal) return { materia: doCanal, origem: "canal", forca: 0 };

  return { materia: null, origem: null, forca: 0 };
}
