import type { TrilhaDia, TrilhaItem } from "@/types/database";
import { textoConfig } from "@/lib/site/configuracoes";
import { disponivelParaAluno } from "@/lib/site/avaliacoes";
import {
  assinaturaDosParametros,
  gerarRota,
  parametrosDoBriefing,
  type AjusteDoDia,
  type Rota,
  type SimuladoDisponivel
} from "@/lib/trilha/rota";
import { comDuracaoReal, aulasReferenciadas, type DuracaoConhecida } from "@/lib/trilha/duracao-das-aulas";
import { descreverViolacoes, requisitosDoTemplate, validarRota } from "@/lib/trilha/validador-rota";
import { aplicarQuestoesExtras } from "@/lib/trilha/questoes-extras-servidor";
import {
  CHAVES_DOS_SIMULADOS,
  decidirSimuladosDaRota,
  lerSimuladosConfigurados,
  type SimuladoDoCatalogo
} from "@/lib/trilha/simulados-da-rota";
import { contextoVazio, type ContextoDoAluno } from "@/lib/trilha/prioridade";
import { chaveCanonica } from "@/lib/site/materia-canonica";
import { chaveDeItemTrilha } from "@/lib/trilha/progresso";

// ============================================================================
// PERSISTÊNCIA DA ROTA (aluno_rota_dias)
//
// A rota é gerada deterministicamente por `gerarRota()` — mesmos parâmetros,
// mesma rota, sempre. Então por que gravar?
//
//   1. para o servidor (Copiloto, admin, relatórios) enxergar a MESMA rota
//      que o aluno vê, sem ter que refazer a conta em cada lugar;
//   2. para a regeração ser explícita: quando os parâmetros mudam, a rota
//      antiga é APAGADA e substituída, em vez de as duas versões conviverem;
//   3. para dar rastro do que o aluno recebeu — sem registro, "o cronograma
//      mudou sozinho" é impossível de investigar.
//
// A LEITURA nunca depende do que está gravado: a tela sempre usa a rota
// recém-gerada a partir do template atual. Assim, quando o admin corrige uma
// aula, a correção aparece na hora, e a linha gravada é só o espelho dela.
// Gravar não pode quebrar a tela: qualquer falha aqui é registrada no log e
// o aluno segue vendo a rota certa.
// ============================================================================

/** Só o que este módulo precisa do client — evita acoplar ao tipo gerado. */
type ClienteSupabase = {
  from: (tabela: string) => any;
};

interface LinhaRota {
  route_day: number;
  scheduled_date: string;
  assinatura: string;
}

/**
 * A rota do aluno, gerada do briefing e sincronizada com o banco.
 *
 * Devolve `null` — e a tela cai no cronograma linear do template — quando:
 *   • o aluno não é do Voo Guiado (o Decolando promete 40 dias fixos);
 *   • não há briefing com data de prova (sem janela não há rota);
 *   • a prova já passou.
 * Preferimos não mostrar rota nenhuma a mostrar uma rota chutada.
 */

/**
 * Quanto dura cada videoaula referenciada pelo template.
 *
 * Busca só os `ref_id` que o template usa — algumas dezenas, não o acervo
 * inteiro. Falha de consulta devolve mapa vazio de propósito: sem duração
 * confirmada o cronograma volta a usar a média por tipo, que é o
 * comportamento de sempre. Nenhum aluno fica sem cronograma por causa disto.
 */
async function duracoesDasAulas(
  supabase: ClienteSupabase,
  template: TrilhaDia[]
): Promise<Map<string, DuracaoConhecida>> {
  const ids = aulasReferenciadas(template);
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase
    .from("conteudos_biblioteca")
    .select("id, duracao_minutos, duracao_confirmada")
    .in("id", ids);

  if (error) {
    console.error("[rota] não foi possível ler a duração das aulas:", error.message);
    return new Map();
  }

  const mapa = new Map<string, DuracaoConhecida>();
  for (const linha of (data ?? []) as { id: string; duracao_minutos: number; duracao_confirmada: boolean }[]) {
    mapa.set(linha.id, { duracaoMinutos: linha.duracao_minutos, confirmada: Boolean(linha.duracao_confirmada) });
  }
  return mapa;
}

