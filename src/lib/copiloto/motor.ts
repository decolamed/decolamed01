import { createAdminClient } from "@/lib/supabase/server";
import { gerarTextoGemini } from "@/lib/gemini/client";
import { produzirMaterialSobDemanda } from "@/lib/copiloto/producao-sob-demanda";
import { hojeISO, somarDias, diaDaSemana, diffDias } from "@/lib/site/data";
import { chaveDeItemTrilha, minutosDoItem, itemReagendavel } from "@/lib/trilha/progresso";
import {
  distribuirPendencias, selecionarPendencias, importanciaDe, motivoRemarcacao, chaveDoMotivo,
  type Pendencia, type DiaAlvo
} from "@/lib/copiloto/pendencias";
import { calcularDiaTrilha } from "@/lib/trilha/dia";
import { chaveMateria, mesmaMateria } from "@/lib/site/materia-canonica";
import { carregarConfigCopiloto, type ConfigCopiloto } from "@/lib/copiloto/configuracao";
import type { TrilhaItem } from "@/types/database";

// ============================================================================
// COPILOTO DECOLA MED — Motor Adaptativo v5 (cenários completos)
//
// CENÁRIOS DE CRONOGRAMA:
//
//   CENÁRIO 1 — Dias livres sobrando
//     → Preenche os dias vazios com missões baseadas em erros/GEN
//     → Modo GENEROSO
//
//   CENÁRIO 2 — Sem dias livres, mas existe espaço na rotina diária
//     → Adiciona missões extras aos dias que ainda cabem dentro do
//       tempo disponível do aluno (horas_por_dia do briefing)
//     → Ou substitui missões de baixo GEN por missões de alto GEN
//     → Modo EQUILIBRADO
//
//   CENÁRIO 3 — Menos dias disponíveis do que o cronograma padrão
//     → Compacta: remove missões de baixo GEN/matéria dominada
//     → Mantém as de maior impacto na nota
//     → Reorganiza para caber nos dias restantes
//     → Continua adaptando ao longo do tempo
//     → Modo CIRÚRGICO
//
// CHECK-IN CONVERSACIONAL:
//   O Copiloto faz perguntas com opções prontas quando o contexto justifica.
//   As respostas são salvas e aplicadas automaticamente no cronograma.
//   Nunca faz a mesma pergunta duas vezes sem necessidade.
// ============================================================================

// ---- Tipos -----------------------------------------------------------------

export interface ContextoAluno {
  alunoId: string;
  ultimaAcao?: "questao" | "flashcard" | "simulado";
  ultimaResposta?: {
    questaoId: string;
    materia: string;
    assunto: string | null;
    correta: boolean;
  };
}

type ModoAdaptativo = "generoso" | "equilibrado" | "cirurgico";

interface MateriaMeta {
  materia: string;
  peso: number;
  qtdQuestoes: number;
  pontosPotenciais: number;
  relevancia: number;
}

interface MissaoAgendada {
  id: string;
  data: string;
  titulo: string;
  materia: string;
  assunto: string | null;
  tipo: string;
  duracao_minutos: number;
  duracao_estimada_min: number;
  prioridade: number;
  origem: string;
  concluida: boolean;
}

interface DadosAluno {
  alunoId: string;
  ctx: ContextoAluno;
  respostas: Array<{ correta: boolean; materia: string; assunto: string | null; createdAt: string }>;
  revisoes: Array<{ lembrou: boolean; materia: string; assunto: string | null; createdAt: string }>;
  tentativas: Array<{
    nota: number; notaFacape: number | null; simuladoId: string; titulo: string;
    createdAt: string;
    desempenhoPorMateria: Record<string, { precisao: number; peso: number; acertos: number; total: number }>;
  }>;
  materias: Map<string, MateriaMeta>;
  briefing: {
    dataProva: string | null;
    sentimentos: Record<string, string>;
    diasEstuda: string[];
    horasPorDia: number; // horas de estudo por dia da semana
  } | null;
  modo: ModoAdaptativo;
  diasRestantes: number | null;
  diasLivres: number;
  diasOcupados: number;
  totalMissoesPadrao: number;    // missões admin agendadas no futuro
  missoesAgendadas: MissaoAgendada[]; // missões futuras para análise
  // Respostas de check-in não aplicadas ainda
  checkinsNaoAplicados: Array<{
    id: string; resposta_valor: string; resposta_acao: Record<string, unknown>;
  }>;
  // Quanto conteúdo ATIVO existe por matéria. Sem isso o Copiloto criava
  // missão de "Flashcards de Português" contando as revisões que o aluno já
  // tinha feito — o que não diz nada sobre os flashcards ainda existirem. O
  // aluno abria a missão e via "Não há flashcards disponíveis".
  inventario: Map<string, InventarioMateria>;
  // Em que dia do cronograma o aluno está hoje (null se a matrícula não tem
  // data de liberação). É o que separa o passado — onde moram as pendências
  // — do futuro, onde elas podem ser reagendadas.
  diaTrilhaHoje: number | null;
  // Parâmetros do algoritmo vindos de `configuracoes` (ver configuracao.ts).
  config: ConfigCopiloto;
}

// ---- Configurações por modo ------------------------------------------------

/** Aula real disponível para virar missão (id é o que amarra o vínculo). */
interface AulaDoInventario {
  id: string;
  titulo: string;
  materia: string | null;
  assunto: string | null;
  url: string | null;
}

interface InventarioMateria {
  questoes: number;
  flashcards: number;
  aulas: AulaDoInventario[];
}

const CFG = {
  generoso:    { maxRec: 8,  errosMinGatilho: 1, genMin: 0.5,  gemini: true  },
  equilibrado: { maxRec: 5,  errosMinGatilho: 2, genMin: 2.0,  gemini: true  },
  cirurgico:   { maxRec: 3,  errosMinGatilho: 2, genMin: 4.0,  gemini: false },
} as const;

const TIPOS_CICLO: Record<ModoAdaptativo, string[]> = {
  generoso:    ["questoes", "questoes", "flashcards", "revisao", "aula"],
  equilibrado: ["questoes", "questoes", "flashcards", "revisao"],
  cirurgico:   ["questoes", "questoes", "questoes"],
};

// Padrão de duração por tipo. O valor efetivo vem de dados.config
// (configuracoes → copiloto.duracao.*); isto aqui é só o fallback.
const DURACAO_TIPO: Record<string, number> = { questoes:40, flashcards:25, revisao:30, aula:45, simulado:90 };

// ============================================================================
// CARGA DE DADOS
// ============================================================================

