import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/admin/card";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { getNomeVestibular } from "@/lib/site/marca";

const PATH = "/admin/copiloto/pesos";

async function salvarPeso(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const materia = String(formData.get("materia") ?? "").trim();
  const peso = Number(formData.get("peso") ?? 1);
  const qtdQuestoes = Number(formData.get("qtd_questoes") ?? 10);
  const totalQuestoesProva = Number(formData.get("total_questoes_prova") ?? 50);
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!materia) redirect(`${PATH}?erro=${encodeURIComponent("Informe o nome da matéria.")}`);
  if (isNaN(peso) || peso < 0) redirect(`${PATH}?erro=${encodeURIComponent("Peso precisa ser ≥ 0.")}`);
  if (isNaN(qtdQuestoes) || qtdQuestoes < 0) redirect(`${PATH}?erro=${encodeURIComponent("Qtd. de questões precisa ser ≥ 0.")}`);

  const { error } = await supabase.from("materias_peso").upsert(
    { materia, peso, qtd_questoes: qtdQuestoes, total_questoes_prova: totalQuestoesProva, observacao },
    { onConflict: "materia" }
  );
  revalidatePath(PATH);
  if (error) redirect(`${PATH}?erro=${encodeURIComponent("Não foi possível salvar.")}`);
  redirect(`${PATH}?sucesso=${encodeURIComponent(`${materia} salva — algoritmo atualizado automaticamente.`)}`);
}

async function excluirPeso(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("materias_peso").delete().eq("materia", String(formData.get("materia")));
  revalidatePath(PATH);
}