export async function rotaDoAluno(
  supabase: ClienteSupabase,
  alunoId: string,
  opcoes: {
    temCopiloto: boolean;
    briefing: Parameters<typeof parametrosDoBriefing>[0];
    template: TrilhaDia[];
    hoje: string;
  }
): Promise<Rota | null> {
  if (!opcoes.temCopiloto) return null;

  const parametros = parametrosDoBriefing(opcoes.briefing, opcoes.hoje);
  if (!parametros) return null;

  // A duração real das videoaulas entra ANTES de gerar: é a conta de quanto o
  // dia comporta que muda, não as regras de escolha. Ver duracao-das-aulas.ts.
  const template = comDuracaoReal(opcoes.template, await duracoesDasAulas(supabase, opcoes.template));

  const contexto = await contextoDoAluno(supabase, alunoId, opcoes.briefing);
  const rota = gerarRota(template, parametros, {
    ...(await contextoDaRota(supabase, alunoId)),
    ajustesDoMentor: await ajustesDoMentor(supabase, alunoId),
    contexto
  });
  if (rota.dias.length === 0) return null;

  // Camada complementar, aplicada DEPOIS que a rota está montada — nenhum
  // item principal muda de lugar por causa dela. Ver questoes-extras.ts.
  await aplicarQuestoesExtras(supabase, alunoId, rota, contexto);

  await sincronizarRota(supabase, alunoId, rota, template);
  return rota;
}

/**
 * O que o mentor definiu para os dias deste aluno, no painel.
 *
 * Entra na geração como ENTRADA, não como edição do resultado: a rota é
 * regerada a cada leitura da tela, então escrever direto em `aluno_rota_dias`
 * seria desfeito no carregamento seguinte. Guardar a intenção é o que faz a
 * edição do mentor sobreviver.
 *
 * Falha de leitura devolve vazio — a rota volta a ser a gerada, que não é o
 * que o mentor pediu, mas é uma rota completa e correta. Melhor do que uma
 * tela em branco.
 */
async function ajustesDoMentor(
  supabase: ClienteSupabase,
  alunoId: string
): Promise<Record<number, AjusteDoDia>> {
  const { data, error } = await supabase
    .from("aluno_rota_dias_ajustes")
    .select("route_day, titulo, itens")
    .eq("aluno_id", alunoId);

  if (error) {
    console.error("Rota: falha ao ler os ajustes do mentor:", error.message);
    return {};
  }

  const ajustes: Record<number, AjusteDoDia> = {};
  ((data as { route_day: number; titulo: string | null; itens: unknown }[]) ?? []).forEach((a) => {
    ajustes[a.route_day] = {
      titulo: a.titulo,
      // A coluna tem CHECK de array, mas um jsonb corrompido não pode
      // derrubar o cronograma inteiro de um aluno.
      itens: Array.isArray(a.itens) ? (a.itens as TrilhaItem[]) : []
    };
  });
  return ajustes;
}

/**
 * O que o algoritmo precisa saber sobre ESTE aluno para escolher conteúdo.
 *
 * Antes o briefing era guardado e nunca mais lido pela geração da rota, e o
 * desempenho não entrava em nada: a rota de um aluno que erra tudo em Biologia
 * era idêntica à de quem acerta tudo. Aqui os dois viram entrada do algoritmo.
 *
 * Qualquer falha de leitura devolve o contexto vazio: sem prioridades a rota
 * fica pedagógica pura (a ordem do template), que é pior do que a
 * personalizada, mas continua sendo uma rota válida.
 */