async function carregarDados(ctx: ContextoAluno): Promise<DadosAluno> {
  const supabase = createAdminClient();

  // Fuso da plataforma, não UTC — ver lib/site/data.ts. Em UTC, o motor
  // datava as missões geradas à noite no dia seguinte.
  const hojeStr = hojeISO();

  const [respostasR, revisoesR, tentativasR, pesosR, briefingR, checkinsR] = await Promise.all([
    supabase.from("respostas_aluno")
      .select("correta, created_at, questoes(materia, assunto)")
      .eq("aluno_id", ctx.alunoId)
      .order("created_at", { ascending: false }).limit(400),
    supabase.from("flashcard_revisoes")
      .select("lembrou, created_at, flashcards(materia, assunto)")
      .eq("aluno_id", ctx.alunoId)
      .order("created_at", { ascending: false }).limit(150),
    supabase.from("simulado_tentativas")
      .select("nota, nota_facape, simulado_id, created_at, desempenho_por_materia, simulados(titulo)")
      .eq("aluno_id", ctx.alunoId)
      .order("created_at", { ascending: false }).limit(10),
    supabase.from("materias_peso").select("materia, peso, qtd_questoes").gt("qtd_questoes", 0),
    supabase.from("aluno_briefing")
      .select("data_prova, sentimentos, dias_estuda, horas_por_dia_semana")
      .eq("aluno_id", ctx.alunoId).maybeSingle(),
    supabase.from("copiloto_checkin")
      .select("id, resposta_valor, resposta_acao")
      .eq("aluno_id", ctx.alunoId)
      .eq("respondida", true)
      .eq("aplicada", false),
  ]);

  const pesosLista = (pesosR.data ?? []) as { materia: string; peso: number; qtd_questoes: number }[];
  const totalPontos = pesosLista.reduce((s, p) => s + p.peso * p.qtd_questoes, 0);
  const materias = new Map<string, MateriaMeta>();
  pesosLista.forEach(({ materia, peso, qtd_questoes: q }) => {
    const pp = peso * q;
    materias.set(materia, {
      materia, peso, qtdQuestoes: q, pontosPotenciais: pp,
      relevancia: totalPontos > 0 ? (pp / totalPontos) * 100 : 0,
    });
  });

  const respostas = (respostasR.data ?? []).map((r: any) => ({
    correta: r.correta, materia: r.questoes?.materia ?? "",
    assunto: r.questoes?.assunto ?? null, createdAt: r.created_at,
  })).filter((r) => r.materia);

  const revisoes = (revisoesR.data ?? []).map((r: any) => ({
    lembrou: r.lembrou, materia: r.flashcards?.materia ?? "",
    assunto: r.flashcards?.assunto ?? null, createdAt: r.created_at,
  })).filter((r) => r.materia);

  const tentativas = (tentativasR.data ?? []).map((t: any) => ({
    nota: t.nota, notaFacape: t.nota_facape, simuladoId: t.simulado_id,
    titulo: t.simulados?.titulo ?? "Simulado", createdAt: t.created_at,
    desempenhoPorMateria: t.desempenho_por_materia ?? {},
  }));

  const b = briefingR.data;
  const briefing = b ? {
    dataProva: b.data_prova ?? null,
    // Re-indexado pela chave canônica: briefings antigos gravaram
    // "Português" e o motor procura por "Linguagens" — sem isto a
    // autoavaliação do aluno era descartada em silêncio e todo mundo virava
    // "Atenção".
    sentimentos: reindexarSentimentos(b.sentimentos),
    diasEstuda: b.dias_estuda ?? [],
    horasPorDia: Number(b.horas_por_dia_semana) || 2,
  } : null;

  // Missões futuras
  let missoesAgendadas: MissaoAgendada[] = [];
  let diasLivres = 0;
  let diasOcupados = 0;
  let totalMissoesPadrao = 0;
  let diasRestantes: number | null = null;

  if (briefing?.dataProva) {
    // Dias até a prova contados de calendário a calendário, no fuso da
    // plataforma — antes a conta misturava o instante atual em UTC com a
    // meia-noite da data da prova, e virava um dia a menos toda noite.
    diasRestantes = diffDias(hojeISO(), briefing.dataProva.slice(0, 10));

    const { data: missoes } = await supabase
      .from("aluno_missoes")
      .select("id, data, titulo, materia, assunto, tipo, duracao_minutos, duracao_estimada_min, prioridade, origem, concluida")
      .eq("aluno_id", ctx.alunoId)
      .gte("data", hojeStr)
      .lte("data", briefing.dataProva)
      .eq("concluida", false)
      .order("data");

    missoesAgendadas = (missoes ?? []) as MissaoAgendada[];
    diasOcupados = new Set(missoesAgendadas.map((m) => m.data)).size;
    totalMissoesPadrao = missoesAgendadas.filter((m) => m.origem === "admin").length;

    // Calcular dias de estudo livres
    if (diasRestantes > 0) {
      const MAPA_DIA: Record<number, string> = { 0:"dom",1:"seg",2:"ter",3:"qua",4:"qui",5:"sex",6:"sab" };
      const diasEstudaSet = new Set(briefing.diasEstuda);
      const datasComMissao = new Set(missoesAgendadas.map((m) => m.data));
      for (let d = 1; d <= diasRestantes; d++) {
        const iso = somarDias(hojeISO(), d);
        if (diasEstudaSet.size > 0 && !diasEstudaSet.has(MAPA_DIA[diaDaSemana(iso)])) continue;
        if (!datasComMissao.has(iso)) diasLivres++;
      }
    }
  }

  const config = await carregarConfigCopiloto();
  const modo = detectarModo(diasRestantes, diasLivres, diasOcupados, totalMissoesPadrao, config);
  const checkinsNaoAplicados = (checkinsR.data ?? []).map((c: any) => ({
    id: c.id,
    resposta_valor: c.resposta_valor as string,
    resposta_acao: c.resposta_acao as Record<string, unknown>,
  }));

  return {
    alunoId: ctx.alunoId, ctx, respostas, revisoes, tentativas,
    materias, briefing, modo, diasRestantes, diasLivres, diasOcupados,
    totalMissoesPadrao, missoesAgendadas, checkinsNaoAplicados,
    inventario: await carregarInventario(),
    diaTrilhaHoje: await carregarDiaTrilhaHoje(ctx.alunoId),
    config,
  };
}

// Sentimentos do briefing indexados pela chave canônica da matéria, para a
// busca funcionar independente do nome que o aluno respondeu na época.
function reindexarSentimentos(bruto: unknown): Record<string, string> {
  const saida: Record<string, string> = {};
  Object.entries((bruto ?? {}) as Record<string, string>).forEach(([materia, valor]) => {
    const k = chaveMateria(materia);
    if (k) saida[k] = valor;
  });
  return saida;
}

// Conta o conteúdo ativo por matéria. É a checagem que faltava antes de
// prometer uma missão ao aluno: só se cria missão de um tipo que realmente
// tem conteúdo disponível para aquela matéria.
async function carregarInventario(): Promise<Map<string, InventarioMateria>> {
  const supabase = createAdminClient();
  const [{ data: qs }, { data: fs }, { data: aulas }] = await Promise.all([
    supabase.from("questoes").select("materia").eq("ativo", true),
    supabase.from("flashcards").select("materia").eq("ativo", true),
    // As aulas entram com id e título, não só contadas: é o id que amarra a
    // missão ao conteúdo real. Sem ele a missão "Aula de Física" abria com
    // "Esta aula não está mais disponível" — ver resolverConteudoMissao().
    supabase
      .from("conteudos_biblioteca")
      .select("id, titulo, materia, assunto, url")
      .eq("ativo", true)
      .in("tipo", ["aula", "video_externo"])
      .not("url", "is", null),
  ]);

  // Indexado pela chave canônica: uma missão de "Linguagens" precisa achar
  // as questões mesmo se alguma linha antiga tiver ficado como "Português".
  const mapa = new Map<string, InventarioMateria>();
  const daMateria = (materia: string | null): InventarioMateria | null => {
    const m = chaveMateria(materia);
    if (!m) return null;
    const atual = mapa.get(m) ?? { questoes: 0, flashcards: 0, aulas: [] };
    mapa.set(m, atual);
    return atual;
  };

  (qs ?? []).forEach((r: { materia: string | null }) => {
    const inv = daMateria(r.materia);
    if (inv) inv.questoes += 1;
  });
  (fs ?? []).forEach((r: { materia: string | null }) => {
    const inv = daMateria(r.materia);
    if (inv) inv.flashcards += 1;
  });
  (aulas ?? []).forEach((r: AulaDoInventario) => {
    const inv = daMateria(r.materia);
    if (inv) inv.aulas.push(r);
  });

  return mapa;
}

async function carregarDiaTrilhaHoje(alunoId: string): Promise<number | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("matriculas")
    .select("acesso_liberado_em")
    .eq("aluno_id", alunoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const liberado = (data as { acesso_liberado_em: string | null } | null)?.acesso_liberado_em;
  return liberado ? calcularDiaTrilha(liberado) : null;
}

const INVENTARIO_VAZIO: InventarioMateria = { questoes: 0, flashcards: 0, aulas: [] };

// Devolve um tipo de missão que REALMENTE tem conteúdo para a matéria, ou
// null quando não há nada — nesse caso a missão simplesmente não é criada,
// em vez de virar um beco sem saída na tela do aluno.
function tipoComConteudo(
  dados: DadosAluno,
  materia: string,
  preferido: "questoes" | "flashcards" | "aula" | "revisao"
): "questoes" | "flashcards" | "aula" | null {
  const inv = dados.inventario.get(chaveMateria(materia)) ?? INVENTARIO_VAZIO;
  // "aula" era pedido pelo ciclo do modo generoso mas nunca era devolvido
  // aqui: as missões de aula escapavam da checagem de conteúdo e nasciam
  // sem vínculo nenhum.
  if (preferido === "aula" && inv.aulas.length > 0) return "aula";
  if ((preferido === "flashcards" || preferido === "revisao") && inv.flashcards > 0) return "flashcards";
  if (inv.questoes > 0) return "questoes";
  if (inv.flashcards > 0) return "flashcards";
  if (inv.aulas.length > 0) return "aula";
  return null;
}

/**
 * Resolve o conteúdo concreto de uma missão: título e, quando o tipo exige,
 * o `ref_id` do registro real.
 *
 * É aqui que a cadeia "matéria identificada → título → conteúdo aberto"
 * passa a ficar amarrada. Antes a missão gravava só matéria e tipo; para
 * `aula` o app procurava `conteudos.find(c => c.id === m.ref_id)` com
 * `ref_id` sempre nulo e caía direto na mensagem "Esta aula não está mais
 * disponível" — todas as 11 missões de aula do banco estavam assim.
 *
 * Devolve null quando não existe conteúdo para a matéria; nesse caso a
 * missão não deve ser criada.
 */
function resolverConteudoMissao(
  dados: DadosAluno,
  materia: string,
  tipoPreferido: string
): { tipo: string; titulo: string; refId: string | null; assunto: string | null } | null {
  const preferido = (["questoes", "flashcards", "aula", "revisao"] as const).includes(
    tipoPreferido as "questoes"
  )
    ? (tipoPreferido as "questoes" | "flashcards" | "aula" | "revisao")
    : "questoes";

  const tipo = tipoComConteudo(dados, materia, preferido);
  if (!tipo) return null;

  if (tipo === "aula") {
    const inv = dados.inventario.get(chaveMateria(materia)) ?? INVENTARIO_VAZIO;
    // Rotaciona pela lista para não indicar sempre a mesma primeira aula da
    // matéria a todos os alunos.
    const escolhida = inv.aulas[Math.floor(Math.random() * inv.aulas.length)];
    if (!escolhida) return null;
    return {
      tipo: "aula",
      // O título é o da aula de verdade: o aluno lê o mesmo nome que vai
      // encontrar em Estudos.
      titulo: `Aula · ${escolhida.titulo}`,
      refId: escolhida.id,
      assunto: escolhida.assunto ?? null
    };
  }

  const rotulo = tipo === "flashcards" ? "Flashcards" : "Questões";
  return { tipo, titulo: `${rotulo} · ${materia}`, refId: null, assunto: null };
}

// ---- Detecção de modo ------------------------------------------------------

