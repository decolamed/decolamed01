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
// O aluno fictício se chama Ana Beatriz de propósito: um nome que não existe
// na base. Os números são plausíveis (não redondos demais) para a tela
// parecer a de alguém que estuda de verdade, que é o ponto da demonstração.
//
// Quem renderiza isto são os MESMOS componentes do app do aluno
// (`CartaoQuestao`, `ResultadoDaResposta`). Não há uma segunda versão da
// tela de questão para manter: o visitante vê exatamente o que o aluno vê.
// ============================================================================

export const ALUNO_FICTICIO = {
  nome: "Ana Beatriz",
  diaDaRota: 12,
  totalDeDias: 40,
  xp: 1840,
  nivel: 7,
  sequenciaDias: 5,
  questoesRespondidas: 268,
  precisao: 74,
  minutosHoje: 95
};

/** As matérias do Raio X, com o desempenho do aluno fictício. */
export const DESEMPENHO_POR_MATERIA = [
  { materia: "Biologia", precisao: 81, questoes: 62 },
  { materia: "Química", precisao: 76, questoes: 48 },
  { materia: "Física", precisao: 58, questoes: 44 },
  { materia: "Matemática", precisao: 69, questoes: 51 },
  { materia: "Português", precisao: 84, questoes: 63 }
];

/** O dia de hoje no cronograma fictício. */
export const MISSOES_DE_HOJE = [
  { titulo: "Citologia — membrana plasmática", tipo: "aula", minutos: 25, concluida: true },
  { titulo: "12 questões de Biologia", tipo: "questoes", minutos: 30, concluida: true },
  { titulo: "Revisão: Termoquímica", tipo: "revisao", minutos: 20, concluida: false, doCopiloto: true },
  { titulo: "Flashcards — Bioquímica", tipo: "flashcards", minutos: 15, concluida: false }
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