export default async function AdminPesosPage({
  searchParams
}: {
  searchParams: { erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const [{ data }, nomeVestibular, { data: materiasQuestoes }, { data: materiasFlashcards }] = await Promise.all([
    supabase.from("materias_peso").select("*").order("pontos_potenciais", { ascending: false }).order("materia"),
    getNomeVestibular(),
    supabase.from("questoes").select("materia").eq("ativo", true),
    supabase.from("flashcards").select("materia").eq("ativo", true)
  ]);

  // Calcula relevância pra exibir na tabela
  const lista = data ?? [];
  const totalPontos = lista.reduce((s: number, p: any) => s + (p.peso * p.qtd_questoes), 0);

  // O peso só é aplicado quando o nome bate EXATAMENTE com `questoes.materia`
  // (ver weights()/priorities() em decola-app.tsx e motor.ts). Um nome
  // agrupado como "Inglês/Espanhol" nunca casa com questões marcadas como
  // "Inglês" ou "Espanhol": elas caem no peso 1 padrão e mexer aqui não tem
  // efeito nenhum. Como a falha é silenciosa, ela precisa ficar visível.
  const materiasDoConteudo = new Set<string>();
  [materiasQuestoes, materiasFlashcards].forEach((linhas) =>
    (linhas ?? []).forEach((l: { materia: string | null }) => {
      const m = (l.materia ?? "").trim();
      if (m) materiasDoConteudo.add(m);
    })
  );
  const pesosSemConteudo = lista.map((p: any) => p.materia).filter((m: string) => !materiasDoConteudo.has(m));
  const conteudoSemPeso = Array.from(materiasDoConteudo).filter(
    (m) => !lista.some((p: any) => p.materia === m)
  );

  return (
    <div>
      <PageHeader
        title={`Pesos e Questões — ${nomeVestibular}`}
        subtitle="Edite o peso e a quantidade de questões de cada matéria. O algoritmo do Copiloto recalcula a relevância automaticamente."
      />
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      {(pesosSemConteudo.length > 0 || conteudoSemPeso.length > 0) && (
        <Card className="mb-4 border-l-4 border-red-500">
          <p className="text-xs font-extrabold uppercase tracking-wide text-red-700">Nomes que não se encontram</p>
          <p className="mt-1 text-sm text-navy-dark/70">
            O peso só vale quando o nome da matéria aqui é <strong>idêntico</strong> ao usado nas questões e
            flashcards. Onde os nomes divergem, o peso é ignorado e a matéria conta como peso 1 — sem nenhum
            aviso para o aluno.
          </p>
          {pesosSemConteudo.length > 0 && (
            <p className="mt-2 text-sm text-navy-dark">
              <strong>Com peso, mas sem conteúdo com esse nome:</strong> {pesosSemConteudo.join(", ")}
            </p>
          )}
          {conteudoSemPeso.length > 0 && (
            <p className="mt-1 text-sm text-navy-dark">
              <strong>Com conteúdo, mas sem peso cadastrado:</strong> {conteudoSemPeso.join(", ")}
            </p>
          )}
          <p className="mt-2 text-xs text-navy-dark/60">
            Para resolver: use aqui exatamente os mesmos nomes do banco de questões (um peso por matéria), ou
            renomeie a matéria nas questões.
          </p>
        </Card>
      )}

      {/* Explicação da fórmula */}
      <Card className="mb-4 border-l-4 border-orange">
        <p className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40">Como o algoritmo calcula a relevância</p>
        <p className="mt-1 text-sm font-semibold text-navy-dark">
          relevância = (peso × qtd. questões) ÷ soma de todos os (peso × qtd. questões)
        </p>
        <p className="mt-1 text-xs text-navy-dark/60">
          Exemplo: Português (peso 2 × 10 questões = 20 pts) e Física (peso 2 × 5 questões = 10 pts) — mesmo peso,
          mas Português tem o dobro de relevância na prova. O algoritmo prioriza corretamente.
        </p>
      </Card>

      {/* Tabela atual */}
      <div className="mb-6 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-navy/5">
            <tr>
              <th className="p-3 text-left text-xs font-extrabold uppercase tracking-wide text-navy-dark/50">Matéria</th>
              <th className="p-3 text-center text-xs font-extrabold uppercase tracking-wide text-navy-dark/50">Peso</th>
              <th className="p-3 text-center text-xs font-extrabold uppercase tracking-wide text-navy-dark/50">Qtd. Questões</th>
              <th className="p-3 text-center text-xs font-extrabold uppercase tracking-wide text-navy-dark/50">Pontos Potenciais</th>
              <th className="p-3 text-center text-xs font-extrabold uppercase tracking-wide text-navy-dark/50">Relevância %</th>
              <th className="p-3 text-left text-xs font-extrabold uppercase tracking-wide text-navy-dark/50">Observação</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {lista.map((p: any) => {
              const pontos = p.peso * p.qtd_questoes;
              const relevancia = totalPontos > 0 ? ((pontos / totalPontos) * 100).toFixed(1) : "0.0";
              return (
                <tr key={p.materia} className="border-t">
                  <td className="p-3 font-bold text-navy-dark">{p.materia}</td>
                  <td className="p-3 text-center text-navy-dark">{p.peso}</td>
                  <td className="p-3 text-center text-navy-dark">{p.qtd_questoes}</td>
                  <td className="p-3 text-center font-bold text-navy-dark">{pontos}</td>
                  <td className="p-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                      Number(relevancia) >= 25 ? "bg-red/10 text-red" :
                      Number(relevancia) >= 15 ? "bg-orange/10 text-orange-dark" :
                      "bg-navy/5 text-navy-dark/60"
                    }`}>
                      {relevancia}%
                    </span>
                  </td>
                  <td className="p-3 text-xs text-navy-dark/50">{p.observacao ?? "—"}</td>
                  <td className="p-3">
                    <form action={excluirPeso}>
                      <input type="hidden" name="materia" value={p.materia} />
                      <SubmitButton pendingText="..." className="text-xs text-red hover:underline">
                        Excluir
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              );
            })}
            {lista.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-sm text-navy-dark/50">Nenhuma matéria cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formulário de adição/atualização */}
      <Card className="max-w-xl">
        <h2 className="text-sm font-extrabold text-navy-dark">Adicionar / atualizar matéria</h2>
        <p className="mt-0.5 text-xs text-navy-dark/50">
          Se a matéria já existir, os valores são atualizados — o algoritmo do Copiloto ajusta automaticamente.
        </p>
        <form action={salvarPeso} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40">Matéria</label>
              <input name="materia" required placeholder="Biologia" className="mt-1 w-full rounded-[10px] border border-navy-dark/15 px-3 py-2.5 text-sm font-bold text-navy-dark outline-none focus:border-navy" />
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40">Peso (multiplicador por questão)</label>
              <input name="peso" type="number" step="0.5" min="0" defaultValue="1" required className="mt-1 w-full rounded-[10px] border border-navy-dark/15 px-3 py-2.5 text-sm font-bold text-navy-dark outline-none focus:border-navy" />
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40">Qtd. de questões na prova</label>
              <input name="qtd_questoes" type="number" min="0" defaultValue="10" required className="mt-1 w-full rounded-[10px] border border-navy-dark/15 px-3 py-2.5 text-sm font-bold text-navy-dark outline-none focus:border-navy" />
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40">Total de questões objetivas da prova</label>
              <input name="total_questoes_prova" type="number" min="1" defaultValue="50" required className="mt-1 w-full rounded-[10px] border border-navy-dark/15 px-3 py-2.5 text-sm font-bold text-navy-dark outline-none focus:border-navy" />
            </div>
          </div>
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40">Observação (opcional)</label>
            <input name="observacao" className="mt-1 w-full rounded-[10px] border border-navy-dark/15 px-3 py-2.5 text-sm font-semibold text-navy-dark outline-none focus:border-navy" />
          </div>
          <SubmitButton
            pendingText="Salvando..."
            className="rounded-[11px] bg-orange px-6 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-orange-dark"
          >
            Salvar
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
