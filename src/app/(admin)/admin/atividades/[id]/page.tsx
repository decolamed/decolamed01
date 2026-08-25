import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { getNomeVestibular, rotuloNotaPonderada } from "@/lib/site/marca";
import { MetadadosForm } from "./metadados-form";
import { SeletorQuestoes } from "@/components/admin/seletor-questoes";
import { carregarUsoDasQuestoes } from "@/lib/site/uso-questoes";
import { mesmaMateria, materiasUnicas } from "@/lib/site/materia-canonica";
import type { Questao, Atividade } from "@/types/database";
import { listaOuVazio } from "@/lib/supabase/resultado";

async function salvarQuestoesDaAtividade(id: string, formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const idsEscolhidos = formData.getAll("questao_id").map(String);

  // A atividade só pode conter questões da disciplina dela. Sem esta
  // checagem dava pra salvar uma atividade "Praticar · Química" cheia de
  // questão de Linguagens — o título prometia uma coisa e o aluno recebia
  // outra. A comparação é canônica (ver materia-canonica.ts) pra não
  // rejeitar por diferença só de nome.
  const { data: atividadeAtual } = await supabase
    .from("atividades")
    .select("materia")
    .eq("id", id)
    .maybeSingle();
  const materiaDaAtividade = (atividadeAtual as { materia: string | null } | null)?.materia ?? null;

  if (materiaDaAtividade && idsEscolhidos.length > 0) {
    const escolhidas = listaOuVazio(await supabase
      .from("questoes")
      .select("id, materia")
      .in("id", idsEscolhidos), "questões da atividade");

    const foraDaMateria = (escolhidas ?? []).filter(
      (q: { materia: string | null }) => !mesmaMateria(q.materia, materiaDaAtividade)
    );

    if (foraDaMateria.length > 0) {
      const outras = materiasUnicas(foraDaMateria.map((q: { materia: string | null }) => q.materia)).join(", ");
      redirect(
        `/admin/atividades/${id}?erro=${encodeURIComponent(
          `${foraDaMateria.length} questão(ões) não são de ${materiaDaAtividade} (${outras}). ` +
            `Remova essas questões ou altere a disciplina da atividade antes de salvar.`
        )}`
      );
    }
  }

  const { error: delError } = await supabase.from("atividade_questoes").delete().eq("atividade_id", id);
  if (delError) {
    redirect(`/admin/atividades/${id}?erro=${encodeURIComponent("Não foi possível salvar as questões da atividade.")}`);
  }

  if (idsEscolhidos.length > 0) {
    const linhas = idsEscolhidos.map((questaoId, index) => ({ atividade_id: id, questao_id: questaoId, ordem: index }));
    const { error: insError } = await supabase.from("atividade_questoes").insert(linhas);
    if (insError) {
      redirect(`/admin/atividades/${id}?erro=${encodeURIComponent("Não foi possível salvar as questões da atividade.")}`);
    }
  }

  revalidatePath(`/admin/atividades/${id}`);
  revalidatePath("/admin/atividades");
  redirect(`/admin/atividades/${id}?sucesso=${encodeURIComponent(`${idsEscolhidos.length} questão(ões) salva(s) na atividade.`)}`);
}

export default async function EditarAtividadePage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: atividade } = await supabase.from("atividades").select("*").eq("id", params.id).maybeSingle();
  if (!atividade) notFound();
  const a = atividade as Atividade;

  const todasQuestoes = listaOuVazio(await supabase.from("questoes").select("*").eq("ativo", true).order("materia"), "questões da atividade");
  // Quando a atividade tem disciplina definida, o seletor só oferece
  // questões dela — não adianta validar no salvar se a tela deixa o admin
  // marcar questão de outra matéria e só reclamar no fim.
  const questoes = ((todasQuestoes as Questao[]) ?? []).filter(
    (q) => !a.materia || mesmaMateria(q.materia, a.materia)
  );

  const jaSelecionadas = listaOuVazio(await supabase.from("atividade_questoes").select("questao_id").eq("atividade_id", params.id), "questões da atividade");
  const rotuloNota = rotuloNotaPonderada(await getNomeVestibular());
  const idsJaSelecionados = new Set((jaSelecionadas ?? []).map((q: any) => q.questao_id));
  const uso = await carregarUsoDasQuestoes();

  const salvarComId = salvarQuestoesDaAtividade.bind(null, params.id);

  return (
    <div>
      <a href="/admin/atividades" className="text-sm text-navy hover:underline">← Voltar para Atividades</a>
      <h1 className="mt-2 font-display text-2xl font-bold text-navy-dark">{a.titulo}</h1>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <MetadadosForm atividade={a} rotuloNota={rotuloNota} />

        <div>
          <p className="mb-2 text-sm font-semibold text-navy-dark/70">
            {a.materia
              ? `Marque quais questões fazem parte desta atividade. Só aparecem questões ativas de ${a.materia} — a disciplina definida ao lado.`
              : "Marque quais questões do banco fazem parte desta atividade. Só questões ativas aparecem aqui. Defina uma disciplina ao lado para restringir a lista."}
          </p>
          <form action={salvarComId}>
            {/* Mesmo componente usado em Simulados — a seleção de questões é
                a mesma tarefa nos dois módulos (Alteração 4.3). */}
            <div className="overflow-hidden rounded-2xl shadow">
              <SeletorQuestoes
                questoes={questoes}
                jaSelecionadas={idsJaSelecionados}
                uso={uso}
                contextoAtual={a.titulo}
              />
            </div>
            {questoes.length > 0 && (
              <SubmitButton pendingText="Salvando..." className="mt-4 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark">
                Salvar seleção
              </SubmitButton>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