function detectarModo(
  diasRestantes: number | null,
  diasLivres: number,
  diasOcupados: number,
  totalMissoesPadrao: number,
  config: ConfigCopiloto
): ModoAdaptativo {
  if (diasRestantes === null) return "equilibrado";
  // Prova iminente ou missões sobrando muito além dos dias disponíveis
  if (diasRestantes <= config.diasParaModoCirurgico || diasLivres < config.diasLivresMinimos) {
    // Cenário 3: cronograma maior que dias restantes
    if (totalMissoesPadrao > diasRestantes * 1.2) return "cirurgico";
    return "cirurgico";
  }
  const total = diasLivres + diasOcupados;
  const ratio = total > 0 ? diasLivres / total : 0;
  if (diasRestantes >= 40 && ratio >= 0.35 && diasLivres >= 15) return "generoso";
  return "equilibrado";
}

// ============================================================================
// CÁLCULO DE GEN
// ============================================================================

function fatorErros(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1.0;
  if (n === 2) return 2.5;
  if (n === 3) return 5.0;
  return Math.min(10.0, 5.0 + (n - 3) * 1.5);
}

function fatorUrgencia(dias: number | null): number {
  if (!dias || dias <= 0) return 1.0;
  return 1.0 + Math.sqrt(30 / Math.max(dias, 1));
}

function fatorSentimento(s: string): number {
  return s === "Turbulência" ? 2.0 : s === "Atenção" ? 1.3 : 0.7;
}

function calcularGEN(p: {
  relevancia: number; precisao: number; qtdErros: number;
  diasRestantes: number | null; sentimento: string;
}): number {
  const margem = Math.max(0, (100 - p.precisao) / 100);
  return Math.round(
    p.relevancia * margem * fatorErros(p.qtdErros)
    * fatorUrgencia(p.diasRestantes)
    * fatorSentimento(p.sentimento) * 100
  ) / 100;
}

function genMateria(materia: string, dados: DadosAluno): number {
  const m = dados.materias.get(materia);
  if (!m) return 0;
  let a = 0, e = 0, t = 0;
  dados.respostas.filter((r) => mesmaMateria(r.materia, materia)).forEach((r) => {
    t++; if (r.correta) a++; else e++;
  });
  const precisao = t > 0 ? (a / t) * 100 : 50;
  const sentimento = dados.briefing?.sentimentos[chaveMateria(materia)] ?? "Atenção";
  return calcularGEN({ relevancia: m.relevancia, precisao, qtdErros: e, diasRestantes: dados.diasRestantes, sentimento });
}

// ============================================================================
// CENÁRIO 1 — preencher dias livres
// ============================================================================

async function preencherDiasLivres(dados: DadosAluno): Promise<number> {
  if (dados.diasLivres === 0) return 0;
  const supabase = createAdminClient();

  const scores = [...dados.materias.keys()]
    .map((mat) => ({ mat, gen: genMateria(mat, dados) }))
    .filter((x) => x.gen > 0)
    .sort((a, b) => b.gen - a.gen);

  if (scores.length === 0) return 0;

  // Construir lista de dias livres ordenados
  const hoje = new Date();
  const MAPA_DIA: Record<number, string> = { 0:"dom",1:"seg",2:"ter",3:"qua",4:"qui",5:"sex",6:"sab" };
  const diasEstudaSet = new Set(dados.briefing?.diasEstuda ?? []);
  const datasComMissao = new Set(dados.missoesAgendadas.map((m) => m.data));
  const diasLivresOrdenados: string[] = [];
  const dr = dados.diasRestantes ?? 0;
  for (let d = 1; d <= dr; d++) {
    const iso = somarDias(hojeISO(), d);
    if (diasEstudaSet.size > 0 && !diasEstudaSet.has(MAPA_DIA[diaDaSemana(iso)])) continue;
    if (!datasComMissao.has(iso)) diasLivresOrdenados.push(iso);
  }

  if (diasLivresOrdenados.length === 0) return 0;

  // Capacidade real de cada dia livre. Antes o Copiloto colocava UMA missão
  // por dia e pulava pro dia seguinte — terça questões, quarta flashcards,
  // quinta revisão — mesmo sobrando horas em cada um deles. Agora ele enche
  // o dia até o limite de estudo do aluno antes de abrir o próximo.
  const maxMinPorDia = (dados.briefing?.horasPorDia ?? 2) * 60;
  const { data: diasFuturosTrilha } = await supabase
    .from("trilha_dias")
    .select("dia_numero, itens")
    .gte("dia_numero", dados.diaTrilhaHoje ?? 0);
  const cargaTrilha = new Map<number, number>();
  ((diasFuturosTrilha ?? []) as { dia_numero: number; itens: TrilhaItem[] }[]).forEach((d) => {
    cargaTrilha.set(d.dia_numero, (d.itens ?? []).reduce((s, it) => s + minutosDoItem(it), 0));
  });

  // O dia do cronograma já ocupa parte do tempo, mesmo num dia "livre" de
  // missões — desconta, senão o Copiloto estoura a rotina do aluno.
  const capacidade = diasLivresOrdenados.map((data) => {
    const offset = diffDias(hojeISO(), data);
    const doCronograma = cargaTrilha.get((dados.diaTrilhaHoje ?? 0) + offset) ?? 0;
    return { data, livre: Math.max(0, maxMinPorDia - doCronograma) };
  });
  const minutosDisponiveis = capacidade.reduce((s, d) => s + d.livre, 0);
  if (minutosDisponiveis <= 0) return 0;

  // Quantas missões cabem no tempo total (não mais "uma por dia").
  const duracaoMedia =
    TIPOS_CICLO[dados.modo].reduce((s, t) => s + (dados.config.duracaoPorTipo[t] ?? DURACAO_TIPO[t] ?? 40), 0) / TIPOS_CICLO[dados.modo].length;
  const totalMissoes = Math.max(1, Math.floor(minutosDisponiveis / duracaoMedia));

  const totalGen = scores.reduce((s, x) => s + Math.max(x.gen, 0.1), 0);
  const slots: Record<string, number> = {};
  scores.forEach(({ mat, gen }) => {
    slots[mat] = Math.max(1, Math.round((Math.max(gen, 0.1) / totalGen) * totalMissoes));
  });
  let soma = Object.values(slots).reduce((s, n) => s + n, 0);
  for (let i = scores.length - 1; i >= 0 && soma > totalMissoes; i--) {
    const m = scores[i].mat;
    const red = Math.min(soma - totalMissoes, Math.max(0, slots[m] - 1));
    slots[m] -= red; soma -= red;
  }

  const ciclo = TIPOS_CICLO[dados.modo];
  const sequencia: { materia: string; tipo: string }[] = [];
  const cont: Record<string, number> = {};
  for (const { mat } of scores) {
    for (let i = 0; i < (slots[mat] ?? 0); i++) {
      cont[mat] = cont[mat] ?? 0;
      sequencia.push({ materia: mat, tipo: ciclo[cont[mat]++ % ciclo.length] });
    }
  }

  // Intercalar
  const buckets = scores.map(({ mat }) => sequencia.filter((s) => mesmaMateria(s.materia, mat)));
  const intercalada: typeof sequencia = [];
  let rodada = 0;
  while (intercalada.length < sequencia.length) {
    for (const b of buckets) { if (b[rodada]) intercalada.push(b[rodada]); }
    rodada++;
  }

  // Empacota na ordem: enche o primeiro dia até o limite, depois o segundo.
  // Só abre um dia novo quando a missão realmente não cabe no atual.
  const restante = capacidade.map((d) => ({ ...d }));
  const missoes: Record<string, unknown>[] = [];
  for (const item of intercalada) {
    // Resolve o conteúdo ANTES de reservar o tempo do dia: uma matéria sem
    // material nenhum não deve consumir capacidade de um dia livre.
    const conteudo = resolverConteudoMissao(dados, item.materia, item.tipo);
    if (!conteudo) continue;

    const min = dados.config.duracaoPorTipo[conteudo.tipo] ?? DURACAO_TIPO[conteudo.tipo] ?? 40;
    const dia = restante.find((d) => d.livre >= min);
    if (!dia) break; // acabou a capacidade da janela até a prova
    dia.livre -= min;
    const sc = scores.find((x) => mesmaMateria(x.mat, item.materia))!;
    missoes.push({
      aluno_id: dados.alunoId,
      data: dia.data,
      titulo: `${conteudo.titulo} — Copiloto`,
      materia: item.materia,
      assunto: conteudo.assunto,
      tipo: conteudo.tipo,
      // Para aula, aponta o registro real em conteudos_biblioteca. É o que
      // faz o clique abrir o player em vez de "aula não disponível".
      ref_id: conteudo.refId,
      duracao_minutos: min,
      duracao_estimada_min: min,
      prioridade: sc.gen > 10 ? 2 : 1,
      origem: "copiloto" as const,
      motivo_copiloto: `[cenário1/${dados.modo}] GEN=${sc.gen.toFixed(1)}`,
    });
  }

  if (missoes.length > 0) await supabase.from("aluno_missoes").insert(missoes);
  return missoes.length;
}

// ============================================================================
// CENÁRIO 2 — modificar dias ocupados (sem dias livres)
// ============================================================================

