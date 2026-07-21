import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import type { Alternativa, Questao } from "@/types/database";

const PATH = "/admin/questoes";
const LETRAS = ["a", "b", "c", "d", "e"] as const;

async function criarQuestao(formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const alternativas: Alternativa[] = LETRAS
    .map((letra) => ({ id: letra, texto: String(formData.get(`alt_${letra}`) ?? "").trim() }))
    .filter((a) => a.texto.length > 0);

  const respostaCorreta = String(formData.get("resposta_correta") ?? "");

  if (alternativas.length < 2) {
    redirect(`${PATH}?erro=${encodeURIComponent("Informe pelo menos 2 alternativas.")}`);
  }
  if (!alternativas.some((a) => a.id === respostaCorreta)) {
    redirect(`${PATH}?erro=${encodeURIComponent("A resposta correta precisa ser uma das alternativas preenchidas.")}`);
  }

  const { error } = await supabase.from("questoes").insert({
    materia: String(formData.get("materia") ?? "").trim(),
    assunto: String(formData.get("assunto") ?? "").trim() || null,
    enunciado: String(formData.get("enunciado") ?? "").trim(),
    alternativas,
    resposta_correta: respostaCorreta,
    explicacao: String(formData.get("explicacao") ?? "").trim() || null,
    dificuldade: String(formData.get("dificuldade") ?? "media"),
    ativo: true,
    criado_por: admin.id
  });

  revalidatePath(PATH);
  if (error) redirect(`${PATH}?erro=${encodeURIComponent("Não foi possível criar a questão.")}`);
  redirect(`${PATH}?sucesso=${encodeURIComponent("Questão criada com sucesso.")}`);
}

async function alternarAtivo(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const ativo = formData.get("ativo") === "true";
  const { error } = await supabase.from("questoes").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(PATH);
  if (error) redirect(`${PATH}?erro=${encodeURIComponent("Não foi possível atualizar a questão.")}`);
}

async function excluirQuestao(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("questoes").delete().eq("id", String(formData.get("id")));
  revalidatePath(PATH);
  if (error) redirect(`${PATH}?erro=${encodeURIComponent("Não foi possível excluir a questão (pode já ter respostas de alunos vinculadas).")}`);
}

const DIFICULDADE_LABEL: Record<string, string> = { facil: "Fácil", media: "Média", dificil: "Difícil" };

export default async function AdminQuestoesPage({
  searchParams
}: {
  searchParams: { materia?: string; erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase.from("questoes").select("*").order("created_at", { ascending: false });
  if (searchParams.materia) query = query.eq("materia", searchParams.materia);
  const { data: questoesData } = await query;
  const questoes = (questoesData as Questao[]) ?? [];

  const { data: materiasData } = await supabase.from("questoes").select("materia");
  const materias = Array.from(new Set((materiasData ?? []).map((m: any) => m.materia))).sort();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Banco de questões</h1>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      {materias.length > 0 && (
        <form className="mt-4 flex flex-wrap gap-3" action="/admin/questoes">
          <select name="materia" defaultValue={searchParams.materia ?? ""} className="rounded-lg border p-3">
            <option value="">Todas as matérias</option>
            {materias.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <SubmitButton pendingText="..." className="rounded-lg bg-navy px-5 py-3 font-semibold text-white">
            Filtrar
          </SubmitButton>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Matéria</th>
              <th className="p-3">Enunciado</th>
              <th className="p-3">Dificuldade</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {questoes.map((q) => (
              <tr key={q.id} className="border-t align-top">
                <td className="p-3">
                  <p className="font-semibold">{q.materia}</p>
                  {q.assunto && <p className="text-xs text-navy-dark/50">{q.assunto}</p>}
                </td>
                <td className="max-w-md p-3">{q.enunciado.slice(0, 140)}{q.enunciado.length > 140 ? "…" : ""}</td>
                <td className="p-3">{DIFICULDADE_LABEL[q.dificuldade] ?? q.dificuldade}</td>
                <td className="p-3">
                  {q.ativo ? (
                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Ativa</span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">Inativa</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-1.5">
                    <form action={alternarAtivo}>
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="ativo" value={String(q.ativo)} />
                      <SubmitButton pendingText="..." className="text-orange-dark hover:underline">
                        {q.ativo ? "Desativar" : "Ativar"}
                      </SubmitButton>
                    </form>
                    <form action={excluirQuestao}>
                      <input type="hidden" name="id" value={q.id} />
                      <SubmitButton pendingText="..." className="text-red-600 hover:underline">
                        Excluir
                      </SubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {questoes.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-navy-dark/50">Nenhuma questão cadastrada ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Nova questão</h2>
        <form action={criarQuestao} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="materia">Matéria</label>
              <input id="materia" name="materia" required placeholder="Biologia" className="mt-1 w-full rounded-lg border p-3" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="assunto">Assunto (opcional)</label>
              <input id="assunto" name="assunto" placeholder="Citologia" className="mt-1 w-full rounded-lg border p-3" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold" htmlFor="enunciado">Enunciado</label>
            <textarea id="enunciado" name="enunciado" required rows={3} className="mt-1 w-full rounded-lg border p-3" />
          </div>

          <div>
            <p className="text-sm font-semibold">Alternativas (deixe em branco as que não for usar)</p>
            <div className="mt-2 space-y-2">
              {LETRAS.map((letra) => (
                <div key={letra} className="flex items-center gap-2">
                  <span className="w-6 shrink-0 font-display font-bold text-navy-dark">{letra.toUpperCase()}</span>
                  <input name={`alt_${letra}`} className="w-full rounded-lg border p-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="resposta_correta">Resposta correta</label>
              <select id="resposta_correta" name="resposta_correta" required className="mt-1 w-full rounded-lg border p-3">
                {LETRAS.map((letra) => (
                  <option key={letra} value={letra}>{letra.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="dificuldade">Dificuldade</label>
              <select id="dificuldade" name="dificuldade" defaultValue="media" className="mt-1 w-full rounded-lg border p-3">
                <option value="facil">Fácil</option>
                <option value="media">Média</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold" htmlFor="explicacao">Explicação (opcional, mostrada depois de responder)</label>
            <textarea id="explicacao" name="explicacao" rows={2} className="mt-1 w-full rounded-lg border p-3" />
          </div>

          <SubmitButton
            pendingText="Cadastrando..."
            className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
          >
            Cadastrar questão
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
