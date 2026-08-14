import { requirePreviewAluno } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { getNomeVestibular } from "@/lib/site/marca";
import { getMateriasDoConteudo } from "@/lib/site/materias";
import { hojeISO } from "@/lib/site/data";
import { textoConfig } from "@/lib/site/configuracoes";
import { CHAVES_DOS_RESUMOS, lerLinksDosResumos } from "@/lib/site/resumos-livros";
import DecolaApp from "@/app/(aluno)/aluno/decola-app";
import type { Questao, Flashcard, Simulado, Banner, ConteudoBiblioteca, LinkExterno, ImagemQuestao } from "@/types/database";


// Vitrine somente-leitura do app do aluno — usada pelo botão "Ver app do
// aluno" do admin e "Demonstração grátis" do parceiro. Mostra conteúdo real
// (questões, flashcards, simulados, banners, aulas/pdfs/links do admin),
// mas nenhum dado pessoal de aluno (sem matrícula/progresso/notificações) —
// quem está vendo não é um aluno de verdade. decola-app.tsx recebe
// demoMode=true e evita qualquer gravação real (ver resultadoDemo() e os
// vários `if (!this.props.demoMode)` espalhados no componente).
export default async function PreviewAlunoPage() {
  const profile = await requirePreviewAluno();
  const supabase = createAdminClient();
  const [nomeVestibular, materias] = await Promise.all([getNomeVestibular(), getMateriasDoConteudo()]);

  const [
    { data: questoesData },
    { data: flashcardsData },
    { data: simuladosData },
    { data: simuladoQuestoesData },
    { data: bannersData },
    { data: conteudosData },
    { data: linksData },
    { data: baseTemasData },
    { data: resumosLivrosData }
  ] = await Promise.all([
    // Sem teto: a vitrine precisa mostrar o mesmo acervo que o aluno vê.
    // Um corte aqui faria o admin conferir uma versão reduzida da própria
    // plataforma e concluir que faltam questões (ver o comentário em
    // (aluno)/aluno/page.tsx).
    supabase.from("questoes").select("*").eq("ativo", true).order("materia").order("created_at"),
    supabase.from("flashcards").select("*").eq("ativo", true).order("ordem", { ascending: true, nullsFirst: false }),
    supabase.from("simulados").select("*").eq("ativo", true),
    supabase.from("simulado_questoes").select("simulado_id, ordem, questoes(id, enunciado, alternativas, materia, assunto, imagens)").order("ordem"),
    supabase.from("banners").select("*").eq("ativo", true).order("ordem"),
    supabase.from("conteudos_biblioteca").select("*").eq("ativo", true).order("created_at", { ascending: false }),
    supabase.from("links_externos").select("*").eq("ativo", true).order("ordem"),
    supabase.from("configuracoes").select("valor").eq("chave", "redacao.base_temas_url").maybeSingle(),
    // A vitrine usa os mesmos links de resumo que o aluno: um endereço
    // diferente aqui daria ao admin a impressão de que o cadastro não pegou.
    supabase.from("configuracoes").select("chave, valor").in("chave", CHAVES_DOS_RESUMOS)
  ]);

  return (
    <DecolaApp
      alunoId={profile.id}
      nome={profile.nome}
      email={profile.email}
      plano="voo-guiado"
      whatsappSuporte="#"
      whatsappRedacao="#"
      whatsappErro="#"
      demoMode
      dados={{
        temCopiloto: true,
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
        tentativas: [],
        ranking: [],
        respostas: [],
        revisoes: [],
        pesos: [],
        missoes: [],
        trilhaHoje: null,
        trilhaProximos: [],
        diaTrilhaHoje: null,
        trilhaAnteriores: [],
        progressoItens: {},
        recomendacoes: [],
        notificacoes: [],
        briefing: null,
        creditosRedacaoDisponiveis: 0,
        creditosRedacaoTotais: 0,
        creditosRedacaoConsumidos: 0,
        banners: (bannersData as Banner[]) ?? [],
        conteudos: (conteudosData as ConteudoBiblioteca[]) ?? [],
        linksExternos: (linksData as LinkExterno[]) ?? [],
        conteudosTrilha: [],
        estudosBotoes: [],
        baseTemasUrl: textoConfig(baseTemasData?.valor) || null,
        termosUsoUrl: null,
        linksDosResumos: lerLinksDosResumos(resumosLivrosData as { chave: string; valor: unknown }[]),
        nomeVestibular,
        materias,
        hojeStr: hojeISO()
      }}
    />
  );
}
