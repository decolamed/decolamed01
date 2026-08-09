import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { montarLinkWhatsapp } from "@/lib/site/whatsapp";
import { alunoTemCopiloto } from "@/lib/copiloto/permissao";
import { calcularDiaTrilha } from "@/lib/trilha/dia";
import { resolverCronograma } from "@/lib/trilha/resolver";
import { ajustarCronogramaAoAluno } from "@/lib/trilha/ajuste-voo-guiado";
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

// Antes existia aqui um `POOL_LIMITE = 60` aplicado a questões e flashcards.
//
// Era a causa de três sintomas que pareciam separados: o aluno via 60
// flashcards de 352; o Banco de Questões mostrava "Biologia — 28" quando há
// 82; e Química e Linguagens simplesmente não apareciam como matéria. Como
// o corte pegava as 60 primeiras linhas numa ordem que o Postgres não
// garante, matérias inteiras ficavam de fora e as contagens exibidas eram
// as do recorte, não as do banco.
//
// Sem corte, o payload medido é 542 kB de questões e 57 kB de flashcards
// (texto cru, antes do gzip) — cabe folgado. Se o banco crescer a alguns
// milhares de questões, a saída é paginar por matéria sob demanda, nunca
// voltar a truncar em silêncio: truncar aqui não deixa rastro nenhum na
// tela, que é o que tornou esse defeito tão difícil de enxergar.

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
    { data: configRedacao },
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
    { data: termosData },
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
    supabase.from("configuracoes").select("valor").eq("chave", "redacao.whatsapp").maybeSingle(),
    supabase.from("profiles").select("planos(creditos_redacao)").eq("id", profile.id).maybeSingle(),
    supabase.from("questoes").select("*").eq("ativo", true).order("materia").order("created_at"),
    supabase.from("flashcards").select("*").eq("ativo", true).order("ordem", { ascending: true, nullsFirst: false }),
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
    supabase.from("configuracoes").select("valor").eq("chave", "site.termos_uso_url").maybeSingle(),
    supabase.from("redacoes_creditos_ajustes").select("quantidade").eq("aluno_id", profile.id),
    supabase.from("estudos_botoes").select("*").eq("ativo", true).order("ordem")
  ]);

  const planoNome = (matricula as any)?.planos?.nome as string | undefined;
  const plano = planoNome && planoNome.toLowerCase().includes("guiado") ? "voo-guiado" : "decolando";
  const numeroWhatsapp = textoConfig(config?.valor);
  // O botão da redação leva ao WhatsApp da professora, não ao geral da
  // plataforma — eram dois números configurados e os dois botões abriam o
  // mesmo. Cai no geral só se o número da professora não estiver preenchido,
  // para o aluno nunca ficar sem canal.
  const numeroWhatsappRedacao = textoConfig(configRedacao?.valor) || numeroWhatsapp;

  // Dia de hoje no cronograma (trilha_dias) — base de estudo de TODO aluno,
  // com ou sem Copiloto.
  const acessoLiberadoEm = (matricula as any)?.acesso_liberado_em as string | undefined;
  const diaTrilhaHoje = acessoLiberadoEm ? calcularDiaTrilha(acessoLiberadoEm) : null;
  // Resolve título/URL a partir de conteudos_biblioteca antes de qualquer
  // coisa: sem isso o aluno continuaria vendo o nome e o link antigos de uma
  // aula já corrigida pelo admin em "Cursos e Aulas".
  const diasResolvidos = await resolverCronograma(
    ((trilhaDiasData as TrilhaDia[]) ?? []).sort((a, b) => a.dia_numero - b.dia_numero)
  );

  // Plano Voo Guiado: projeta o cronograma-base na janela real do aluno
  // (início → prova, só nos dias que ele estuda). Sem isto, quem tem 20 dias
  // até a prova recebia a mesma trilha de 40 dias do Plano Decolando e
  // metade do conteúdo caía depois da prova. O Decolando não é afetado — ver
  // lib/trilha/ajuste-voo-guiado.ts.
  const { dias: todosDias, compactado: cronogramaCompactado } = ajustarCronogramaAoAluno(diasResolvidos, {
    temCopiloto,
    briefing: briefingData as Parameters<typeof ajustarCronogramaAoAluno>[1]["briefing"],
    hojeStr
  });
  const trilhaHoje = diaTrilhaHoje ? todosDias.find((d) => d.dia_numero === diaTrilhaHoje) ?? null : null;
  // Próximos dias do cronograma (limite de 7 pra não inflar o payload do
  // Client Component) — alimenta a seção "Próximos dias" da tela de
  // cronograma, que antes só listava missões do Copiloto.
  // TODOS os dias seguintes, sem corte. O limite de 7 fazia o aluno ver um
  // pedaço do cronograma em "Ver cronograma completo" — o painel do admin é
  // a fonte oficial, e se ele cadastrou 40 dias o aluno precisa ver os 40.
  const trilhaProximos = diaTrilhaHoje ? todosDias.filter((d) => d.dia_numero > diaTrilhaHoje) : [];
  // Dias já vencidos ficam disponíveis para consulta e para o aluno concluir
  // o que ficou para trás — sumir com eles é o que dava a impressão de que o
  // cronograma "perdia" dias.
  const trilhaAnteriores = diaTrilhaHoje ? todosDias.filter((d) => d.dia_numero < diaTrilhaHoje) : [];

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
      whatsappRedacao={montarLinkWhatsapp(numeroWhatsappRedacao, "Olá! Quero enviar minha redação ✍")}
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
        trilhaAnteriores,
        // O cronograma-base foi projetado na janela real deste aluno (Voo
        // Guiado com menos dias até a prova do que a trilha tem). A tela usa
        // isto para explicar por que os dias vêm agrupados, em vez de deixar
        // o aluno achando que perdeu conteúdo.
        cronogramaCompactado,
        // dia_numero de hoje: é o que permite converter a régua relativa do
        // cronograma ("Dia 1", "Dia 2") em datas de calendário na tela.
        diaTrilhaHoje,
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
        termosUsoUrl: textoConfig(termosData?.valor) || null,
        nomeVestibular,
        materias,
        hojeStr
      }}
    />
  );
}
