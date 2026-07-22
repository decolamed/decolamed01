import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { montarLinkWhatsapp } from "@/lib/site/whatsapp";
import { alunoTemCopiloto } from "@/lib/copiloto/permissao";
import DecolaApp from "./decola-app";
import type {
  Questao,
  Flashcard,
  Simulado,
  SimuladoTentativa,
  MateriaPeso,
  RankingLinha,
  AlunoMissao,
  CronogramaDia,
  CopilotoRecomendacao,
  Notificacao,
  AlunoBriefing,
  Banner
} from "@/types/database";

const POOL_LIMITE = 60;

export default async function AlunoHomePage() {
  // Camada 2 de proteção (a camada 1 é o middleware): garante que mesmo que
  // a rota seja alcançada por algum outro caminho, o conteúdo só renderiza
  // para quem tem matrícula ativa e dentro do prazo.
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const temCopiloto = await alunoTemCopiloto(profile.id);

  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const fim7 = new Date(hoje);
  fim7.setDate(fim7.getDate() + 7);
  const fim7Str = fim7.toISOString().slice(0, 10);
  const inicio7 = new Date(hoje);
  inicio7.setDate(inicio7.getDate() - 7);
  const inicio7Str = inicio7.toISOString().slice(0, 10);

  const [
    { data: matricula },
    { data: config },
    { data: perfilComPlano },
    { data: questoesData },
    { data: flashcardsData },
    { data: simuladosData },
    { data: simuladoQuestoesData },
    { data: tentativasData },
    { data: rankingData },
    { data: respostasData },
    { data: revisoesData },
    { data: pesosData },
    { data: missoesData },
    { data: cronogramaData },
    { data: recomendacoesData },
    { data: notificacoesData },
    { data: briefingData },
    { data: creditosConsumidosData },
    { data: bannersData }
  ] = await Promise.all([
    supabase
      .from("matriculas")
      .select("planos(nome)")
      .eq("aluno_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("configuracoes").select("valor").eq("chave", "site.contato.whatsapp").maybeSingle(),
    supabase.from("profiles").select("planos(creditos_redacao)").eq("id", profile.id).maybeSingle(),
    supabase.from("questoes").select("*").eq("ativo", true).limit(POOL_LIMITE),
    supabase.from("flashcards").select("*").eq("ativo", true).limit(POOL_LIMITE),
    supabase.from("simulados").select("*").eq("ativo", true),
    // Sem resposta_correta: essas linhas viram props de um Client Component
    // (o app do aluno inteiro), e tudo que vai pra props chega ao HTML/JS do
    // navegador — a correção só acontece no servidor, em submeterSimulado().
    supabase.from("simulado_questoes").select("simulado_id, ordem, questoes(id, enunciado, alternativas, materia, assunto)").order("ordem"),
    supabase
      .from("simulado_tentativas")
      .select("*")
      .eq("aluno_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase.from("ranking_geral").select("*"),
    supabase.from("respostas_aluno").select("correta, created_at, questoes(materia, assunto)").eq("aluno_id", profile.id),
    supabase.from("flashcard_revisoes").select("lembrou, created_at").eq("aluno_id", profile.id),
    supabase.from("materias_peso").select("*"),
    temCopiloto
      ? supabase
          .from("aluno_missoes")
          .select("*")
          .eq("aluno_id", profile.id)
          .gte("data", inicio7Str)
          .lte("data", fim7Str)
          .order("data")
          .order("prioridade", { ascending: false })
      : Promise.resolve({ data: [] as AlunoMissao[] }),
    temCopiloto ? Promise.resolve({ data: [] as CronogramaDia[] }) : supabase.from("cronograma_dias").select("*"),
    supabase
      .from("copiloto_recomendacoes")
      .select("*")
      .eq("aluno_id", profile.id)
      .eq("status", "pendente")
      .order("prioridade", { ascending: false })
      .order("gerado_em", { ascending: false }),
    supabase.from("notificacoes").select("*").eq("usuario_id", profile.id).order("created_at", { ascending: false }).limit(30),
    supabase.from("aluno_briefing").select("*").eq("aluno_id", profile.id).maybeSingle(),
    supabase.from("redacoes_creditos_consumidos").select("id").eq("aluno_id", profile.id),
    supabase.from("banners").select("*").eq("ativo", true).order("ordem")
  ]);

  const planoNome = (matricula as any)?.planos?.nome as string | undefined;
  const plano = planoNome && planoNome.toLowerCase().includes("guiado") ? "voo-guiado" : "decolando";
  const numeroWhatsapp = config?.valor as string | undefined;

  const creditosTotais = (perfilComPlano as any)?.planos?.creditos_redacao ?? 0;
  const creditosConsumidos = (creditosConsumidosData ?? []).length;

  return (
    <DecolaApp
      alunoId={profile.id}
      nome={profile.nome}
      email={profile.email}
      plano={plano}
      whatsappSuporte={montarLinkWhatsapp(numeroWhatsapp, "Olá! Preciso de ajuda com a plataforma Decola Med.")}
      whatsappRedacao={montarLinkWhatsapp(numeroWhatsapp, "Olá! Quero enviar minha redação ✍")}
      dados={{
        temCopiloto,
        questoes: (questoesData as Questao[]) ?? [],
        flashcards: (flashcardsData as Flashcard[]) ?? [],
        simulados: (simuladosData as Simulado[]) ?? [],
        simuladoQuestoesCount: (simuladoQuestoesData ?? []).reduce((acc: Record<string, number>, r: any) => {
          acc[r.simulado_id] = (acc[r.simulado_id] ?? 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        simuladoQuestoes: (simuladoQuestoesData ?? []).reduce((acc: Record<string, { id: string; enunciado: string; alternativas: { id: string; texto: string }[]; materia: string; assunto: string | null }[]>, r: any) => {
          if (!r.questoes) return acc;
          (acc[r.simulado_id] ??= []).push(r.questoes);
          return acc;
        }, {}),
        tentativas: (tentativasData as SimuladoTentativa[]) ?? [],
        ranking: (rankingData as RankingLinha[]) ?? [],
        respostas: (respostasData ?? []) as unknown as { correta: boolean; created_at: string; questoes: { materia: string; assunto: string | null } | null }[],
        revisoes: (revisoesData ?? []) as { lembrou: boolean; created_at: string }[],
        pesos: (pesosData as MateriaPeso[]) ?? [],
        missoes: (missoesData as AlunoMissao[]) ?? [],
        cronograma: (cronogramaData as CronogramaDia[]) ?? [],
        recomendacoes: (recomendacoesData as CopilotoRecomendacao[]) ?? [],
        notificacoes: (notificacoesData as Notificacao[]) ?? [],
        briefing: (briefingData as AlunoBriefing | null) ?? null,
        creditosRedacaoDisponiveis: Math.max(0, creditosTotais - creditosConsumidos),
        creditosRedacaoTotais: creditosTotais,
        creditosRedacaoConsumidos: creditosConsumidos,
        banners: (bannersData as Banner[]) ?? [],
        hojeStr
      }}
    />
  );
}
