import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { MetadadosForm } from "./metadados-form";
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
  const idsJaSelecionados = new Set((jaSelecionadas ?? []).map((q: any) => q.questao_id));

  const salvarComId = salvarQuestoesDaAtividade.bind(null, params.id);

  const porMateria = new Map<string, Questao[]>();
  questoes.forEach((q) => {
    const lista = porMateria.get(q.materia) ?? [];
    lista.push(q);
    porMateria.set(q.materia, lista);
  });

  return (
    <div>
      <a href="/admin/atividades" className="text-sm text-navy hover:underline">← Voltar para Atividades</a>
      <h1 className="mt-2 font-display text-2xl font-bold text-navy-dark">{a.titulo}</h1>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <MetadadosForm atividade={a} />

        <div>
          <p className="mb-2 text-sm font-semibold text-navy-dark/70">
            Marque quais questões do banco fazem parte desta atividade. Só questões ativas aparecem aqui.
          </p>
          <form action={salvarComId}>
            <div className="max-h-[55vh] overflow-y-auto rounded-2xl bg-white shadow">
              {Array.from(porMateria.entries()).map(([materia, itens]) => (
                <div key={materia}>
                  <p className="sticky top-0 bg-navy-dark/5 px-4 py-2 text-[11px] font-extrabold uppercase tracking-wide text-navy-dark/60">
                    {materia} · {itens.length} questõe{itens.length !== 1 ? "s" : ""}
                  </p>
                  {itens.map((q) => (
                    <label key={q.id} className="flex cursor-pointer items-start gap-3 border-b p-4 last:border-0 hover:bg-navy/5">
                      <input type="checkbox" name="questao_id" value={q.id} defaultChecked={idsJaSelecionados.has(q.id)} className="mt-1" />
                      <div>
                        <p className="text-xs font-semibold text-navy-dark/50">{q.assunto ?? materia}{q.fonte ? ` · ${q.fonte}` : ""}</p>
                        <p className="text-sm text-navy-dark">{q.enunciado}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ))}
              {questoes.length === 0 && (
                <p className="p-6 text-center text-sm text-navy-dark/50">
                  Nenhuma questão ativa no banco ainda — cadastre em /admin/questoes primeiro.
                </p>
              )}
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
