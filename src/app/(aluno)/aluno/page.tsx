import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { montarLinkWhatsapp } from "@/lib/site/whatsapp";
import { alunoTemCopiloto, planoDoAluno } from "@/lib/copiloto/permissao";
import { diaDoDecolando, chavesConcluidas } from "@/lib/trilha/decolando";
import { resolverCronograma } from "@/lib/trilha/resolver";
import { cronogramaDeTela, datasDaRota, diaAtualDaRota } from "@/lib/trilha/rota";
import { rotaDoAluno } from "@/lib/trilha/rota-persistencia";
import { filtrarPorIdioma, normalizarIdioma, textoAdaptadoAoIdioma } from "@/lib/site/idioma-aluno";
import { getNomeVestibular } from "@/lib/site/marca";
import { getMateriasDoConteudo } from "@/lib/site/materias";
import { hojeISO, somarDias } from "@/lib/site/data";
import { textoConfig } from "@/lib/site/configuracoes";
import { CHAVES_DOS_RESUMOS, lerLinksDosResumos } from "@/lib/site/resumos-livros";
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

// Mensagem que já vem digitada quando o aluno abre o WhatsApp pelo botão
// "Comunicar erro". Ele completa o texto antes de enviar. O NÚMERO não está
// aqui — vem de `configuracoes.site.contato.whatsapp`, para trocar no admin
// e valer na hora.
const MENSAGEM_RELATO_ERRO = "Reportar erro";

