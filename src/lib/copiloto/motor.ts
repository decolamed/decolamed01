import { createAdminClient } from "@/lib/supabase/server";

/**
 * Copiloto — Fase 11a: motor de gatilhos (sem IA ainda).
 *
 * Roda em tempo real depois de cada ação do aluno (responder questão,
 * revisar flashcard, terminar simulado). Analisa os últimos dados,
 * checa uma lista de gatilhos e cria recomendações quando algo importante
 * dispara.
 *
 * Cada gatilho é uma função pequena e isolada — fácil adicionar mais no
 * futuro sem quebrar os existentes. A ordem NÃO importa; cada um age
 * independentemente.
 *
 * Regras de segurança:
 *  - Usa createAdminClient (RLS não bloqueia leituras/escritas)
 *  - Dedup pesado: cada gatilho checa se já existe recomendação PENDENTE
 *    do mesmo tipo/matéria/assunto antes de criar outra igual (senão o
 *    aluno seria bombardeado toda vez que respondesse algo)
 *  - Todas as consultas escopadas por aluno_id — nunca "vaza" pra outros
 */

interface ContextoAluno {
  alunoId: string;
  // Se algum gatilho quiser saber o que acabou de acontecer
  ultimaAcao?: "questao" | "flashcard" | "simulado";
}

// -------- gatilho 1: 3 questões erradas seguidas num mesmo assunto --------
async function gatilhoErrosSeguidosAssunto(ctx: ContextoAluno) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("respostas_aluno")
    .select("correta, created_at, questoes(materia, assunto)")
    .eq("aluno_id", ctx.alunoId)
    .order("created_at", { ascending: false })
    .limit(10);

  const respostas = (data ?? []) as any[];
  if (respostas.length < 3) return;

  // Verifica as 3 mais recentes num MESMO assunto
  const primeiroAssunto = respostas[0]?.questoes?.assunto;
  const primeiraMateria = respostas[0]?.questoes?.materia;
  if (!primeiroAssunto || !primeiraMateria) return;

  const tresRecentesDoAssunto = respostas
    .filter((r) => r.questoes?.assunto === primeiroAssunto)
    .slice(0, 3);

  if (tresRecentesDoAssunto.length < 3) return;
  if (!tresRecentesDoAssunto.every((r) => !r.correta)) return;

  await criarRecomendacaoDeduplicada(ctx.alunoId, {
    tipo: "questoes",
    materia: primeiraMateria,
    assunto: primeiroAssunto,
    titulo: `Revisar ${primeiroAssunto}`,
    motivo: `Você errou 3 questões seguidas em ${primeiroAssunto} — vale a pena rever esse assunto.`,
    prioridade: 2
  });
  await registrarEvento(ctx.alunoId, "erros_seguidos_assunto", primeiraMateria, primeiroAssunto);
}

// -------- gatilho 2: precisão abaixo de 50% numa matéria (após 10+ tentativas) --------
async function gatilhoPrecisaoBaixaMateria(ctx: ContextoAluno) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("respostas_aluno")
    .select("correta, questoes(materia)")
    .eq("aluno_id", ctx.alunoId);

  const respostas = (data ?? []) as any[];
  const porMateria = new Map<string, { acertos: number; total: number }>();
  respostas.forEach((r) => {
    const m = r.questoes?.materia;
    if (!m) return;
    const atual = porMateria.get(m) ?? { acertos: 0, total: 0 };
    atual.total += 1;
    if (r.correta) atual.acertos += 1;
    porMateria.set(m, atual);
  });

  for (const [materia, dados] of porMateria) {
    if (dados.total < 10) continue;
    const precisao = (dados.acertos / dados.total) * 100;
    if (precisao >= 50) continue;

    // Levanta o peso da matéria pra decidir prioridade (maior peso = urgente)
    const { data: pesoRow } = await supabase.from("materias_peso").select("peso").eq("materia", materia).maybeSingle();
    const peso = pesoRow?.peso ?? 1;
    const prioridade = peso >= 2 ? 3 : peso >= 1.5 ? 2 : 1;

    await criarRecomendacaoDeduplicada(ctx.alunoId, {
      tipo: "flashcards",
      materia,
      assunto: null,
      titulo: `Reforçar ${materia}`,
      motivo: `Sua precisão em ${materia} está abaixo de 50% (${dados.acertos}/${dados.total} acertos). Revisar flashcards ajuda a fixar.`,
      prioridade
    });
    await registrarEvento(ctx.alunoId, "precisao_baixa_materia", materia, null, {
      precisao: Math.round(precisao),
      total: dados.total
    });
  }
}

