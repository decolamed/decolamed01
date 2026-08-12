import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { porAfinidadeDeAssunto } from "@/lib/site/assunto";
import { PaginaAluno, CartaoAluno } from "@/components/aluno/pagina-aluno";
import { FlashcardsStudy } from "@/components/aluno/flashcards-study";
import type { Flashcard } from "@/types/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// REVISÃO DO COPILOTO — destino contextual
//
// O botão "FAZER AGORA" de uma recomendação levava a um destino escolhido só
// pelo TIPO, sem nunca olhar a matéria nem o assunto:
//
//   flashcards → /aluno/flashcards  (o hub: "Todos · 389 cards")
//   questoes   → banco inteiro, sem filtro de matéria
//   aula       → a aba Estudos
//
// O contexto do erro — matéria, assunto, questão que originou — existia na
// recomendação e era descartado no clique. Esta rota usa esse contexto: abre
// os flashcards DAQUELE assunto, ou a vídeo-aula que o Copiloto encontrou
// para ele.
//
// Quando não há material do assunto, a revisão diz isso. Nunca cai no acervo
// completo — mostrar 389 cards a quem errou Oxirredução é pior do que
// admitir que não há material específico.
// ============================================================================

const CARDS_POR_REVISAO = 15;

export default async function RevisaoPage({ params }: { params: { id: string } }) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { data: rec } = await supabase
    .from("copiloto_recomendacoes")
    .select("id, tipo, materia, assunto, titulo, motivo, payload")
    .eq("id", params.id)
    .eq("aluno_id", profile.id)
    .maybeSingle();

  if (!rec) notFound();

  const materia = (rec.materia as string) ?? "";
  const assunto = (rec.assunto as string | null) ?? null;
  const payload = (rec.payload as Record<string, unknown>) ?? {};
  const contexto = assunto ? `${materia} · ${assunto}` : materia;

  // ---- Revisão em vídeo -------------------------------------------------
  // O Copiloto grava a aula encontrada em `conteudos_biblioteca` e guarda o
  // id no payload. Antes esse id não era lido por tela nenhuma: o vídeo era
  // buscado, validado, salvo — e nunca chegava ao aluno.
  const videoId = typeof payload.video_conteudo_id === "string" ? payload.video_conteudo_id : null;
  if (rec.tipo === "aula" && videoId) {
    const { data: video } = await supabase
      .from("conteudos_biblioteca")
      .select("id, titulo, url, materia, assunto")
      .eq("id", videoId)
      .eq("ativo", true)
      .maybeSingle();

    if (video?.url) {
      return (
        <PaginaAluno titulo={rec.titulo as string} descricao={contexto} voltarPara="/aluno" rotuloVoltar="Voltar ao painel">
          <CartaoAluno className="p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-navy-dark/45">Aula em vídeo</p>
            <p className="mt-1 font-display text-lg font-bold text-navy-dark">{video.titulo}</p>
            {rec.motivo && <p className="mt-2 text-sm text-navy-dark/60">{rec.motivo as string}</p>}
            <Link
              href={`/aluno?aula=${encodeURIComponent(video.id)}`}
              className="mt-5 inline-block rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
            >
              Assistir agora
            </Link>
          </CartaoAluno>
        </PaginaAluno>
      );
    }
  }

  // ---- Revisão em questões ----------------------------------------------
  // Uma recomendação de PRATICAR não é uma revisão de flashcards. Sem isto ela
  // caía no trecho de baixo e o aluno via "ainda não há flashcards deste
  // assunto" — uma resposta sobre material que ele não tinha pedido.
  if (rec.tipo === "questoes") {
    redirect(`/aluno/questoes?materia=${encodeURIComponent(materia)}`);
  }

  // ---- Revisão em flashcards --------------------------------------------
  const { data: todos } = await supabase.from("flashcards").select("*").eq("ativo", true);
  const doAssunto = porAfinidadeDeAssunto((todos as Flashcard[]) ?? [], { materia, assunto });
  const cards = doAssunto.slice(0, CARDS_POR_REVISAO);

  if (cards.length === 0) {
    // Sem material do assunto: diz isso. O caminho para a matéria inteira
    // continua existindo, mas como uma escolha explícita do aluno — não como
    // um desvio silencioso que o sistema faz por ele.
    return (
      <PaginaAluno titulo={rec.titulo as string} descricao={contexto} voltarPara="/aluno" rotuloVoltar="Voltar ao painel">
        <CartaoAluno className="py-10 text-center">
          <span className="text-4xl">📭</span>
          <p className="mt-3 font-display text-lg font-bold text-navy-dark">
            Ainda não há flashcards deste assunto
          </p>
          <p className="mt-2 text-sm text-navy-dark/60">
            {assunto
              ? `Não encontramos flashcards sobre "${assunto}". Você pode revisar ${materia} de forma geral ou praticar questões da matéria.`
              : `Não encontramos flashcards de ${materia}.`}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href={`/aluno/questoes?materia=${encodeURIComponent(materia)}`}
              className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
            >
              Praticar questões de {materia}
            </Link>
            <Link
              href={`/aluno/flashcards?materia=${encodeURIComponent(materia)}`}
              className="rounded-full bg-navy/5 px-6 py-3 font-display font-bold text-navy-dark"
            >
              Flashcards de {materia}
            </Link>
          </div>
        </CartaoAluno>
      </PaginaAluno>
    );
  }

  return (
    <PaginaAluno
      titulo={rec.titulo as string}
      descricao={`${contexto} · ${cards.length} ${cards.length === 1 ? "card" : "cards"} deste assunto`}
      voltarPara="/aluno"
      rotuloVoltar="Voltar ao painel"
    >
      <FlashcardsStudy cards={cards} />
    </PaginaAluno>
  );
}