export default async function AlunoHomePage({
  searchParams
}: {
  // `?aula=<id>` abre uma videoaula direto no player ao carregar. É o que
  // permite a revisão em vídeo do Copiloto levar à AULA, e não a uma lista.
  // "Estudos" é uma tela dentro do app (um Client Component), não uma rota
  // do Next — não existe `/aluno/estudos` para onde apontar.
  searchParams?: { aula?: string };
}) {
  // Camada 2 de proteção (a camada 1 é o middleware): garante que mesmo que
  // a rota seja alcançada por algum outro caminho, o conteúdo só renderiza
  // para quem tem matrícula ativa e dentro do prazo.
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const [temCopiloto, cursoDoAluno, nomeVestibular, materias] = await Promise.all([
    alunoTemCopiloto(profile.id),
    planoDoAluno(profile.id),
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
    { data: resumosLivrosData },
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
    // Os quatro resumos de livro. Os itens do cronograma já saem resolvidos
    // de `resolverCronograma`; o mapa vai junto para os caminhos que não
    // passam por lá (missão de leitura remarcada pelo Copiloto).
    supabase.from("configuracoes").select("chave, valor").in("chave", CHAVES_DOS_RESUMOS),
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

  // Idioma escolhido no briefing. Governa tudo que é de língua estrangeira
  // daqui pra baixo: acervo, cronograma e textos.
  const idiomaAluno = normalizarIdioma((briefingData as { idioma_prova?: string | null } | null)?.idioma_prova);

  // Resolve título/URL a partir de conteudos_biblioteca antes de qualquer
  // coisa: sem isso o aluno continuaria vendo o nome e o link antigos de uma
  // aula já corrigida pelo admin em "Cursos e Aulas".
  const diasResolvidos = await resolverCronograma(
    ((trilhaDiasData as TrilhaDia[]) ?? []).sort((a, b) => a.dia_numero - b.dia_numero)
  );

  // ---- A rota do aluno (Voo Guiado) -----------------------------------
  //
  // Aqui estava a raiz de quase todo defeito do cronograma. O "dia de hoje"
  // vinha de `calcularDiaTrilha(matricula.acesso_liberado_em)` — dias desde a
  // MATRÍCULA. Quem se matriculou 21 dias antes de começar caía no dia 22 do
  // template: 21 "dias anteriores" que nunca existiram, cartão escrito
  // "Dia 22" no segundo dia de estudo, e a data do dia 1 recuando para
  // 22/07 num cronograma que começa em 12/08.
  //
  // Agora o template é só fonte de conteúdo. A régua do aluno é a ROTA,
  // gerada do briefing (início informado, prova, dias da semana, horas por
  // dia) e persistida em `aluno_rota_dias` — ver lib/trilha/rota.ts.
  //
  // O Plano Decolando continua no template linear de 40 dias ancorado na
  // matrícula: é o que esse plano promete, e ele não tem briefing.
  const rota = await rotaDoAluno(supabase, profile.id, {
    temCopiloto,
    briefing: briefingData as Parameters<typeof rotaDoAluno>[2]["briefing"],
    template: diasResolvidos,
    hoje: hojeStr
  });

  // Voo Guiado ainda sem briefing = o mentor não montou o cronograma dele.
  // O briefing inicial passou a ser preenchido pelo mentor no painel, depois
  // da mentoria; até lá este aluno NÃO recebe o template linear de 40 dias.
  // Sem isto ele veria o cronograma genérico do Decolando como se fosse o
  // plano personalizado dele — pior do que ver a tela de espera.
  //
  // O Decolando não entra nesta condição: `temCopiloto` é falso para ele, e
  // ele segue no template de sempre, ancorado na matrícula.
  const aguardandoMentor = temCopiloto && !briefingData;
  const diasAjustados = aguardandoMentor ? [] : rota ? cronogramaDeTela(rota) : diasResolvidos;
  // Datas reais de cada dia. Com rota, vêm decididas na geração; sem rota, a
  // tela segue extrapolando a partir do dia de hoje (Plano Decolando).
  const datasDoCronograma = rota ? datasDaRota(rota) : null;
  // A rota já cabe na janela por construção; o aviso de agrupamento só faz
  // sentido quando ela é de fato menor que o template.
  const cronogramaCompactado = rota ? rota.dias.length < diasResolvidos.length : false;

  // Personalização por idioma no cronograma (item 15.4). O cronograma-base é
  // o mesmo para todos e traz itens genéricos como "5 questões de
  // Inglês/Espanhol": aqui o item some para quem não faz aquele idioma, e o
  // texto genérico passa a citar só o idioma do aluno — o rótulo acompanha o
  // conteúdo que ele de fato vai abrir.
  const todosDias = idiomaAluno
    ? diasAjustados.map((dia) => ({
        ...dia,
        itens: filtrarPorIdioma(dia.itens ?? [], idiomaAluno).map((item) => ({
          ...item,
          titulo: textoAdaptadoAoIdioma(item.titulo, idiomaAluno)
        }))
      }))
    : diasAjustados;

  // FONTE ÚNICA DE VERDADE do "dia de hoje". Com rota, quem decide é
  // `diaAtualDaRota()` — a mesma função que a tela de cronograma usa, para
  // as duas nunca mais discordarem. Sem rota, o cálculo antigo pela data de
  // matrícula, que é o correto para o Plano Decolando.
  //
  // No Decolando quem decide é a CONCLUSÃO, não a data. Era
  // `calcularDiaTrilha(acesso_liberado_em)` — dias corridos desde a matrícula
  // —, e por isso quem sumia duas semanas voltava quatorze dias à frente, com
  // blocos "anteriores" que nunca abriu; passados 40 dias de matrícula não
  // havia bloco nenhum, porque `dia_numero` 41 não existe. O plano vende um
  // conteúdo fixo, não uma assinatura de rotina: o cronograma espera o aluno.
  // Ver lib/trilha/decolando.ts.
  const diaTrilhaHoje = rota
    ? diaAtualDaRota(rota.dias, hojeStr)?.routeDay ?? null
    : diaDoDecolando(todosDias, chavesConcluidas(progressoItensData as AlunoProgressoItem[]));

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
      whatsappErro={montarLinkWhatsapp(numeroWhatsapp, MENSAGEM_RELATO_ERRO)}
      abrirAulaId={searchParams?.aula ?? null}
      dados={{
        temCopiloto,
        // Voo Guiado esperando o mentor montar o cronograma inicial.
        aguardandoMentor,
        // Filtrados pelo idioma escolhido no briefing: quem faz Inglês não
        // recebe questão nem flashcard de Espanhol em lugar nenhum do app.
        // Quem ainda não respondeu continua vendo os dois — ver
        // lib/site/idioma-aluno.ts.
        questoes: filtrarPorIdioma((questoesData as Questao[]) ?? [], idiomaAluno),
        flashcards: filtrarPorIdioma((flashcardsData as Flashcard[]) ?? [], idiomaAluno),
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
        // Posição do aluno na própria rota (1..N), não o número do template.
        diaTrilhaHoje,
        // Data real de cada dia da rota. Quando existe, a tela LÊ a data em
        // vez de extrapolar `hoje ± diferença` — era a extrapolação que fazia
        // o dia 1 cair em julho num cronograma que começa em agosto.
        datasDoCronograma,
        // Quantos dias de ESTUDO a rota tem ("Dia 2 de 19"). O dia da prova
        // não entra na contagem: ele fecha a rota, não é um dia de estudo.
        totalDiasCronograma: todosDias.filter((d) => (d as { tipo_rota?: string }).tipo_rota !== "prova").length,
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
        // Materiais da Tela de Estudo destinados a este curso. `plano_id`
        // nulo = todos os cursos, que é como todo material cadastrado antes
        // desta regra continua se comportando. A RLS já aplica o mesmo corte
        // no banco; aqui é a mesma regra, escrita onde a tela lê.
        estudosBotoes: ((estudosBotoesData as EstudosBotao[]) ?? []).filter(
          (b) => !b.plano_id || b.plano_id === cursoDoAluno
        ),
        baseTemasUrl: textoConfig(baseTemasData?.valor) || null,
        termosUsoUrl: textoConfig(termosData?.valor) || null,
        linksDosResumos: lerLinksDosResumos(resumosLivrosData as { chave: string; valor: unknown }[]),
        nomeVestibular,
        materias,
        hojeStr
      }}
    />
  );
}