// -------- gatilho 3: simulado com nota abaixo de 60% --------
async function gatilhoSimuladoNotaBaixa(ctx: ContextoAluno) {
  if (ctx.ultimaAcao !== "simulado") return;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("simulado_tentativas")
    .select("nota, simulado_id, simulados(titulo)")
    .eq("aluno_id", ctx.alunoId)
    .order("created_at", { ascending: false })
    .limit(1);

  const ultima = (data ?? [])[0] as any;
  if (!ultima || ultima.nota >= 60) return;

  await criarRecomendacaoDeduplicada(ctx.alunoId, {
    tipo: "simulado",
    materia: "Geral",
    assunto: null,
    titulo: `Refazer com foco no que errou`,
    motivo: `Você tirou ${Math.round(ultima.nota)}% em "${ultima.simulados?.titulo ?? "seu último simulado"}". Revisar o gabarito e refazer os erros costuma dar salto grande na próxima tentativa.`,
    prioridade: 2
  });
  await registrarEvento(ctx.alunoId, "simulado_nota_baixa", null, null, { nota: ultima.nota });
}

// -------- gatilho 4: flashcard esquecido 2 vezes seguidas --------
async function gatilhoFlashcardEsquecido(ctx: ContextoAluno) {
  if (ctx.ultimaAcao !== "flashcard") return;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("flashcard_revisoes")
    .select("lembrou, flashcards(materia, assunto)")
    .eq("aluno_id", ctx.alunoId)
    .order("created_at", { ascending: false })
    .limit(2);

  const revisoes = (data ?? []) as any[];
  if (revisoes.length < 2) return;
  if (revisoes.some((r) => r.lembrou)) return;
  const materia = revisoes[0].flashcards?.materia;
  const assunto = revisoes[0].flashcards?.assunto;
  if (!materia) return;

  await criarRecomendacaoDeduplicada(ctx.alunoId, {
    tipo: "flashcards",
    materia,
    assunto,
    titulo: `Reforçar ${assunto ?? materia}`,
    motivo: `Você esqueceu 2 flashcards seguidos de ${assunto ?? materia}. Vale insistir mais um pouco nesse tema.`,
    prioridade: 1
  });
  await registrarEvento(ctx.alunoId, "flashcard_esquecido_repetido", materia, assunto);
}

// ============================================================================
// Utilidades compartilhadas
// ============================================================================

interface NovaRecomendacao {
  tipo: "questoes" | "flashcards" | "aula" | "simulado";
  materia: string;
  assunto: string | null;
  titulo: string;
  motivo: string;
  prioridade: number;
}

async function criarRecomendacaoDeduplicada(alunoId: string, rec: NovaRecomendacao) {
  const supabase = createAdminClient();
  // Se já tem UMA recomendação pendente do mesmo tipo+matéria+assunto, não
  // cria outra igual — evita spam quando o gatilho continuar disparando.
  let query = supabase
    .from("copiloto_recomendacoes")
    .select("id")
    .eq("aluno_id", alunoId)
    .eq("status", "pendente")
    .eq("tipo", rec.tipo)
    .eq("materia", rec.materia);
  if (rec.assunto) query = query.eq("assunto", rec.assunto);
  const { data: existente } = await query.maybeSingle();
  if (existente) return;

  await supabase.from("copiloto_recomendacoes").insert({
    aluno_id: alunoId,
    ...rec,
    fonte: "gatilho"
  });
}

async function registrarEvento(
  alunoId: string,
  gatilho: string,
  materia: string | null,
  assunto: string | null,
  detalhes: Record<string, unknown> = {}
) {
  const supabase = createAdminClient();
  await supabase.from("copiloto_eventos").insert({
    aluno_id: alunoId,
    gatilho,
    materia,
    assunto,
    detalhes
  });
}

// ============================================================================
// Ponto de entrada — chamado após cada ação do aluno
// ============================================================================

/**
 * Roda todos os gatilhos em paralelo. Erros em um NÃO impedem os outros —
 * o Copiloto nunca deve travar a experiência principal do aluno. Se falhar,
 * só loga e segue.
 */
export async function rodarCopiloto(ctx: ContextoAluno) {
  const gatilhos = [
    gatilhoErrosSeguidosAssunto,
    gatilhoPrecisaoBaixaMateria,
    gatilhoSimuladoNotaBaixa,
    gatilhoFlashcardEsquecido
  ];

  await Promise.allSettled(
    gatilhos.map(async (g) => {
      try {
        await g(ctx);
      } catch (e) {
        console.error(`[copiloto] gatilho falhou:`, e);
      }
    })
  );
}
