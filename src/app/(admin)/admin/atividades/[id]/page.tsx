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
import type { Questao, Atividade } from "@/types/database";

async function salvarQuestoesDaAtividade(id: string, formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const idsEscolhidos = formData.getAll("questao_id").map(String);

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

  const { data: todasQuestoes } = await supabase.from("questoes").select("*").eq("ativo", true).order("materia");
  const questoes = (todasQuestoes as Questao[]) ?? [];

  const { data: jaSelecionadas } = await supabase.from("atividade_questoes").select("questao_id").eq("atividade_id", params.id);
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
            Marque quais questões do banco fazem parte desta atividade. Só questões ativas aparecem aqui.
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
