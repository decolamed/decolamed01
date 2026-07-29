import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { montarLinkWhatsapp } from "@/lib/site/whatsapp";
import { alunoTemCopiloto } from "@/lib/copiloto/permissao";
import { calcularDiaTrilha } from "@/lib/trilha/dia";
import { getNomeVestibular } from "@/lib/site/marca";
import { getMateriasDoConteudo } from "@/lib/site/materias";
import { hojeISO, somarDias } from "@/lib/site/data";
import { textoConfig } from "@/lib/site/configuracoes";
import DecolaApp from "./decola-app";
import type {
  Questao,
  Flashcard,
  Simulado,
  SimuladoTentativa,
  MateriaPeso,
  RankingLinha,
  AlunoMissao,
  TrilhaDia,
  AlunoProgressoItem,
  EstudosBotao,
  CopilotoRecomendacao,
  Notificacao,
  AlunoBriefing,
  Banner,
  ConteudoBiblioteca,
  LinkExterno,
  ImagemQuestao
} from "@/types/database";

const POOL_LIMITE = 60;

export default async function AlunoHomePage() {
  // Camada 2 de proteção (a camada 1 é o middleware): garante que mesmo que
  // a rota seja alcançada por algum outro caminho, o conteúdo só renderiza
  // para quem tem matrícula ativa e dentro do prazo.
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const [temCopiloto, nomeVestibular, materias] = await Promise.all([
    alunoTemCopiloto(profile.id),
    getNomeVestibular(),
    getMateriasDoConteudo()
  ]);

  // Datas no fuso da plataforma (lib/site/data.ts). Em UTC, das 21h à
  // meia-noite `hojeStr` já era o dia seguinte e as missões de hoje
  // desapareciam da tela do aluno.
  const hojeStr = hojeISO();
  const fim7Str = somarDias(hojeStr, 7);
  const inicio7Str = somarDias(hojeStr, -7);

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
    { data: trilhaDiasData },
    { data: progressoItensData },
    { data: recomendacoesData },
    { data: notificacoesData },
    { data: briefingData },
    { data: creditosConsumidosData },
    { data: bannersData },
    { data: conteudosData },
    { data: linksData },
    { data: baseTemasData },
    { data: ajustesCreditosData },
    { data: estudosBotoesData }
  ] = await Promise.all([
    supabase
      .from("matriculas")
      .select("planos(nome), acesso_liberado_em")
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
    supabase.from("simulado_questoes").select("simulado_id, ordem, questoes(id, enunciado, alternativas, materia, assunto, imagens)").order("ordem"),
    supabase
      .from("simulado_tentativas")
      .select("*")
      .eq("aluno_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase.from("ranking_geral").select("*"),
    supabase.from("respostas_aluno").select("correta, created_at, questoes(materia, assunto)").eq("aluno_id", profile.id),
    supabase.from("flashcard_revisoes").select("lembrou, created_at").eq("aluno_id", profile.id),
    supabase.from("materias_peso").select("*"),
    // Missões individuais (Copiloto ou cadastradas à mão pelo admin em
    // /admin/usuarios/[id]). Elas SOMAM ao cronograma (trilha_dias), não o
    // substituem — ver scrPlano() em decola-app.tsx.
    supabase
      .from("aluno_missoes")
      .select("*")
      .eq("aluno_id", profile.id)
      .gte("data", inicio7Str)
      .lte("data", fim7Str)
      .order("data")
      .order("prioridade", { ascending: false }),
    // Tabela pequena e mantida pelo admin (dezenas de linhas) — mais simples
    // trazer todas e escolher o dia de hoje em código do que encadear uma
    // segunda consulta dependente de matricula.acesso_liberado_em (que só
    // sai deste mesmo Promise.all).
    supabase.from("trilha_dias").select("*"),
    supabase.from("aluno_progresso_itens").select("*").eq("aluno_id", profile.id),
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
    supabase.from("banners").select("*").eq("ativo", true).order("ordem"),
    supabase.from("conteudos_biblioteca").select("*").eq("ativo", true).order("created_at", { ascending: false }),
    supabase.from("links_externos").select("*").eq("ativo", true).order("ordem"),
    supabase.from("configuracoes").select("valor").eq("chave", "redacao.base_temas_url").maybeSingle(),
    supabase.from("redacoes_creditos_ajustes").select("quantidade").eq("aluno_id", profile.id),
    supabase.from("estudos_botoes").select("*").eq("ativo", true).order("ordem")
  ]);

  const planoNome = (matricula as any)?.planos?.nome as string | undefined;
  const plano = planoNome && planoNome.toLowerCase().includes("guiado") ? "voo-guiado" : "decolando";
  const numeroWhatsapp = textoConfig(config?.valor);

  // Dia de hoje no cronograma (trilha_dias) — base de estudo de TODO aluno,
  // com ou sem Copiloto.
  const acessoLiberadoEm = (matricula as any)?.acesso_liberado_em as string | undefined;
  const diaTrilhaHoje = acessoLiberadoEm ? calcularDiaTrilha(acessoLiberadoEm) : null;
  const todosDias = ((trilhaDiasData as TrilhaDia[]) ?? []).sort((a, b) => a.dia_numero - b.dia_numero);
  const trilhaHoje = diaTrilhaHoje ? todosDias.find((d) => d.dia_numero === diaTrilhaHoje) ?? null : null;
  // Próximos dias do cronograma (limite de 7 pra não inflar o payload do
  // Client Component) — alimenta a seção "Próximos dias" da tela de
  // cronograma, que antes só listava missões do Copiloto.
  const trilhaProximos = diaTrilhaHoje ? todosDias.filter((d) => d.dia_numero > diaTrilhaHoje).slice(0, 7) : [];

  // Aulas/PDFs/links pendurados nos dias do cronograma. Todo o material
  // importado vive aqui (trilha_dias.itens), não em conteudos_biblioteca —
  // por isso a aba Estudos anunciava "0 aulas" mesmo com o cronograma
  // cheio. Só a URL e o título viajam pro cliente; o resto do dia não.
  const TIPOS_BIBLIOTECA = new Set(["aula", "pdf", "link"]);
  const conteudosTrilha = todosDias.flatMap((d) =>
    (d.itens ?? [])
      .filter((i) => TIPOS_BIBLIOTECA.has(i.tipo) && !!i.url)
      .map((i) => ({
        tipo: i.tipo as "aula" | "pdf" | "link",
        ref_id: i.ref_id,
        url: i.url as string,
        titulo: i.titulo,
        materia: i.materia
      }))
  );

  const creditosDoPlano = (perfilComPlano as any)?.planos?.creditos_redacao ?? 0;
  const ajustesManuais = (ajustesCreditosData ?? []).reduce((soma: number, a: any) => soma + a.quantidade, 0);
  const creditosTotais = creditosDoPlano + ajustesManuais;
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
        simuladoQuestoes: (simuladoQuestoesData ?? []).reduce((acc: Record<string, { id: string; enunciado: string; alternativas: { id: string; texto: string }[]; materia: string; assunto: string | null; imagens: ImagemQuestao[] }[]>, r: any) => {
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
        trilhaHoje,
        trilhaProximos,
        progressoItens: ((progressoItensData as AlunoProgressoItem[]) ?? []).reduce(
          (acc: Record<string, AlunoProgressoItem>, p) => {
            acc[p.chave] = p;
            return acc;
          },
          {}
        ),
        recomendacoes: (recomendacoesData as CopilotoRecomendacao[]) ?? [],
        notificacoes: (notificacoesData as Notificacao[]) ?? [],
        briefing: (briefingData as AlunoBriefing | null) ?? null,
        creditosRedacaoDisponiveis: Math.max(0, creditosTotais - creditosConsumidos),
        creditosRedacaoTotais: creditosTotais,
        creditosRedacaoConsumidos: creditosConsumidos,
        banners: (bannersData as Banner[]) ?? [],
        conteudos: (conteudosData as ConteudoBiblioteca[]) ?? [],
        linksExternos: (linksData as LinkExterno[]) ?? [],
        conteudosTrilha,
        estudosBotoes: (estudosBotoesData as EstudosBotao[]) ?? [],
        baseTemasUrl: textoConfig(baseTemasData?.valor) || null,
        nomeVestibular,
        materias,
        hojeStr
      }}
    />
  );
}
