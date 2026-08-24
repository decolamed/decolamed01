import type { QuestaoDoCartao } from "@/components/aluno/cartao-questao";

// ============================================================================
// OS DADOS DA DEMONSTRAÇÃO
//
// Tudo aqui é inventado e vive neste arquivo. A rota /demonstracao não abre
// conexão com o Supabase, não chama a API do Gemini e não escreve em lugar
// nenhum — é por isso que ela pode ser aberta por qualquer pessoa, sem conta,
// a partir de um link no WhatsApp, sem risco de expor aluno real nem de
// gerar custo.
//
// O aluno fictício não tem nome próprio: a saudação diz "Aluno". Um nome
// inventado (era "Ana Beatriz") faz o visitante olhar a conta DE OUTRA
// PESSOA; sem nome, a tela fica sendo a dele. Os números continuam plausíveis
// — não redondos demais — para parecer a tela de quem estuda de verdade.
//
// Quem renderiza isto são os MESMOS componentes do app do aluno
// (`CartaoQuestao`, `ResultadoDaResposta`). Não há uma segunda versão da
// tela de questão para manter: o visitante vê exatamente o que o aluno vê.
// ============================================================================

export const ALUNO_FICTICIO = {
  nome: "Aluno",
  diaDaRota: 12,
  totalDeDias: 40,
  xp: 1840,
  nivel: 7,
  sequenciaDias: 5,
  questoesRespondidas: 268,
  precisao: 74,
  minutosHoje: 95
};

/**
 * A videoaula da demonstração.
 *
 * É uma aula REAL da biblioteca da plataforma (conteudos_biblioteca), não um
 * vídeo escolhido à toa: o visitante que clica em "Citologia — membrana
 * plasmática" no cronograma abre exatamente o que um aluno abriria.
 *
 * O assunto amarra a demonstração inteira — a aula é sobre a membrana, a
 * questão seguinte é sobre osmose através dela, e o flashcard cobra o mesmo
 * conteúdo. Quem percorre os quatro passos vê um dia de estudo coerente, e
 * não três telas soltas.
 */
export const AULA_DEMO = {
  titulo: "Membrana Plasmática — Funções e Estrutura",
  canal: "Biologia com Samuel Cunha",
  materia: "Biologia",
  assunto: "Citologia",
  url: "https://youtu.be/rXL2mDLDy_0",
  minutos: 25
};

/** As matérias do Raio X, com o desempenho do aluno fictício. */
export const DESEMPENHO_POR_MATERIA = [
  { materia: "Biologia", precisao: 81, questoes: 62 },
  { materia: "Química", precisao: 76, questoes: 48 },
  { materia: "Física", precisao: 58, questoes: 44 },
  { materia: "Matemática", precisao: 69, questoes: 51 },
  { materia: "Português", precisao: 84, questoes: 63 }
];

/**
 * O dia de hoje no cronograma fictício.
 *
 * Cada missão ABRE alguma coisa. Um cronograma em que os itens não respondem
 * ao toque ensina a lição errada sobre a plataforma — na conta de verdade,
 * tocar num item é como se estuda. Por isso `abre` aponta para o passo que
 * aquele item mostraria, e nenhum item da lista é um clique morto.
 *
 * Os quatro contam o mesmo dia: assiste-se à aula da membrana, respondem-se
 * questões sobre ela, revisa-se com flashcards, e o Copiloto acrescenta a
 * revisão do que ficou faltando.
 */
export type PassoDaDemo = "painel" | "aula" | "questao" | "flashcard" | "recursos";

export const MISSOES_DE_HOJE: {
  titulo: string;
  tipo: string;
  minutos: number;
  concluida: boolean;
  doCopiloto?: boolean;
  abre: PassoDaDemo;
}[] = [
  { titulo: "Citologia — membrana plasmática", tipo: "aula", minutos: 25, concluida: true, abre: "aula" },
  { titulo: "12 questões de Biologia", tipo: "questoes", minutos: 30, concluida: true, abre: "questao" },
  { titulo: "Flashcards — Citologia", tipo: "flashcards", minutos: 15, concluida: false, abre: "flashcard" },
  {
    // Assunto DIFERENTE do que o Copiloto agenda para amanhã (osmose, no fim
    // do tour): a revisão de amanhã nasce do erro que o visitante acabou de
    // cometer, e vê-la já marcada hoje desmentiria a demonstração.
    titulo: "Revisão: Citologia — organelas",
    tipo: "revisao",
    minutos: 20,
    concluida: false,
    doCopiloto: true,
    abre: "flashcard"
  }
];