async function contextoDoAluno(
  supabase: ClienteSupabase,
  alunoId: string,
  briefing: Parameters<typeof parametrosDoBriefing>[0]
): Promise<ContextoDoAluno> {
  try {
    const [{ data: pesos }, { data: respostas }, { data: progresso }] = await Promise.all([
      supabase.from("materias_peso").select("materia, peso, qtd_questoes"),
      supabase.from("respostas_aluno").select("correta, questoes(materia)").eq("aluno_id", alunoId),
      // A coluna é `concluida`, não `concluido`. Com o nome errado o
      // PostgREST devolvia erro em vez de linhas, e o supabase-js não lança:
      // `progresso` chegava nulo e `ctx.concluidos` ficava sempre vazio. O
      // fator INEDITISMO da pontuação (10% da nota) nunca saía de 1 — a rota
      // não sabia o que o aluno já tinha concluído e podia devolver na
      // regeração o mesmo conteúdo que ele acabou de fazer.
      supabase.from("aluno_progresso_itens").select("chave").eq("aluno_id", alunoId).eq("concluida", true)
    ]);

    const ctx = contextoVazio();

    ((pesos as { materia: string; peso: number; qtd_questoes: number }[]) ?? []).forEach((m) => {
      ctx.pesos.set(chaveCanonica(m.materia), { peso: Number(m.peso) || 0, qtdQuestoes: Number(m.qtd_questoes) || 0 });
    });

    ((respostas as { correta: boolean; questoes?: { materia?: string | null } | null }[]) ?? []).forEach((r) => {
      const chave = chaveCanonica(r.questoes?.materia);
      if (!chave) return;
      const atual = ctx.desempenho.get(chave) ?? { acertos: 0, erros: 0 };
      if (r.correta) atual.acertos += 1;
      else atual.erros += 1;
      ctx.desempenho.set(chave, atual);
    });

    ((progresso as { chave: string }[]) ?? []).forEach((p) => ctx.concluidos.add(p.chave));

    ctx.sentimentos = ((briefing as { sentimentos?: Record<string, string> | null } | null)?.sentimentos ?? {}) as Record<
      string,
      string
    >;

    return ctx;
  } catch (e) {
    console.error("Rota: falha ao carregar o contexto do aluno:", e);
    return contextoVazio();
  }
}

/**
 * O que a rota precisa saber do resto da plataforma: quais simulados os dois
 * dias de simulado abrem e como nomear o dia da prova.
 *
 * QUAIS simulados não vem mais de `created_at`. Vem da escolha do admin em
 * /admin/configuracoes, e é fixado por aluno na primeira geração da rota —
 * a regra inteira, com o porquê de cada caso, está em
 * lib/trilha/simulados-da-rota.ts. Aqui só se lê o banco, se aplica a
 * decisão e se grava o vínculo novo.
 *
 * O nome do vestibular sai de `configuracoes` — nunca escrito no código, para
 * a plataforma servir a outro processo seletivo sem alteração de código.
 */
