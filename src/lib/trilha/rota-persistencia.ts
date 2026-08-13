import type { TrilhaDia } from "@/types/database";
import { textoConfig } from "@/lib/site/configuracoes";
import { disponivelParaAluno } from "@/lib/site/avaliacoes";
import {
  assinaturaDosParametros,
  gerarRota,
  parametrosDoBriefing,
  type Rota,
  type SimuladoDisponivel
} from "@/lib/trilha/rota";
import { descreverViolacoes, validarRota } from "@/lib/trilha/validador-rota";
import { contextoVazio, type ContextoDoAluno } from "@/lib/trilha/prioridade";
import { chaveMateria } from "@/lib/site/materia-canonica";
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

  const rota = gerarRota(opcoes.template, parametros, {
    ...(await contextoDaRota(supabase)),
    contexto: await contextoDoAluno(supabase, alunoId, opcoes.briefing)
  });
  if (rota.dias.length === 0) return null;

  await sincronizarRota(supabase, alunoId, rota);
  return rota;
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
      supabase.from("aluno_progresso_itens").select("chave").eq("aluno_id", alunoId).eq("concluido", true)
    ]);

    const ctx = contextoVazio();

    ((pesos as { materia: string; peso: number; qtd_questoes: number }[]) ?? []).forEach((m) => {
      ctx.pesos.set(chaveMateria(m.materia), { peso: Number(m.peso) || 0, qtdQuestoes: Number(m.qtd_questoes) || 0 });
    });

    ((respostas as { correta: boolean; questoes?: { materia?: string | null } | null }[]) ?? []).forEach((r) => {
      const chave = chaveMateria(r.questoes?.materia ?? "");
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
 * Os simulados vêm em ordem fixa (data de criação, depois id) para a geração
 * continuar determinística: sem `order` explícito o Postgres não garante
 * ordem, e a mesma rota poderia apontar para simulados diferentes a cada
 * leitura.
 *
 * O nome do vestibular sai de `configuracoes` — nunca escrito no código, para
 * a plataforma servir a outro processo seletivo sem alteração de código.
 */
async function contextoDaRota(
  supabase: ClienteSupabase
): Promise<{ simulados: SimuladoDisponivel[]; nomeVestibular: string | null }> {
  const [{ data: simulados, error }, { data: vinculos }, { data: marca }] = await Promise.all([
    supabase
      .from("simulados")
      .select("id, titulo, redacao")
      .eq("ativo", true)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true }),
    supabase.from("simulado_questoes").select("simulado_id"),
    supabase.from("configuracoes").select("valor").eq("chave", "site.marca.vestibular").maybeSingle()
  ]);

  if (error) console.error("Rota: falha ao carregar simulados:", error.message);

  // Só simulados que o aluno consegue de fato abrir — a mesma regra da aba
  // Atividades. Reservar o dia para um simulado vazio mandaria o aluno para
  // uma tela sem questões justamente no dia marcado para ele fazer a prova.
  const comQuestoes = new Set(((vinculos as { simulado_id: string }[]) ?? []).map((v) => v.simulado_id));
  const utilizaveis = (((simulados as (SimuladoDisponivel & { redacao?: unknown })[]) ?? [])
    .filter((s) => disponivelParaAluno({ ativo: true, totalQuestoes: comQuestoes.has(s.id) ? 1 : 0, temRedacao: Boolean(s.redacao) }))
    .slice(0, 2));

  // `textoConfig` desembrulha os valores jsonb escapados que existem no
  // banco desde antes da padronização.
  const nome = textoConfig((marca as { valor?: unknown } | null)?.valor).trim();

  return { simulados: utilizaveis.map((s) => ({ id: s.id, titulo: s.titulo })), nomeVestibular: nome || null };
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
export async function sincronizarRota(supabase: ClienteSupabase, alunoId: string, rota: Rota): Promise<void> {
  try {
    // Portão de publicação: rota inválida não é gravada. Se a geração
    // produzir algo que viole capacidade, datas, numeração ou conteúdo, o
    // aluno continua com a rota anterior — que ao menos era executável — e o
    // problema fica registrado com o motivo exato.
    const validacao = validarRota(rota);
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

  const rota = gerarRota(opcoes.template, parametros, {
    ...(await contextoDaRota(supabase)),
    contexto: await contextoDoAluno(supabase, alunoId, opcoes.briefing)
  });
  if (rota.dias.length === 0) {
    await limparRotaDoAluno(supabase, alunoId);
    return null;
  }

  await limparRotaDoAluno(supabase, alunoId);
  await sincronizarRota(supabase, alunoId, rota);
  return rota;
}

/** Só para conferência em testes/relatórios. */
export { assinaturaDosParametros };
