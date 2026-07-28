import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import type { Questao, Simulado } from "@/types/database";

async function salvarQuestoesDoSimulado(id: string, formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const idsEscolhidos = formData.getAll("questao_id").map(String);

  // Substitui o conjunto inteiro pelo que foi marcado agora — mais simples e
  // previsível do que tentar calcular incrementalmente o que adicionar/remover.
  const { error: delError } = await supabase.from("simulado_questoes").delete().eq("simulado_id", id);
  if (delError) {
    redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("Não foi possível salvar as questões do simulado.")}`);
  }

  if (idsEscolhidos.length > 0) {
    const linhas = idsEscolhidos.map((questaoId, index) => ({
      simulado_id: id,
      questao_id: questaoId,
      ordem: index
    }));
    const { error: insError } = await supabase.from("simulado_questoes").insert(linhas);
    if (insError) {
      redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("Não foi possível salvar as questões do simulado.")}`);
    }
  }

  revalidatePath(`/admin/simulados/${id}`);
  revalidatePath("/admin/simulados");
  redirect(`/admin/simulados/${id}?sucesso=${encodeURIComponent(`${idsEscolhidos.length} questão(ões) salva(s) no simulado.`)}`);
}

export default async function EscolherQuestoesSimuladoPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: simulado } = await supabase.from("simulados").select("*").eq("id", params.id).maybeSingle();
  if (!simulado) notFound();
  const s = simulado as Simulado;

  const { data: todasQuestoes } = await supabase.from("questoes").select("*").eq("ativo", true).order("materia");
  const questoes = (todasQuestoes as Questao[]) ?? [];

  const { data: jaSelecionadas } = await supabase.from("simulado_questoes").select("questao_id").eq("simulado_id", params.id);
  const idsJaSelecionados = new Set((jaSelecionadas ?? []).map((q: any) => q.questao_id));

  const salvarComId = salvarQuestoesDoSimulado.bind(null, params.id);

  return (
    <div>
      <a href="/admin/simulados" className="text-sm text-navy hover:underline">← Voltar para Simulados</a>
      <h1 className="mt-2 font-display text-2xl font-bold text-navy-dark">Questões — {s.titulo}</h1>
      <p className="mt-1 text-sm text-navy-dark/60">
        Marque quais questões do banco fazem parte deste simulado. Só questões ativas aparecem aqui.
      </p>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <form action={salvarComId} className="mt-6">
        <div className="max-h-[60vh] overflow-y-auto rounded-2xl bg-white shadow">
          {questoes.map((q) => (
            <label key={q.id} className="flex cursor-pointer items-start gap-3 border-b p-4 last:border-0 hover:bg-navy/5">
              <input
                type="checkbox"
                name="questao_id"
                value={q.id}
                defaultChecked={idsJaSelecionados.has(q.id)}
                className="mt-1"
              />
              <div>
                <p className="text-xs font-semibold text-navy-dark/50">{q.materia}{q.assunto ? ` · ${q.assunto}` : ""}</p>
                <p className="text-sm text-navy-dark">{q.enunciado}</p>
              </div>
            </label>
          ))}
          {questoes.length === 0 && (
            <p className="p-6 text-center text-sm text-navy-dark/50">
              Nenhuma questão ativa no banco ainda — cadastre em /admin/questoes primeiro.
            </p>
          )}
        </div>

        {questoes.length > 0 && (
          <SubmitButton
            pendingText="Salvando..."
            className="mt-5 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
          >
            Salvar seleção
          </SubmitButton>
        )}
      </form>
    </div>
  );
}