async function modificarDiasOcupados(dados: DadosAluno): Promise<number> {
  if (dados.diasLivres > 0) return 0; // cenário 1 já cuida
  if (!dados.briefing?.dataProva) return 0;
  const supabase = createAdminClient();

  // Agrupa missões por data
  const porData = new Map<string, MissaoAgendada[]>();
  dados.missoesAgendadas.forEach((m) => {
    const lista = porData.get(m.data) ?? [];
    lista.push(m);
    porData.set(m.data, lista);
  });

  const horasPorDia = dados.briefing.horasPorDia;
  const maxMinPorDia = horasPorDia * 60;
  let acoes = 0;

  // Calcula GEN das matérias
  const scoresMateria = [...dados.materias.keys()]
    .map((mat) => ({ mat, gen: genMateria(mat, dados) }))
    .sort((a, b) => b.gen - a.gen);

  const maisUrgente = scoresMateria[0];
  if (!maisUrgente || maisUrgente.gen < CFG[dados.modo].genMin) return 0;

  for (const [data, missoesDoDia] of porData) {
    if (acoes >= dados.config.maxDiasModificadosPorExecucao) break; // limite configurável no admin

    const minUsados = missoesDoDia.reduce((s, m) => s + (m.duracao_estimada_min || m.duracao_minutos), 0);

    // --- OPÇÃO A: adicionar missão extra se couber no tempo disponível ---
    const conteudoExtra = resolverConteudoMissao(dados, maisUrgente.mat, "questoes");
    const minExtra = conteudoExtra
      ? dados.config.duracaoPorTipo[conteudoExtra.tipo] ?? DURACAO_TIPO[conteudoExtra.tipo] ?? 40
      : 0;
    if (conteudoExtra && minUsados + minExtra <= maxMinPorDia) {
      const jaTemMateria = missoesDoDia.some((m) => mesmaMateria(m.materia, maisUrgente.mat));
      if (!jaTemMateria) {
        await supabase.from("aluno_missoes").insert({
          aluno_id: dados.alunoId, data,
          titulo: `${conteudoExtra.titulo} — Copiloto (extra)`,
          materia: maisUrgente.mat,
          assunto: conteudoExtra.assunto,
          tipo: conteudoExtra.tipo,
          ref_id: conteudoExtra.refId,
          duracao_minutos: minExtra,
          duracao_estimada_min: minExtra,
          prioridade: 2,
          origem: "copiloto",
          motivo_copiloto: `[cenário2] GEN=${maisUrgente.gen.toFixed(1)} | adicionado em dia ocupado`,
        });
        acoes++;
        continue;
      }
    }

    // --- OPÇÃO B: substituir missão de baixo GEN por missão de alto GEN ---
    // Encontrar a missão de menor impacto no dia
    const candidataSubstituir = missoesDoDia
      .filter((m) => m.origem === "admin" && !m.concluida)
      .map((m) => ({ m, gen: genMateria(m.materia, dados) }))
      .sort((a, b) => a.gen - b.gen)[0]; // menor GEN

    if (!candidataSubstituir) continue;

    // Só substitui se a matéria urgente tem GEN significativamente maior
    const genSubst = candidataSubstituir.gen;
    if (maisUrgente.gen < genSubst * 1.8) continue; // não vale a troca

    // Substituir: cria a nova missão do Copiloto e remove a antiga. A troca
    // só pode acontecer se a nova tiver conteúdo — trocar uma missão válida
    // por uma vazia deixaria o aluno com menos do que tinha antes.
    const conteudoSubst = resolverConteudoMissao(dados, maisUrgente.mat, "questoes");
    if (!conteudoSubst) continue;
    await supabase.from("aluno_missoes").delete().eq("id", candidataSubstituir.m.id);
    await supabase.from("aluno_missoes").insert({
      aluno_id: dados.alunoId, data,
      titulo: `${conteudoSubst.titulo} — Copiloto (substituiu ${candidataSubstituir.m.materia})`,
      materia: maisUrgente.mat,
      assunto: conteudoSubst.assunto,
      tipo: conteudoSubst.tipo,
      ref_id: conteudoSubst.refId,
      duracao_minutos: candidataSubstituir.m.duracao_minutos,
      duracao_estimada_min: candidataSubstituir.m.duracao_estimada_min,
      prioridade: 2,
      origem: "copiloto",
      motivo_copiloto: `[cenário2] substituiu "${candidataSubstituir.m.titulo}" (GEN=${genSubst.toFixed(1)}) por ${maisUrgente.mat} (GEN=${maisUrgente.gen.toFixed(1)})`,
    });

    await registrarEvento(dados.alunoId, "substituicao_missao", maisUrgente.mat, null, {
      substituida: candidataSubstituir.m.materia,
      gen_antes: genSubst, gen_depois: maisUrgente.gen, data,
    });
    acoes++;
  }

  return acoes;
}

// ============================================================================
// PENDÊNCIAS — conteúdo que passou da data e não foi concluído
//
// Antes, um dia que passava em branco simplesmente ficava para trás: o
// cronograma seguia em frente e o conteúdo se perdia sem ninguém notar. Aqui
// o Copiloto recupera o que ficou pendente e reagenda com critério.
//
// Três regras guiam a decisão:
//
//  1. "Marcar como concluído" é a palavra final. O aluno pode ter assistido
//     a aula no YouTube, feito as questões no caderno ou estudado por outro
//     meio — se marcou, está feito, e nunca volta como pendência.
//  2. Só reagenda o que vale a pena. A importância vem do GEN da matéria
//     (relevância na prova × desempenho do aluno × urgência) somada ao peso
//     do próprio tipo de conteúdo. Item pouco relevante com prova longe não
//     ocupa espaço no cronograma.
//  3. Dia livre primeiro. Quem tem 40 dias de cronograma e 80 até a prova
//     tem folga de sobra: o pendente vai para os dias vazios antes de somar
//     carga em qualquer dia que já tem conteúdo. Só quando os livres acabam
//     é que a distribuição passa a completar os dias parcialmente ocupados,
//     sempre respeitando a carga horária que o aluno informou.
// ============================================================================

async function reagendarPendencias(dados: DadosAluno): Promise<number> {
  const supabase = createAdminClient();
  const hoje = hojeISO();
  if (dados.diaTrilhaHoje == null) return 0;

  // 1. O que o aluno já concluiu — inclusive o que ele marcou à mão.
  const { data: progresso } = await supabase
    .from("aluno_progresso_itens")
    .select("chave, concluida")
    .eq("aluno_id", dados.alunoId)
    .eq("concluida", true);
  const concluidas = new Set((progresso ?? []).map((p: { chave: string }) => p.chave));

  // 2. O que já foi remarcado antes. Cada remarcação carimba
  // `[pendencia:<chave>]` no motivo, e é esse carimbo que evita a mesma
  // atividade ser recriada toda vez que o motor roda. Três destinos
  // diferentes conforme o estado da missão:
  const { data: jaReagendadas } = await supabase
    .from("aluno_missoes")
    .select("id, data, concluida, motivo_copiloto")
    .eq("aluno_id", dados.alunoId)
    .eq("origem", "copiloto")
    // Filtrar o carimbo no PostgREST exigiria um LIKE com `[` e `:`, que são
    // caracteres delicados na sintaxe de filtro. O regex resolve com
    // segurança e o volume por aluno é pequeno.
    .not("motivo_copiloto", "is", null);

  const chavesReagendadas = new Set<string>();
  const paraRemover: string[] = [];
  (jaReagendadas ?? []).forEach((m: { id: string; data: string; concluida: boolean; motivo_copiloto: string | null }) => {
    const chave = chaveDoMotivo(m.motivo_copiloto);
    if (!chave) return;
    if (m.concluida) {
      // Concluída como missão vale como concluída, ponto. O aluno não precisa
      // marcar de novo no item original do cronograma.
      concluidas.add(chave);
    } else if (concluidas.has(chave)) {
      // O aluno voltou ao dia original e marcou o item como concluído depois
      // que a recuperação já tinha sido criada. A missão de recuperação perdeu
      // o motivo de existir — some, em vez de ficar cobrando algo já feito.
      paraRemover.push(m.id);
    } else if (m.data >= hoje) {
      // Já está agendada para hoje ou para frente: nada a fazer.
      chavesReagendadas.add(chave);
    } else {
      // Remarcada, a data passou e continua pendente. A linha antiga sai para
      // a atividade poder ser remarcada de novo — sem isso ela duplicaria a
      // cada rodada ou ficaria presa num dia que já passou.
      paraRemover.push(m.id);
    }
  });
  if (paraRemover.length > 0) {
    await supabase.from("aluno_missoes").delete().in("id", paraRemover);
    // O que saiu do banco também precisa sair da cópia em memória, senão os
    // cenários seguintes contam carga que não existe mais.
    const removidos = new Set(paraRemover);
    dados.missoesAgendadas = dados.missoesAgendadas.filter((m) => !removidos.has(m.id));
    recontarOcupacao(dados);
  }

  // 3. Levantar as pendências dos dias que já passaram.
  const { data: diasPassados } = await supabase
    .from("trilha_dias")
    .select("dia_numero, itens")
    .lt("dia_numero", dados.diaTrilhaHoje)
    .order("dia_numero");

  const pendencias: Pendencia[] = [];
  ((diasPassados ?? []) as { dia_numero: number; itens: TrilhaItem[] }[]).forEach((dia) => {
    (dia.itens ?? []).forEach((item, i) => {
      if (!itemReagendavel(item)) return;
      const chave = chaveDeItemTrilha(dia.dia_numero, i, item);
      if (!chave || concluidas.has(chave) || chavesReagendadas.has(chave)) return;
      const gen = item.materia ? genMateria(item.materia, dados) : 0;
      pendencias.push({
        chave,
        titulo: item.titulo,
        materia: item.materia,
        tipo: item.tipo,
        minutos: minutosDoItem(item),
        importancia: importanciaDe(gen, item.tipo),
        diaOrigem: dia.dia_numero
      });
    });
  });

  const aReagendar = selecionarPendencias(pendencias);
  if (aReagendar.length === 0) return 0;

  // 4. Montar a capacidade dos próximos dias.
  const maxMinPorDia = (dados.briefing?.horasPorDia ?? 2) * 60;
  const limite = dados.diasRestantes && dados.diasRestantes > 0 ? Math.min(dados.diasRestantes, 60) : 30;
  const carga = new Map<string, number>();
  dados.missoesAgendadas.forEach((m) => {
    carga.set(m.data, (carga.get(m.data) ?? 0) + (m.duracao_estimada_min || m.duracao_minutos));
  });
  // Um dia do cronograma também ocupa tempo, mesmo sem missão do Copiloto.
  const { data: diasFuturos } = await supabase
    .from("trilha_dias")
    .select("dia_numero, itens")
    .gte("dia_numero", dados.diaTrilhaHoje);
  const cargaTrilhaPorDiaNumero = new Map<number, number>();
  ((diasFuturos ?? []) as { dia_numero: number; itens: TrilhaItem[] }[]).forEach((d) => {
    cargaTrilhaPorDiaNumero.set(d.dia_numero, (d.itens ?? []).reduce((soma, it) => soma + minutosDoItem(it), 0));
  });

  const diasEstuda = new Set(dados.briefing?.diasEstuda ?? []);
  const MAPA_DIA: Record<number, string> = { 0: "dom", 1: "seg", 2: "ter", 3: "qua", 4: "qui", 5: "sex", 6: "sab" };

  const alvos: DiaAlvo[] = [];
  for (let d = 1; d <= limite; d++) {
    const iso = somarDias(hoje, d);
    if (diasEstuda.size > 0 && !diasEstuda.has(MAPA_DIA[diaDaSemana(iso)])) continue;
    const doCronograma = cargaTrilhaPorDiaNumero.get(dados.diaTrilhaHoje + d) ?? 0;
    alvos.push({ data: iso, usados: (carga.get(iso) ?? 0) + doCronograma });
  }

  // 5. Decidir (puro, testável em lib/copiloto/pendencias.ts) e gravar.
  const { alocacoes } = distribuirPendencias(aReagendar, alvos, maxMinPorDia);
  if (alocacoes.length === 0) return 0;

  let reagendadas = 0;
  for (const a of alocacoes) {
    const p = a.pendencia;
    const { error } = await supabase.from("aluno_missoes").insert({
      aluno_id: dados.alunoId,
      data: a.data,
      titulo: p.titulo,
      materia: p.materia,
      assunto: null,
      tipo: p.tipo,
      duracao_minutos: p.minutos,
      duracao_estimada_min: p.minutos,
      prioridade: p.importancia >= 15 ? 3 : 2,
      origem: "copiloto",
      motivo_copiloto: motivoRemarcacao(a)
    });
    if (error) continue;
    reagendadas++;

    // A pendência remarcada passa a contar como carga já existente. Sem isso,
    // `preencherDiasLivres` continuaria enxergando o dia como vazio e
    // empilharia mais uma missão em cima — o oposto de "sem aumentar a carga
    // dos demais dias".
    dados.missoesAgendadas.push({
      id: `pendencia:${p.chave}`,
      data: a.data,
      titulo: p.titulo,
      materia: p.materia ?? "",
      assunto: null,
      tipo: p.tipo,
      duracao_minutos: p.minutos,
      duracao_estimada_min: p.minutos,
      prioridade: p.importancia >= 15 ? 3 : 2,
      origem: "copiloto",
      concluida: false
    });
  }

  if (reagendadas > 0) {
    recontarOcupacao(dados);
    await registrarEvento(dados.alunoId, "pendencias_reagendadas", null, null, {
      total_pendentes: pendencias.length,
      reagendadas,
      descartadas_por_baixa_importancia: pendencias.length - aReagendar.length
    });
  }
  return reagendadas;
}

