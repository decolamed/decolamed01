import { createAdminClient } from "@/lib/supabase/server";
import { gerarTextoGemini } from "@/lib/gemini/client";
import { produzirMaterialSobDemanda } from "@/lib/copiloto/producao-sob-demanda";
import { hojeISO, somarDias, diaDaSemana, diffDias } from "@/lib/site/data";

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
  inventario: Map<string, { questoes: number; flashcards: number }>;
}

// ---- Configurações por modo ------------------------------------------------

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
    sentimentos: b.sentimentos ?? {},
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

  const modo = detectarModo(diasRestantes, diasLivres, diasOcupados, totalMissoesPadrao);
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
  };
}

// Conta o conteúdo ativo por matéria. É a checagem que faltava antes de
// prometer uma missão ao aluno: só se cria missão de um tipo que realmente
// tem conteúdo disponível para aquela matéria.
async function carregarInventario(): Promise<Map<string, { questoes: number; flashcards: number }>> {
  const supabase = createAdminClient();
  const [{ data: qs }, { data: fs }] = await Promise.all([
    supabase.from("questoes").select("materia").eq("ativo", true),
    supabase.from("flashcards").select("materia").eq("ativo", true),
  ]);
  const mapa = new Map<string, { questoes: number; flashcards: number }>();
  const somar = (materia: string | null, campo: "questoes" | "flashcards") => {
    const m = (materia ?? "").trim();
    if (!m) return;
    const atual = mapa.get(m) ?? { questoes: 0, flashcards: 0 };
    atual[campo] += 1;
    mapa.set(m, atual);
  };
  (qs ?? []).forEach((r: { materia: string | null }) => somar(r.materia, "questoes"));
  (fs ?? []).forEach((r: { materia: string | null }) => somar(r.materia, "flashcards"));
  return mapa;
}

// Devolve um tipo de missão que REALMENTE tem conteúdo para a matéria, ou
// null quando não há nada — nesse caso a missão simplesmente não é criada,
// em vez de virar um beco sem saída na tela do aluno.
function tipoComConteudo(
  dados: DadosAluno,
  materia: string,
  preferido: "questoes" | "flashcards" | "aula" | "revisao"
): "questoes" | "flashcards" | null {
  const inv = dados.inventario.get(materia) ?? { questoes: 0, flashcards: 0 };
  if ((preferido === "flashcards" || preferido === "revisao") && inv.flashcards > 0) return "flashcards";
  if (inv.questoes > 0) return "questoes";
  if (inv.flashcards > 0) return "flashcards";
  return null;
}

// ---- Detecção de modo ------------------------------------------------------

