import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import type { Questao, Simulado } from "@/types/database";

// Título, descrição e tempo do simulado. Só podiam ser definidos na
// criação — que usa "Novo simulado"/60min fixos — e não havia nenhuma tela
// para mudá-los depois: corrigir o nome obrigava a excluir o simulado, e
// junto iriam as questões já montadas.
async function salvarMetadadosSimulado(id: string, formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const tempo = Number(formData.get("tempo_minutos") ?? 60);

  if (!titulo) {
    redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("Informe um título para o simulado.")}`);
  }
  if (!Number.isFinite(tempo) || tempo <= 0) {
    redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("O tempo precisa ser maior que zero.")}`);
  }

  const { error } = await supabase
    .from("simulados")
    .update({ titulo, descricao: descricao || null, tempo_minutos: tempo })
    .eq("id", id);

  revalidatePath(`/admin/simulados/${id}`);
  revalidatePath("/admin/simulados");
  revalidatePath("/aluno");
  if (error) {
    redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("Não foi possível salvar os dados do simulado.")}`);
  }
  redirect(`/admin/simulados/${id}?sucesso=${encodeURIComponent("Dados do simulado atualizados.")}`);
}

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

  // Agrupadas por matéria — organiza a montagem do simulado em vez de uma
  // lista corrida (a query já ordena por matéria, isso só quebra em seções).
  const porMateria = new Map<string, Questao[]>();
  questoes.forEach((q) => {
    const lista = porMateria.get(q.materia) ?? [];
    lista.push(q);
    porMateria.set(q.materia, lista);
  });

  return (
    <div>
      <a href="/admin/simulados" className="text-sm text-navy hover:underline">← Voltar para Simulados</a>
      <h1 className="mt-2 font-display text-2xl font-bold text-navy-dark">Questões — {s.titulo}</h1>
      <p className="mt-1 text-sm text-navy-dark/60">
        Marque quais questões do banco fazem parte deste simulado. Só questões ativas aparecem aqui.
      </p>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <form action={salvarMetadadosSimulado.bind(null, params.id)} className="mt-6 rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Dados do simulado</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div>
            <label className="text-xs font-semibold text-navy-dark/60" htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" defaultValue={s.titulo} className="mt-1 w-full rounded-lg border p-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-dark/60" htmlFor="tempo_minutos">Tempo (minutos)</label>
            <input id="tempo_minutos" name="tempo_minutos" type="number" min={1} defaultValue={s.tempo_minutos} className="mt-1 w-full rounded-lg border p-2 text-sm" />
          </div>
        </div>
        <label className="mt-3 block text-xs font-semibold text-navy-dark/60" htmlFor="descricao">Descrição (opcional)</label>
        <input id="descricao" name="descricao" defaultValue={s.descricao ?? ""} className="mt-1 w-full rounded-lg border p-2 text-sm" />
        <SubmitButton pendingText="Salvando..." className="mt-4 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white">
          Salvar dados
        </SubmitButton>
      </form>

      <form action={salvarComId} className="mt-6">
        <div className="max-h-[60vh] overflow-y-auto rounded-2xl bg-white shadow">
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