// Recalcula dias livres/ocupados a partir de `missoesAgendadas`. Mesma conta
// de `carregarDados`, extraída porque agora precisa rodar de novo depois que
// o reagendamento de pendências ocupa dias que antes estavam vazios — é isso
// que decide qual cenário o motor vai executar em seguida.
function recontarOcupacao(dados: DadosAluno): void {
  const datasComMissao = new Set(dados.missoesAgendadas.map((m) => m.data));
  dados.diasOcupados = datasComMissao.size;
  dados.diasLivres = 0;
  if (!dados.diasRestantes || dados.diasRestantes <= 0) return;
  const MAPA_DIA: Record<number, string> = { 0: "dom", 1: "seg", 2: "ter", 3: "qua", 4: "qui", 5: "sex", 6: "sab" };
  const diasEstudaSet = new Set(dados.briefing?.diasEstuda ?? []);
  const hoje = hojeISO();
  for (let d = 1; d <= dados.diasRestantes; d++) {
    const iso = somarDias(hoje, d);
    if (diasEstudaSet.size > 0 && !diasEstudaSet.has(MAPA_DIA[diaDaSemana(iso)])) continue;
    if (!datasComMissao.has(iso)) dados.diasLivres++;
  }
}

// ============================================================================
// CENÁRIO 3 — compactar cronograma (mais missões que dias restantes)
// ============================================================================

async function compactarCronograma(dados: DadosAluno): Promise<number> {
  if (dados.modo !== "cirurgico") return 0;
  if (!dados.briefing?.dataProva || !dados.diasRestantes) return 0;

  // Só compacta quando o cronograma padrão tem mais missões que dias restantes
  const ratio = dados.totalMissoesPadrao / Math.max(dados.diasRestantes, 1);
  if (ratio < 1.3) return 0; // cronograma ainda cabe

  const supabase = createAdminClient();

  // Score de todas as missões admin futuras
  const admMissoes = dados.missoesAgendadas.filter((m) => m.origem === "admin");
  if (admMissoes.length === 0) return 0;

  const scoredMissoes = admMissoes.map((m) => ({
    m, gen: genMateria(m.materia, dados),
  })).sort((a, b) => b.gen - a.gen);

  // Quantas missões cabem nos dias restantes (considerando horas por dia)?
  const horasPorDia = dados.briefing.horasPorDia;
  const maxMinPorDia = horasPorDia * 60;
  const missoesPorDia = Math.max(1, Math.floor(maxMinPorDia / 45)); // ~45 min por missão
  const maxMissoes = dados.diasRestantes * missoesPorDia;

  // Quantas precisam ser removidas?
  const remover = Math.max(0, admMissoes.length - maxMissoes);
  if (remover === 0) return 0;

  // Remove as de menor GEN (final da lista ordenada)
  const paraRemover = scoredMissoes.slice(-remover).map((x) => x.m.id);
  if (paraRemover.length === 0) return 0;

  await supabase.from("aluno_missoes")
    .delete()
    .in("id", paraRemover);

  await registrarEvento(dados.alunoId, "compactacao_cronograma", null, null, {
    total_antes: admMissoes.length,
    removidas: paraRemover.length,
    dias_restantes: dados.diasRestantes,
    ratio_original: ratio.toFixed(2),
  });

  // Verificar se, após compactar, sobrou espaço para reorganizar por prioridade
  // (reagendar as missões restantes distribuídas uniformemente)
  const { data: missoesRestantes } = await supabase
    .from("aluno_missoes")
    .select("id, materia, tipo, duracao_minutos")
    .eq("aluno_id", dados.alunoId)
    .eq("origem", "admin")
    .eq("concluida", false)
    .gte("data", hojeISO());

  if ((missoesRestantes?.length ?? 0) > 0) {
    // Reordenar: colocar as de maior GEN nos primeiros dias
    // (não altera datas — garante que o aluno estuda o mais importante primeiro)
    const ordenadas = (missoesRestantes ?? [])
      .map((m: any) => ({ id: m.id, gen: genMateria(m.materia, dados) }))
      .sort((a, b) => b.gen - a.gen);

    // Atualiza prioridade para refletir a ordem de importância
    for (let i = 0; i < ordenadas.length; i++) {
      const prioridade = i < Math.ceil(ordenadas.length * 0.3) ? 3
        : i < Math.ceil(ordenadas.length * 0.6) ? 2 : 1;
      await supabase.from("aluno_missoes")
        .update({ prioridade })
        .eq("id", ordenadas[i].id);
    }
  }

  return paraRemover.length;
}

// ============================================================================
// CHECK-IN CONVERSACIONAL
// ============================================================================

interface PerguntaCheckin {
  pergunta: string;
  contexto: string;
  opcoes: Array<{ label: string; valor: string; descricao: string; acao_tipo: string; acao_payload: Record<string, unknown> }>;
  gatilho: string;
}

async function jaFezPerguntaRecentemente(alunoId: string, gatilho: string, diasJanela = 7): Promise<boolean> {
  const supabase = createAdminClient();
  const desde = new Date(Date.now() - diasJanela * 86400000).toISOString();
  const { data } = await supabase.from("copiloto_checkin")
    .select("id")
    .eq("aluno_id", alunoId)
    .eq("gatilho", gatilho)
    .gte("created_at", desde)
    .maybeSingle();
  return !!data;
}

async function criarCheckin(alunoId: string, p: PerguntaCheckin): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("copiloto_checkin").insert({
    aluno_id: alunoId,
    pergunta: p.pergunta,
    contexto: p.contexto,
    opcoes: p.opcoes,
    gatilho: p.gatilho,
  });
}