function detectarModo(
  diasRestantes: number | null,
  diasLivres: number,
  diasOcupados: number,
  totalMissoesPadrao: number
): ModoAdaptativo {
  if (diasRestantes === null) return "equilibrado";
  // Prova iminente ou missões sobrando muito além dos dias disponíveis
  if (diasRestantes <= 14 || diasLivres < 3) {
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
  dados.respostas.filter((r) => r.materia === materia).forEach((r) => {
    t++; if (r.correta) a++; else e++;
  });
  const precisao = t > 0 ? (a / t) * 100 : 50;
  const sentimento = dados.briefing?.sentimentos[materia] ?? "Atenção";
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

  const totalGen = scores.reduce((s, x) => s + Math.max(x.gen, 0.1), 0);
  const slots: Record<string, number> = {};
  scores.forEach(({ mat, gen }) => {
    slots[mat] = Math.max(1, Math.round((Math.max(gen, 0.1) / totalGen) * diasLivresOrdenados.length));
  });
  let soma = Object.values(slots).reduce((s, n) => s + n, 0);
  for (let i = scores.length - 1; i >= 0 && soma > diasLivresOrdenados.length; i--) {
    const m = scores[i].mat;
    const red = Math.min(soma - diasLivresOrdenados.length, Math.max(0, slots[m] - 1));
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
  const buckets = scores.map(({ mat }) => sequencia.filter((s) => s.materia === mat));
  const intercalada: typeof sequencia = [];
  let rodada = 0;
  while (intercalada.length < sequencia.length) {
    for (const b of buckets) { if (b[rodada]) intercalada.push(b[rodada]); }
    rodada++;
  }

  const missoes = intercalada.slice(0, diasLivresOrdenados.length).map((item, i) => {
    const sc = scores.find((x) => x.mat === item.materia)!;
    return {
      aluno_id: dados.alunoId,
      data: diasLivresOrdenados[i],
      titulo: `${item.tipo === "questoes" ? "Questões" : item.tipo === "flashcards" ? "Flashcards" : item.tipo === "revisao" ? "Revisão" : "Aula"} · ${item.materia} — Copiloto`,
      materia: item.materia,
      assunto: null as string | null,
      tipo: item.tipo,
      duracao_minutos: DURACAO_TIPO[item.tipo] ?? 40,
      duracao_estimada_min: DURACAO_TIPO[item.tipo] ?? 40,
      prioridade: sc.gen > 10 ? 2 : 1,
      origem: "copiloto" as const,
      motivo_copiloto: `[cenário1/${dados.modo}] GEN=${sc.gen.toFixed(1)}`,
    };
  });

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
    if (acoes >= 3) break; // no máximo 3 dias modificados por execução

    const minUsados = missoesDoDia.reduce((s, m) => s + (m.duracao_estimada_min || m.duracao_minutos), 0);

    // --- OPÇÃO A: adicionar missão extra se couber no tempo disponível ---
    const minExtra = DURACAO_TIPO.questoes;
    const tipoExtra = tipoComConteudo(dados, maisUrgente.mat, "questoes");
    if (tipoExtra && minUsados + minExtra <= maxMinPorDia) {
      const jaTemMateria = missoesDoDia.some((m) => m.materia === maisUrgente.mat);
      if (!jaTemMateria) {
        await supabase.from("aluno_missoes").insert({
          aluno_id: dados.alunoId, data,
          titulo: `${tipoExtra === "flashcards" ? "Flashcards" : "Questões"} · ${maisUrgente.mat} — Copiloto (extra)`,
          materia: maisUrgente.mat,
          assunto: null,
          tipo: tipoExtra,
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
    const tipoSubst = tipoComConteudo(dados, maisUrgente.mat, "questoes");
    if (!tipoSubst) continue;
    await supabase.from("aluno_missoes").delete().eq("id", candidataSubstituir.m.id);
    await supabase.from("aluno_missoes").insert({
      aluno_id: dados.alunoId, data,
      titulo: `${tipoSubst === "flashcards" ? "Flashcards" : "Questões"} · ${maisUrgente.mat} — Copiloto (substituiu ${candidataSubstituir.m.materia})`,
      materia: maisUrgente.mat,
      assunto: null,
      tipo: tipoSubst,
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
      const sentimento = briefing?.sentimentos[mat] ?? "Atenção";
      if (sentimento !== "Turbulência") return null;
      const d = dados.respostas.filter((r) => r.materia === mat);
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
      const s = briefing?.sentimentos[mat] ?? "Atenção";
      if (s !== "Domínio") return false;
      const d = dados.respostas.filter((r) => r.materia === mat);
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
          const jaTemMateria = missoesNoDia.some((m) => m.materia === mat);
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
          .filter((m) => m.materia === de && m.origem === "admin" && !m.concluida)
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
  const flashPorMat = new Map<string, number>();
  dados.revisoes.forEach((r) => flashPorMat.set(r.materia, (flashPorMat.get(r.materia) ?? 0) + 1));

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
    const sentimento = dados.briefing?.sentimentos[materia] ?? "Atenção";
    const gen = calcularGEN({ relevancia: m.relevancia, precisao, qtdErros: d.e, diasRestantes: dados.diasRestantes, sentimento });
    if (gen < cfg.genMin) continue;
    // `flashPorMat` conta REVISÕES JÁ FEITAS, não flashcards existentes —
    // era o que fazia o Copiloto prometer "Flashcards de X" para uma matéria
    // sem nenhum flashcard cadastrado. A preferência continua a mesma, mas
    // agora passa pelo inventário real antes de virar missão.
    const preferido = dados.modo === "cirurgico" ? "questoes"
      : d.e >= 3 ? "questoes"
      : precisao < 35 && (flashPorMat.get(materia) ?? 0) > 0 ? "flashcards"
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
    const sentimento = dados.briefing?.sentimentos[materia] ?? "Atenção";
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
  const vagas = cfg.maxRec - (count ?? 0);
  if (vagas <= 0) return;
  let criadas = 0;
  for (const iv of intervencoes) {
    if (criadas >= vagas) break;
    let q = supabase.from("copiloto_recomendacoes").select("id").eq("aluno_id", dados.alunoId).eq("status", "pendente").eq("materia", iv.materia);
    if (iv.assunto) q = q.eq("assunto", iv.assunto); else q = q.is("assunto", null);
    const { data: dup } = await q.maybeSingle(); if (dup) continue;
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
  distribuicao: Record<string, number>;
  log: string[];
}

export async function gerarCronogramaAdaptativo(alunoId: string): Promise<ResultadoCronograma> {
  const dados = await carregarDados({ alunoId });
  const log: string[] = [];
  log.push(`Modo: ${dados.modo} | Dias restantes: ${dados.diasRestantes ?? "??"} | Livres: ${dados.diasLivres} | Ocupados: ${dados.diasOcupados}`);
  if (!dados.briefing?.dataProva) return { modo: dados.modo, diasLivres: 0, missoesGeradas: 0, missoesIgnoradas: 0, distribuicao: {}, log: ["Sem data de prova."] };
  if ((dados.diasRestantes ?? 0) <= 0) return { modo: dados.modo, diasLivres: 0, missoesGeradas: 0, missoesIgnoradas: 0, distribuicao: {}, log: ["Prova já passou."] };

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

  return { modo: dados.modo, diasLivres: dados.diasLivres, missoesGeradas: geradas, missoesIgnoradas: dados.diasOcupados, distribuicao: dist, log };
}