async function contextoDaRota(
  supabase: ClienteSupabase,
  alunoId: string
): Promise<{ simulados: (SimuladoDisponivel | null)[]; nomeVestibular: string | null }> {
  const [{ data: simulados, error }, { data: vinculos }, { data: marca }, { data: configs }, { data: fixadosData }, { data: tentativas }] =
    await Promise.all([
      supabase.from("simulados").select("id, titulo, ativo, redacao, tempo_minutos"),
      supabase.from("simulado_questoes").select("simulado_id"),
      supabase.from("configuracoes").select("valor").eq("chave", "site.marca.vestibular").maybeSingle(),
      supabase.from("configuracoes").select("chave, valor").in("chave", CHAVES_DOS_SIMULADOS),
      supabase.from("aluno_simulados_rota").select("ordem, simulado_id").eq("aluno_id", alunoId),
      supabase.from("simulado_tentativas").select("simulado_id").eq("aluno_id", alunoId)
    ]);

  if (error) console.error("Rota: falha ao carregar simulados:", error.message);

  // O catálogo traz TODOS os simulados, inclusive os desativados: um simulado
  // que o aluno já fez precisa continuar tendo nome no cronograma dele mesmo
  // depois de sair do ar. `utilizavel` é que aplica a régua da aba Atividades
  // — reservar o dia para um simulado vazio mandaria o aluno a uma tela sem
  // questões justamente no dia marcado para fazer a prova.
  const comQuestoes = new Set(((vinculos as { simulado_id: string }[]) ?? []).map((v) => v.simulado_id));
  const catalogo = new Map<string, SimuladoDoCatalogo>();
  (((simulados as { id: string; titulo: string; ativo: boolean; redacao?: unknown; tempo_minutos?: number | null }[]) ?? [])).forEach((s) => {
    catalogo.set(s.id, {
      id: s.id,
      titulo: s.titulo,
      // A duração de verdade da prova. Sem ela o dia de simulado ficava
      // sempre em 90 minutos, fixos no código.
      duracaoMinutos: s.tempo_minutos ?? null,
      utilizavel: disponivelParaAluno({
        ativo: Boolean(s.ativo),
        totalQuestoes: comQuestoes.has(s.id) ? 1 : 0,
        temRedacao: Boolean(s.redacao)
      })
    });
  });

  const fixados: Record<number, string | null> = {};
  (((fixadosData as { ordem: number; simulado_id: string | null }[]) ?? [])).forEach((f) => {
    fixados[f.ordem] = f.simulado_id;
  });

  const decisao = decidirSimuladosDaRota({
    configurados: lerSimuladosConfigurados(configs as { chave: string; valor: unknown }[], textoConfig),
    fixados,
    catalogo,
    realizados: new Set(((tentativas as { simulado_id: string }[]) ?? []).map((t) => t.simulado_id))
  });

  // Fixa o vínculo assim que ele é decidido. É o que faz a rota deste aluno
  // parar de depender da configuração do painel a partir de agora: mudar o
  // simulado em /admin/configuracoes vale para quem ainda não tem vínculo,
  // não para quem já recebeu. Falha aqui não pode derrubar a tela — a rota
  // desta leitura segue válida e o vínculo é tentado de novo na próxima.
  if (decisao.aFixar.length > 0) {
    const { error: erroFixar } = await supabase.from("aluno_simulados_rota").upsert(
      decisao.aFixar.map((f) => ({ aluno_id: alunoId, ordem: f.ordem, simulado_id: f.simuladoId })),
      { onConflict: "aluno_id,ordem" }
    );
    if (erroFixar) console.error("Rota: falha ao fixar simulados do aluno:", erroFixar.message);
  }

  // `textoConfig` desembrulha os valores jsonb escapados que existem no
  // banco desde antes da padronização.
  const nome = textoConfig((marca as { valor?: unknown } | null)?.valor).trim();

  return { simulados: decisao.simulados, nomeVestibular: nome || null };
}

/**
 * Deixa `aluno_rota_dias` igual à rota recebida.
 *
 * Só escreve quando algo mudou de verdade (assinatura, número de dias ou
 * alguma data) — a tela do aluno é lida a cada navegação e reescrever a rota
 * inteira toda vez seria desperdício puro.
 *
 * Quando escreve, apaga tudo antes: a rota nova SUBSTITUI a anterior. Fazer
 * upsert linha a linha deixaria sobras da rota antiga sempre que a nova
 * fosse mais curta — que é como um cronograma acaba com dois "Dia 12".
 */