async function gerarCheckinsContextuais(dados: DadosAluno): Promise<void> {
  const { alunoId, diasRestantes, briefing, modo } = dados;

  // --- PERGUNTA 1: aumentar tempo de estudo (prova <30 dias) ---
  if (
    diasRestantes !== null && diasRestantes <= 30 && diasRestantes > 7 &&
    briefing && briefing.horasPorDia < 4 &&
    !(await jaFezPerguntaRecentemente(alunoId, "aumentar_tempo"))
  ) {
    const novasHoras = Math.min(briefing.horasPorDia + 0.5, 5);
    await criarCheckin(alunoId, {
      gatilho: "aumentar_tempo",
      pergunta: `Faltam ${diasRestantes} dias e você ainda tem conteúdos importantes pra cobrir. Posso aumentar seu tempo de estudo diário de ${briefing.horasPorDia}h para ${novasHoras}h?`,
      contexto: `Com mais ${(novasHoras - briefing.horasPorDia) * 60} minutos por dia você consegue cobrir ${Math.round((novasHoras - briefing.horasPorDia) * 60 / 45)} missões extras diárias na reta final.`,
      opcoes: [
        { label: "Sim, pode aumentar", valor: "sim", descricao: `Vou adicionar mais ${Math.round((novasHoras - briefing.horasPorDia) * 60)} min de conteúdo por dia`, acao_tipo: "aumentar_tempo_estudo", acao_payload: { horas_novas: novasHoras } },
        { label: "Não, manter como está", valor: "nao", descricao: "Vou manter o cronograma atual", acao_tipo: "nenhuma", acao_payload: {} },
      ],
    });
  }

  // --- PERGUNTA 2: compactar cronograma (prova iminente) ---
  if (
    diasRestantes !== null && diasRestantes <= 21 && dados.totalMissoesPadrao > diasRestantes * 1.5 &&
    !(await jaFezPerguntaRecentemente(alunoId, "compactar_cronograma", 14))
  ) {
    await criarCheckin(alunoId, {
      gatilho: "compactar_cronograma",
      pergunta: `Faltam ${diasRestantes} dias e ainda há ${dados.totalMissoesPadrao} atividades no cronograma. Não vai dar pra fazer tudo. Posso reorganizar priorizando os conteúdos com maior impacto na sua nota?`,
      contexto: "Vou manter as matérias de maior peso e remover as menos urgentes para você focar no que realmente muda sua nota.",
      opcoes: [
        { label: "Sim, reorganiza pra mim", valor: "sim", descricao: "Vou compactar e priorizar pelo GEN de cada matéria", acao_tipo: "compactar_cronograma", acao_payload: { forcado: true } },
        { label: "Não, quero manter tudo", valor: "nao", descricao: "Vou manter o cronograma original", acao_tipo: "nenhuma", acao_payload: {} },
      ],
    });
  }

  // --- PERGUNTA 3: focar em matéria de turbulência com baixa precisão ---
  const materiasCriticas = [...dados.materias.entries()]
    .map(([mat, m]) => {
      const sentimento = briefing?.sentimentos[chaveMateria(mat)] ?? "Atenção";
      if (sentimento !== "Turbulência") return null;
      const d = dados.respostas.filter((r) => mesmaMateria(r.materia, mat));
      if (d.length < 5) return null;
      const precisao = d.filter((r) => r.correta).length / d.length * 100;
      if (precisao >= 50) return null;
      return { mat, precisao: Math.round(precisao), relevancia: Math.round(m.relevancia) };
    })
    .filter(Boolean)
    .sort((a, b) => b!.relevancia - a!.relevancia);

  const topCritica = materiasCriticas[0];
  if (
    topCritica &&
    !(await jaFezPerguntaRecentemente(alunoId, `focar_${topCritica.mat}`, 10))
  ) {
    await criarCheckin(alunoId, {
      gatilho: `focar_${topCritica.mat}`,
      pergunta: `Você tem ${topCritica.precisao}% de acerto em ${topCritica.mat} (${topCritica.relevancia}% da prova). Posso priorizar ${topCritica.mat} no seu cronograma desta semana?`,
      contexto: `${topCritica.mat} representa ${topCritica.relevancia}% da sua nota. Com sua precisão atual, focar aqui é a intervenção de maior impacto.`,
      opcoes: [
        { label: `Sim, prioriza ${topCritica.mat}`, valor: "sim", descricao: `Vou adicionar sessões extras de ${topCritica.mat} nos próximos 7 dias`, acao_tipo: "focar_materia", acao_payload: { materia: topCritica.mat, dias: 7 } },
        { label: "Não, distribuir normalmente", valor: "nao", descricao: "Vou manter o cronograma distribuído", acao_tipo: "nenhuma", acao_payload: {} },
      ],
    });
  }

  // --- PERGUNTA 4: usar tempo de domínio para treinar matéria difícil ---
  if (
    modo === "cirurgico" &&
    !(await jaFezPerguntaRecentemente(alunoId, "trocar_dominio", 14))
  ) {
    const materiaDominada = [...dados.materias.entries()].find(([mat]) => {
      const s = briefing?.sentimentos[chaveMateria(mat)] ?? "Atenção";
      if (s !== "Domínio") return false;
      const d = dados.respostas.filter((r) => mesmaMateria(r.materia, mat));
      if (d.length < 5) return false;
      return d.filter((r) => r.correta).length / d.length >= 0.75;
    });
    const materiaDificil = materiasCriticas[0];

    if (materiaDominada && materiaDificil) {
      const [mat] = materiaDominada;
      await criarCheckin(alunoId, {
        gatilho: "trocar_dominio",
        pergunta: `Você já domina ${mat} (tempo apertado). Posso reduzir as sessões de ${mat} e usar esse tempo para reforçar ${materiaDificil.mat}?`,
        contexto: `${mat} já está bem — ${materiaDificil.mat} precisa mais da sua atenção agora.`,
        opcoes: [
          { label: "Sim, faz sentido", valor: "sim", descricao: `Vou redistribuir o tempo de ${mat} para ${materiaDificil.mat}`, acao_tipo: "redistribuir_tempo", acao_payload: { de: mat, para: materiaDificil.mat } },
          { label: "Prefiro manter tudo", valor: "nao", descricao: "Vou manter as sessões de ambas", acao_tipo: "nenhuma", acao_payload: {} },
        ],
      });
    }
  }
}

// ---- Aplicar respostas do check-in ----------------------------------------

async function aplicarCheckinsRespondidos(dados: DadosAluno): Promise<void> {
  if (dados.checkinsNaoAplicados.length === 0) return;
  const supabase = createAdminClient();

  for (const checkin of dados.checkinsNaoAplicados) {
    const { acao_tipo, acao_payload } = checkin.resposta_acao as {
      acao_tipo: string; acao_payload: Record<string, unknown>;
    };
    const val = checkin.resposta_valor;

    if (val !== "sim" || acao_tipo === "nenhuma") {
      // Marcar como aplicado sem fazer nada
      await supabase.from("copiloto_checkin")
        .update({ aplicada: true, aplicada_em: new Date().toISOString() })
        .eq("id", checkin.id);
      continue;
    }

    try {
      // --- aumentar_tempo_estudo ---
      if (acao_tipo === "aumentar_tempo_estudo") {
        const horasNovas = Number(acao_payload.horas_novas ?? dados.briefing?.horasPorDia ?? 2);
        await supabase.from("aluno_briefing")
          .update({ horas_por_dia_semana: horasNovas, horas_por_dia_fim_semana: horasNovas })
          .eq("aluno_id", dados.alunoId);
        // Adicionar missões extras nos próximos 7 dias que tiverem espaço
        for (let d = 1; d <= 7; d++) {
          const iso = somarDias(hojeISO(), d);
          const missoesNoDia = dados.missoesAgendadas.filter((m) => m.data === iso);
          const minUsados = missoesNoDia.reduce((s, m) => s + m.duracao_estimada_min, 0);
          const maxMin = horasNovas * 60;
          if (minUsados + 40 <= maxMin) {
            // Só considera matérias que têm conteúdo — antes bastava ter GEN
            // alto, e o aluno ganhava uma missão que não abria nada.
            const mat = [...dados.materias.keys()]
              .filter((m) => tipoComConteudo(dados, m, "questoes") !== null)
              .sort((a, b) => genMateria(b, dados) - genMateria(a, dados))[0];
            const tipoMat = mat ? tipoComConteudo(dados, mat, "questoes") : null;
            if (mat && tipoMat) {
              await supabase.from("aluno_missoes").insert({
                aluno_id: dados.alunoId, data: iso,
                titulo: `${tipoMat === "flashcards" ? "Flashcards" : "Questões"} · ${mat} — Copiloto (+tempo)`,
                materia: mat, assunto: null, tipo: tipoMat,
                duracao_minutos: 40, duracao_estimada_min: 40,
                prioridade: 2, origem: "copiloto",
                motivo_copiloto: `[checkin] aluno aceitou aumentar tempo de estudo`,
              });
            }
          }
        }
      }

      // --- focar_materia ---
      if (acao_tipo === "focar_materia") {
        const mat = acao_payload.materia as string;
        const dias = Number(acao_payload.dias ?? 7);
        let adicionados = 0;
        for (let d = 1; d <= Math.min(dias, dados.diasRestantes ?? dias) && adicionados < 5; d++) {
          const iso = somarDias(hojeISO(), d);
          const missoesNoDia = dados.missoesAgendadas.filter((m) => m.data === iso);
          const jaTemMateria = missoesNoDia.some((m) => mesmaMateria(m.materia, mat));
          if (jaTemMateria) continue;
          const tipoFoco = tipoComConteudo(dados, mat, "questoes");
          if (!tipoFoco) break; // matéria pedida no check-in não tem conteúdo
          const minUsados = missoesNoDia.reduce((s, m) => s + m.duracao_estimada_min, 0);
          const maxMin = (dados.briefing?.horasPorDia ?? 2) * 60;
          if (minUsados + 40 <= maxMin) {
            await supabase.from("aluno_missoes").insert({
              aluno_id: dados.alunoId, data: iso,
              titulo: `${tipoFoco === "flashcards" ? "Flashcards" : "Questões"} · ${mat} — Copiloto (foco)`,
              materia: mat, assunto: null, tipo: tipoFoco,
              duracao_minutos: 40, duracao_estimada_min: 40,
              prioridade: 3, origem: "copiloto",
              motivo_copiloto: `[checkin] aluno pediu foco em ${mat}`,
            });
            adicionados++;
          }
        }
      }

      // --- redistribuir_tempo ---
      if (acao_tipo === "redistribuir_tempo") {
        const de = acao_payload.de as string;
        const para = acao_payload.para as string;
        // Encontrar 2-3 missões futuras de 'de' e substituir por missões de 'para'
        const missoesParaSubstituir = dados.missoesAgendadas
          .filter((m) => mesmaMateria(m.materia, de) && m.origem === "admin" && !m.concluida)
          .slice(0, 3);
        // Redistribuir apaga missões existentes: se a matéria de destino não
        // tem conteúdo, o aluno terminaria com menos missões válidas do que
        // começou.
        const tipoPara = tipoComConteudo(dados, para, "questoes");
        for (const m of tipoPara ? missoesParaSubstituir : []) {
          await supabase.from("aluno_missoes").delete().eq("id", m.id);
          await supabase.from("aluno_missoes").insert({
            aluno_id: dados.alunoId, data: m.data,
            titulo: `${tipoPara === "flashcards" ? "Flashcards" : "Questões"} · ${para} — Copiloto (redistribuído)`,
            materia: para, assunto: null, tipo: tipoPara,
            duracao_minutos: m.duracao_minutos, duracao_estimada_min: m.duracao_estimada_min,
            prioridade: 2, origem: "copiloto",
            motivo_copiloto: `[checkin] redistribuído de ${de} para ${para}`,
          });
        }
      }

      // --- compactar_cronograma (forçado pelo checkin) ---
      if (acao_tipo === "compactar_cronograma") {
        await compactarCronograma({ ...dados, modo: "cirurgico" });
      }

    } catch (e) {
      console.error(`[copiloto] erro aplicando checkin ${checkin.id}:`, e);
    }

    await supabase.from("copiloto_checkin")
      .update({ aplicada: true, aplicada_em: new Date().toISOString() })
      .eq("id", checkin.id);
  }
}