/**
 * A questão da demonstração.
 *
 * Escrita para esta finalidade — não é uma questão do banco real. Precisa ser
 * respondível por alguém que não estuda para medicina há anos, mas continuar
 * parecendo uma questão de vestibular de verdade. A resposta errada mais
 * provável (alternativa A) é a que dispara o momento do Copiloto.
 */
export const QUESTAO_DEMO: QuestaoDoCartao = {
  id: "demo-bio-1",
  materia: "Biologia",
  prova_nome: "Questão de demonstração",
  ano: 2026,
  numero_questao: 1,
  enunciado:
    "A membrana plasmática é descrita pelo modelo do mosaico fluido. Uma célula é colocada em uma solução " +
    "hipertônica em relação ao seu meio interno.\n\nO que acontece com essa célula?",
  alternativas: [
    { id: "a", texto: "Ela absorve água e aumenta de volume, podendo sofrer lise." },
    { id: "b", texto: "Ela perde água para o meio e murcha, sofrendo plasmólise." },
    { id: "c", texto: "Ela permanece igual, porque a membrana é impermeável à água." },
    { id: "d", texto: "Ela passa a produzir mais ATP para compensar a diferença de concentração." },
    { id: "e", texto: "Ela rompe imediatamente a parede celular." }
  ]
};

export const RESPOSTA_CORRETA_DEMO = "b";

export const EXPLICACAO_DEMO =
  "Numa solução hipertônica, o meio externo tem MAIS soluto do que o interior da célula. " +
  "A água se move por osmose do meio menos concentrado para o mais concentrado — ou seja, de dentro " +
  "para fora da célula.\n\n" +
  "A célula então perde água e murcha. Em células vegetais esse fenômeno se chama plasmólise, com a " +
  "membrana se descolando da parede celular.\n\n" +
  "O erro mais comum aqui é inverter o sentido da osmose: em solução HIPOtônica é que a célula ganharia " +
  "água e poderia sofrer lise (alternativa A).";

/** Os recursos apresentados no fim da demonstração. */
/**
 * Os flashcards da demonstração.
 *
 * São dois, e não um: com um só, o visitante vira o cartão e a etapa acaba —
 * ele não chega a sentir o que a ferramenta faz, que é ENCADEAR cartões. Com
 * dois, existe um "próximo", que é o gesto real de uma sessão de revisão.
 *
 * Escolhidos para serem respondíveis de cabeça por quem ainda não estuda para
 * Medicina: a graça da etapa é sentir a mecânica e julgar a própria memória,
 * não ser reprovado numa pergunta difícil e desistir do tour. O segundo cobra
 * o mesmo conteúdo da aula e da questão — é assim que a revisão funciona na
 * plataforma.
 */
export const FLASHCARDS_DEMO = [
  {
    materia: "Biologia",
    assunto: "Citologia",
    frente: "Qual organela é responsável pela produção de ATP na célula?",
    verso: "A mitocôndria — por meio da respiração celular."
  },
  {
    materia: "Biologia",
    assunto: "Citologia",
    frente: "Em uma solução hipertônica, para onde a água se move?",
    verso: "De dentro para fora da célula — que perde água e murcha (plasmólise)."
  }
];

export const RECURSOS = [
  {
    icone: "calendar",
    titulo: "Cronograma",
    texto: "Um plano de voo dia a dia até a prova, montado a partir do seu tempo disponível e da sua data."
  },
  {
    icone: "target",
    titulo: "Banco de Questões",
    texto: "Questões por matéria e assunto, com resolução comentada e correção na hora."
  },
  {
    icone: "file",
    titulo: "Simulados",
    texto: "Provas completas com tempo cronometrado, gabarito e desempenho por matéria."
  },
  {
    icone: "cards",
    titulo: "Flashcards",
    texto: "Revisão espaçada do que você errou, para o conteúdo não escapar antes da prova."
  },
  {
    icone: "gauge",
    titulo: "Mapa de Voo",
    texto: "Seu Raio X por matéria: onde você está forte e onde precisa voltar."
  },
  {
    icone: "bot",
    titulo: "Copiloto",
    texto: "Acompanha seus erros e ajusta o cronograma sozinho, sem você precisar pedir."
  }
] as const;