export async function sincronizarRota(
  supabase: ClienteSupabase,
  alunoId: string,
  rota: Rota,
  template?: TrilhaDia[]
): Promise<void> {
  try {
    // Portão de publicação: rota inválida não é gravada. Se a geração
    // produzir algo que viole capacidade, datas, numeração ou conteúdo, o
    // aluno continua com a rota anterior — que ao menos era executável — e o
    // problema fica registrado com o motivo exato.
    const validacao = validarRota(rota, template ? requisitosDoTemplate(template) : undefined);
    if (!validacao.ok) {
      console.error(`Rota: geração inválida para o aluno ${alunoId}, nada foi gravado:\n${descreverViolacoes(validacao)}`);
      return;
    }

    const { data: atuais, error: erroLeitura } = await supabase
      .from("aluno_rota_dias")
      .select("route_day, scheduled_date, assinatura")
      .eq("aluno_id", alunoId)
      .order("route_day");

    if (erroLeitura) {
      console.error("Rota: falha ao ler a rota gravada:", erroLeitura.message);
      return;
    }

    if (!precisaRegravar((atuais as LinhaRota[]) ?? [], rota)) return;

    const { error: erroLimpeza } = await supabase.from("aluno_rota_dias").delete().eq("aluno_id", alunoId);
    if (erroLimpeza) {
      console.error("Rota: falha ao limpar a rota anterior:", erroLimpeza.message);
      return;
    }

    const linhas = rota.dias.map((d) => ({
      aluno_id: alunoId,
      route_day: d.routeDay,
      scheduled_date: d.scheduledDate,
      template_days: d.templateDays,
      tipo: d.tipo,
      titulo: d.titulo,
      itens: d.itens,
      minutos: d.minutos,
      assinatura: rota.assinatura
    }));

    const { error: erroInsercao } = await supabase.from("aluno_rota_dias").insert(linhas);
    if (erroInsercao) console.error("Rota: falha ao gravar a nova rota:", erroInsercao.message);
  } catch (e) {
    // Idem: a rota em memória já está correta e é ela que a tela usa.
    console.error("Rota: erro inesperado ao sincronizar:", e);
  }
}

/** Compara o que está gravado com a rota gerada agora. */
function precisaRegravar(atuais: LinhaRota[], rota: Rota): boolean {
  if (atuais.length !== rota.dias.length) return true;
  return rota.dias.some((d, i) => {
    const linha = atuais[i];
    return (
      !linha ||
      linha.route_day !== d.routeDay ||
      String(linha.scheduled_date).slice(0, 10) !== d.scheduledDate ||
      linha.assinatura !== rota.assinatura
    );
  });
}

/**
 * Apaga a rota do aluno. Usada no Redefinir Perfil (a função do banco já faz
 * isso dentro da transação) e sempre que o briefing deixa de existir — uma
 * rota órfã reapareceria como "cronograma fantasma" na próxima leitura.
 */
export async function limparRotaDoAluno(supabase: ClienteSupabase, alunoId: string): Promise<void> {
  const { error } = await supabase.from("aluno_rota_dias").delete().eq("aluno_id", alunoId);
  if (error) console.error("Rota: falha ao apagar a rota do aluno:", error.message);
}

/**
 * Regera a rota agora, a partir do briefing atual — usada quando o aluno
 * recalibra o voo. Escreve mesmo que a assinatura não tenha mudado, porque
 * este é o momento em que ele explicitamente pediu uma rota nova.
 */
export async function regerarRotaDoAluno(
  supabase: ClienteSupabase,
  alunoId: string,
  opcoes: {
    briefing: Parameters<typeof parametrosDoBriefing>[0];
    template: TrilhaDia[];
    hoje: string;
  }
): Promise<Rota | null> {
  const parametros = parametrosDoBriefing(opcoes.briefing, opcoes.hoje);
  if (!parametros) {
    await limparRotaDoAluno(supabase, alunoId);
    return null;
  }

  const contexto = await contextoDoAluno(supabase, alunoId, opcoes.briefing);
  const rota = gerarRota(opcoes.template, parametros, {
    ...(await contextoDaRota(supabase, alunoId)),
    ajustesDoMentor: await ajustesDoMentor(supabase, alunoId),
    contexto
  });
  if (rota.dias.length === 0) {
    await limparRotaDoAluno(supabase, alunoId);
    return null;
  }

  await aplicarQuestoesExtras(supabase, alunoId, rota, contexto);

  await limparRotaDoAluno(supabase, alunoId);
  await sincronizarRota(supabase, alunoId, rota, opcoes.template);
  return rota;
}

/** Só para conferência em testes/relatórios. */
export { assinaturaDosParametros };