// ============================================================================
// ENGINE DE RECOMENDAÇÕES (engine de GEN — sem alterações no cronograma)
// ============================================================================

interface Intervencao {
  materia: string;
  assunto: string | null;
  gen: number;
  precisaoAtual: number;
  qtdErros: number;
  qtdTotal: number;
  relevancia: number;
  tipoRecomendado: "questoes" | "flashcards" | "aula" | "revisao";
  urgencia: 1 | 2 | 3;
  descricao: string;
}

function calcularIntervencoes(dados: DadosAluno): Intervencao[] {
  const cfg = CFG[dados.modo];
  const lista: Intervencao[] = [];

  // Por assunto
  const porAssunto = new Map<string, { a: number; e: number; t: number; mat: string }>();
  dados.respostas.forEach((r) => {
    if (!r.assunto) return;
    const k = `${r.materia}||${r.assunto}`;
    const c = porAssunto.get(k) ?? { a: 0, e: 0, t: 0, mat: r.materia };
    c.t++; if (r.correta) c.a++; else c.e++; porAssunto.set(k, c);
  });
  for (const [k, d] of porAssunto) {
    if (d.e < cfg.errosMinGatilho) continue;
    const [materia, assunto] = k.split("||");
    const m = dados.materias.get(materia); if (!m) continue;
    const precisao = (d.a / d.t) * 100;
    const sentimento = dados.briefing?.sentimentos[chaveMateria(materia)] ?? "Atenção";
    const gen = calcularGEN({ relevancia: m.relevancia, precisao, qtdErros: d.e, diasRestantes: dados.diasRestantes, sentimento });
    if (gen < cfg.genMin) continue;
    // Escolha do formato da revisão.
    //
    // A condição de flashcards era `precisao < 35 && flashPorMat > 0`, e
    // `flashPorMat` conta REVISÕES JÁ FEITAS pelo aluno — não os flashcards
    // que existem. Para quem nunca revisou nada (o caso de todo aluno novo),
    // esse contador é zero e a condição nunca era verdadeira: o Copiloto
    // simplesmente não gerava revisão em flashcard, que é o que foi relatado.
    //
    // Agora quem responde é o inventário real (dados.inventario, via
    // tipoComConteudo) e o limiar de precisão sobe para 60: flashcard é a
    // ferramenta certa justamente para lacuna de memorização — erro por não
    // lembrar, não por não saber resolver. Erro em volume (>=3) continua
    // pedindo questões, que é treino de aplicação.
    const inv = dados.inventario.get(chaveMateria(materia)) ?? INVENTARIO_VAZIO;
    const preferido = dados.modo === "cirurgico" ? "questoes"
      : d.e >= 3 ? "questoes"
      : precisao < 60 && inv.flashcards > 0 ? "flashcards"
      : "questoes";
    const tipo = tipoComConteudo(dados, materia, preferido);
    if (!tipo) continue; // sem conteúdo para essa matéria: nada a recomendar
    lista.push({ materia, assunto, gen, precisaoAtual: precisao, qtdErros: d.e, qtdTotal: d.t, relevancia: m.relevancia, tipoRecomendado: tipo, urgencia: gen > 15 ? 3 : gen > 6 ? 2 : 1, descricao: gerarDescricao({ assunto, materia, qtdErros: d.e, total: d.t, precisao, relevancia: m.relevancia, diasRestantes: dados.diasRestantes }) });
  }

  // Por matéria
  const porMat = new Map<string, { a: number; e: number; t: number }>();
  dados.respostas.forEach((r) => {
    const c = porMat.get(r.materia) ?? { a: 0, e: 0, t: 0 };
    c.t++; if (r.correta) c.a++; else c.e++; porMat.set(r.materia, c);
  });
  for (const [materia, d] of porMat) {
    if (d.t < 10 || d.e < cfg.errosMinGatilho) continue;
    const m = dados.materias.get(materia); if (!m) continue;
    const precisao = (d.a / d.t) * 100;
    if (precisao >= 65) continue;
    const sentimento = dados.briefing?.sentimentos[chaveMateria(materia)] ?? "Atenção";
    const gen = calcularGEN({ relevancia: m.relevancia, precisao, qtdErros: d.e, diasRestantes: dados.diasRestantes, sentimento }) * 0.7;
    if (gen < cfg.genMin) continue;
    const tipoMat = tipoComConteudo(dados, materia, "questoes");
    if (!tipoMat) continue; // sem questões nem flashcards: não vira missão
    lista.push({ materia, assunto: null, gen, precisaoAtual: precisao, qtdErros: d.e, qtdTotal: d.t, relevancia: m.relevancia, tipoRecomendado: tipoMat, urgencia: gen > 12 ? 3 : gen > 5 ? 2 : 1, descricao: gerarDescricao({ assunto: null, materia, qtdErros: d.e, total: d.t, precisao, relevancia: m.relevancia, diasRestantes: dados.diasRestantes }) });
  }

  return lista.sort((a, b) => b.gen - a.gen);
}

function gerarDescricao(p: { assunto: string | null; materia: string; qtdErros: number; total: number; precisao: number; relevancia: number; diasRestantes: number | null }): string {
  const topico = p.assunto ? `${p.assunto} (${p.materia})` : p.materia;
  const rel = `${Math.round(p.relevancia)}% da prova`;
  const erroStr = p.qtdErros === 1 ? "uma questão" : p.qtdErros === 2 ? "duas questões" : `${p.qtdErros} questões`;
  const precStr = p.total >= 5 ? ` — precisão: ${Math.round(p.precisao)}%` : "";
  if (p.qtdErros === 1) return `Você errou ${erroStr} de ${topico}${precStr}. Essa matéria representa ${rel} — hora de revisar enquanto ainda está fresco.`;
  if (p.qtdErros <= 3) return `Você errou ${erroStr} de ${topico}${precStr}. Com ${rel}, cada questão certa aqui aumenta sua nota.`;
  return `${topico}: ${p.qtdErros} erros${precStr}. Representa ${rel}${p.diasRestantes ? ` — ${p.diasRestantes} dias para a prova` : ""}. Intervenção de alto impacto.`;
}

async function criarRecomendacoes(dados: DadosAluno, intervencoes: Intervencao[]): Promise<void> {
  const cfg = CFG[dados.modo];
  const supabase = createAdminClient();
  const { count } = await supabase.from("copiloto_recomendacoes").select("id", { count: "exact", head: true }).eq("aluno_id", dados.alunoId).eq("status", "pendente");
  // maxRec vem do admin (configuracoes → copiloto.max_recomendacoes.*).
  const vagas = dados.config.maxRecomendacoes[dados.modo] - (count ?? 0);
  if (vagas <= 0) return;
  let criadas = 0;
  for (const iv of intervencoes) {
    if (criadas >= vagas) break;
    // Já existe recomendação para esta matéria/assunto — pendente OU já
    // respondida?
    //
    // Antes esta checagem filtrava `status = 'pendente'`. Consequência: no
    // instante em que o aluno tocava em "Já revisei", a recomendação saía do
    // conjunto verificado e a rodada seguinte do Copiloto recriava uma
    // idêntica. O aluno via o cartão sumir, recarregava a página e ele
    // estava lá de novo — parecia que a conclusão não tinha sido salva,
    // quando na verdade tinha: o que voltava era uma recomendação NOVA.
    let q = supabase
      .from("copiloto_recomendacoes")
      .select("id, status, concluida_em, gerado_em")
      .eq("aluno_id", dados.alunoId)
      .eq("materia", iv.materia)
      .order("gerado_em", { ascending: false })
      .limit(1);
    if (iv.assunto) q = q.eq("assunto", iv.assunto); else q = q.is("assunto", null);
    const { data: anteriores } = await q;
    const anterior = (anteriores ?? [])[0] as
      | { id: string; status: string; concluida_em: string | null; gerado_em: string | null }
      | undefined;

    if (anterior) {
      // Pendente: o aluno ainda não respondeu, não faz sentido duplicar.
      if (anterior.status === "pendente") continue;

      // Já respondida: só volta a ser recomendada se houver ERRO NOVO no
      // assunto depois da resposta. É a diferença entre revisão estratégica
      // e repetição — o aluno que revisou e passou a acertar não recebe a
      // mesma tarefa de novo, mas quem voltou a errar recebe.
      const desde = anterior.concluida_em ?? anterior.gerado_em;
      const houveErroNovo = dados.respostas.some(
        (r) =>
          !r.correta &&
          mesmaMateria(r.materia, iv.materia) &&
          (iv.assunto ? r.assunto === iv.assunto : true) &&
          (!desde || r.createdAt > desde)
      );
      if (!houveErroNovo) continue;
    }
    let motivo = iv.descricao;
    if (cfg.gemini && iv.gen > 12) {
      const r = await gerarTextoGemini(`Copiloto Decola: 2 frases motivadoras para o aluno revisar agora. Contexto: ${iv.descricao}. Sem saudação, português informal.`);
      if (r) motivo = r;
    }

    // --- PRODUÇÃO SOB DEMANDA ---
    // Quando o assunto é específico, o GEN é alto o suficiente para
    // justificar o custo de chamadas externas, e o modo permite IA
    // (desativada no cirúrgico por velocidade), checa se a plataforma
    // tem material suficiente — se não tiver, gera flashcards via
    // Gemini e busca uma vídeo-aula REAL (nunca inventada) via YouTube
    // Data API antes de criar a recomendação.
    let payloadExtra: Record<string, unknown> = {};
    if (cfg.gemini && iv.assunto && iv.gen > 8) {
      try {
        const producao = await produzirMaterialSobDemanda(
          dados.alunoId, iv.materia, iv.assunto,
          `GEN=${iv.gen.toFixed(1)} | ${iv.qtdErros} erro(s) registrado(s)`
        );
        if (producao.produziu) {
          payloadExtra = {
            material_gerado_ia: true,
            flashcards_gerados: producao.flashcardsGerados,
            video_url: producao.videoUrl,
            video_titulo: producao.videoTitulo
          };
          if (producao.videoUrl) {
            motivo += ` Preparei uma vídeo-aula completa sobre esse assunto especialmente pra você.`;
          } else if (producao.flashcardsGerados > 0) {
            motivo += ` Criei novos flashcards sobre esse assunto pra reforçar.`;
          }
        }
      } catch (e) {
        console.error("[copiloto] falha na produção sob demanda:", e);
      }
    }

    const titulo = iv.qtdErros === 0 ? `Iniciar: ${iv.assunto ?? iv.materia}` : iv.qtdErros === 1 ? `Revisar: ${iv.assunto ?? iv.materia}` : iv.qtdErros <= 3 ? `Reforçar: ${iv.assunto ?? iv.materia} (${iv.qtdErros} erros)` : `Urgente: ${iv.assunto ?? iv.materia} (${iv.qtdErros} erros)`;
    await supabase.from("copiloto_recomendacoes").insert({ aluno_id: dados.alunoId, tipo: iv.tipoRecomendado, materia: iv.materia, assunto: iv.assunto, titulo, motivo, prioridade: iv.urgencia, payload: { modo: dados.modo, gen: iv.gen, qtd_erros: iv.qtdErros, precisao: Math.round(iv.precisaoAtual), relevancia: Math.round(iv.relevancia), ...payloadExtra }, fonte: "gatilho" });
    await registrarEvento(dados.alunoId, "gen_recomendacao", iv.materia, iv.assunto, { gen: iv.gen, modo: dados.modo, tipo: iv.tipoRecomendado });
    criadas++;
  }
}

// ---- Utilitários -----------------------------------------------------------

async function registrarEvento(alunoId: string, gatilho: string, materia?: string | null, assunto?: string | null, detalhes: Record<string, unknown> = {}) {
  const supabase = createAdminClient();
  // .then(onFulfilled, onRejected) em vez de .then().catch(): o retorno do
  // query builder do Supabase é só PromiseLike (não Promise de verdade), que
  // não tem .catch() — mas aceita o segundo argumento de .then() pra tratar
  // erro sem precisar encadear.
  await supabase.from("copiloto_eventos").insert({ aluno_id: alunoId, gatilho, materia, assunto, detalhes }).then(
    () => {},
    () => {}
  );
}

// ============================================================================
// PONTO DE ENTRADA PÚBLICO
// ============================================================================

export async function rodarCopiloto(ctx: ContextoAluno): Promise<void> {
  let dados: DadosAluno;
  try {
    dados = await carregarDados(ctx);
  } catch (e) {
    console.error("[copiloto] falha ao carregar dados:", e);
    return;
  }

  await registrarEvento(dados.alunoId, `modo_${dados.modo}`, null, null, {
    dias_restantes: dados.diasRestantes, dias_livres: dados.diasLivres,
    dias_ocupados: dados.diasOcupados, acao: ctx.ultimaAcao,
  });

  try {
    // 0. Aplicar respostas de check-in pendentes (antes de qualquer outra coisa)
    await aplicarCheckinsRespondidos(dados);

    // 0.5. Recuperar o que ficou para trás. Vem ANTES dos cenários porque
    // pendência tem prioridade sobre conteúdo novo: de nada adianta o
    // Copiloto encher os dias livres de missão inédita se o aluno ainda deve
    // a aula da semana passada. Rodando aqui, os dias que a recuperação
    // ocupar já entram como carga na hora de decidir o cenário.
    await reagendarPendencias(dados);

    // 1. Ajustes no cronograma segundo o cenário
    if (dados.diasLivres > 0) {
      // Cenário 1: dias livres → preencher
      await preencherDiasLivres(dados);
    } else if (dados.diasRestantes !== null && dados.totalMissoesPadrao > dados.diasRestantes * 1.3) {
      // Cenário 3: cronograma maior que dias restantes → compactar
      await compactarCronograma(dados);
    } else {
      // Cenário 2: sem dias livres, cronograma encaixa → modificar dias ocupados
      await modificarDiasOcupados(dados);
    }

    // 2. Criar recomendações (painéis de "Fazer agora")
    const intervencoes = calcularIntervencoes(dados);
    await criarRecomendacoes(dados, intervencoes);

    // 3. Check-ins contextuais (perguntas com opções)
    await gerarCheckinsContextuais(dados);

  } catch (e) {
    console.error("[copiloto] erro no motor:", e);
  }
}

// ---- Cronograma adaptativo (chamado separadamente pelo admin/sistema) -------

export interface ResultadoCronograma {
  modo: ModoAdaptativo;
  diasLivres: number;
  missoesGeradas: number;
  missoesIgnoradas: number;
  pendenciasRecuperadas: number;
  distribuicao: Record<string, number>;
  log: string[];
}

export async function gerarCronogramaAdaptativo(alunoId: string): Promise<ResultadoCronograma> {
  const dados = await carregarDados({ alunoId });
  const log: string[] = [];
  log.push(`Modo: ${dados.modo} | Dias restantes: ${dados.diasRestantes ?? "??"} | Livres: ${dados.diasLivres} | Ocupados: ${dados.diasOcupados}`);
  if (!dados.briefing?.dataProva) return { modo: dados.modo, diasLivres: 0, missoesGeradas: 0, missoesIgnoradas: 0, pendenciasRecuperadas: 0, distribuicao: {}, log: ["Sem data de prova."] };
  if ((dados.diasRestantes ?? 0) <= 0) return { modo: dados.modo, diasLivres: 0, missoesGeradas: 0, missoesIgnoradas: 0, pendenciasRecuperadas: 0, distribuicao: {}, log: ["Prova já passou."] };

  const recuperadas = await reagendarPendencias(dados);
  if (recuperadas > 0) log.push(`Recuperação: ${recuperadas} atividades pendentes remarcadas (dias livres primeiro).`);

  let geradas = 0;
  if (dados.diasLivres > 0) {
    geradas = await preencherDiasLivres(dados);
    log.push(`Cenário 1: ${geradas} missões adicionadas aos dias livres.`);
  } else if (dados.totalMissoesPadrao > (dados.diasRestantes ?? 0) * 1.3) {
    const rem = await compactarCronograma(dados);
    log.push(`Cenário 3: ${rem} missões removidas para compactar o cronograma.`);
  } else {
    const mod = await modificarDiasOcupados(dados);
    log.push(`Cenário 2: ${mod} dias modificados (extra ou substituição).`);
  }

  const { data: mis } = await createAdminClient().from("aluno_missoes").select("materia").eq("aluno_id", alunoId).eq("origem", "copiloto");
  const dist: Record<string, number> = {};
  (mis ?? []).forEach((m: any) => { dist[m.materia] = (dist[m.materia] ?? 0) + 1; });

  return { modo: dados.modo, diasLivres: dados.diasLivres, missoesGeradas: geradas, missoesIgnoradas: dados.diasOcupados, pendenciasRecuperadas: recuperadas, distribuicao: dist, log };
}
