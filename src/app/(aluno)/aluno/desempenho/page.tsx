import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export default async function AlunoDesempenhoPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const [{ data: respostas }, { data: revisoes }, { data: tentativas }] = await Promise.all([
    supabase.from("respostas_aluno").select("correta, questoes(materia)").eq("aluno_id", profile.id),
    supabase.from("flashcard_revisoes").select("lembrou").eq("aluno_id", profile.id),
    supabase.from("simulado_tentativas").select("nota, acertos, total, created_at, simulados(titulo)").eq("aluno_id", profile.id).order("created_at", { ascending: false })
  ]);

  const listaRespostas = respostas ?? [];
  const listaRevisoes = revisoes ?? [];
  const listaTentativas = tentativas ?? [];

  const totalQuestoes = listaRespostas.length;
  const acertosQuestoes = listaRespostas.filter((r: any) => r.correta).length;
  const precisaoGeral = totalQuestoes > 0 ? Math.round((acertosQuestoes / totalQuestoes) * 100) : 0;

  const totalFlashcards = listaRevisoes.length;
  const lembrados = listaRevisoes.filter((r: any) => r.lembrou).length;
  const precisaoFlashcards = totalFlashcards > 0 ? Math.round((lembrados / totalFlashcards) * 100) : 0;

  const mediaSimulados =
    listaTentativas.length > 0
      ? Math.round(listaTentativas.reduce((soma: number, t: any) => soma + t.nota, 0) / listaTentativas.length)
      : 0;

  // Agrupa acertos por matéria a partir das respostas de questões.
  const porMateria = new Map<string, { acertos: number; total: number }>();
  listaRespostas.forEach((r: any) => {
    const materia = r.questoes?.materia ?? "Sem matéria";
    const atual = porMateria.get(materia) ?? { acertos: 0, total: 0 };
    atual.total += 1;
    if (r.correta) atual.acertos += 1;
    porMateria.set(materia, atual);
  });
  const materiasOrdenadas = Array.from(porMateria.entries()).sort((a, b) => b[1].total - a[1].total);

  const semDadosAinda = totalQuestoes === 0 && totalFlashcards === 0 && listaTentativas.length === 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">📊 Desempenho</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      {semDadosAinda ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-navy-dark/70">
            Você ainda não praticou nada por aqui. Responda algumas questões, revise flashcards ou faça um simulado
            pra começar a ver seu desempenho aparecer.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/aluno/questoes" className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white">
              Praticar questões
            </Link>
            <Link href="/aluno/flashcards" className="rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white">
              Revisar flashcards
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange/10 text-lg">🎯</span>
              <p className="mt-3 text-sm text-navy-dark/60">Precisão em questões</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-navy-dark">{precisaoGeral}%</p>
              <p className="text-xs text-navy-dark/40">{acertosQuestoes} de {totalQuestoes} respondidas</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange/10 text-lg">🃏</span>
              <p className="mt-3 text-sm text-navy-dark/60">Memorização (flashcards)</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-navy-dark">{precisaoFlashcards}%</p>
              <p className="text-xs text-navy-dark/40">{lembrados} de {totalFlashcards} lembrados</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange/10 text-lg">⏱️</span>
              <p className="mt-3 text-sm text-navy-dark/60">Média em simulados</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-navy-dark">{mediaSimulados}%</p>
              <p className="text-xs text-navy-dark/40">{listaTentativas.length} simulado(s) feito(s)</p>
            </div>
          </div>

          {materiasOrdenadas.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow">
              <h2 className="font-display font-bold text-navy-dark">Precisão por matéria</h2>
              <div className="mt-4 space-y-3">
                {materiasOrdenadas.map(([materia, dados]) => {
                  const pct = Math.round((dados.acertos / dados.total) * 100);
                  return (
                    <div key={materia}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-navy-dark">{materia}</span>
                        <span className="text-navy-dark/60">{pct}% ({dados.acertos}/{dados.total})</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-navy/10">
                        <div
                          className={`h-full ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-orange" : "bg-red-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {listaTentativas.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow">
              <h2 className="font-display font-bold text-navy-dark">Histórico de simulados</h2>
              <ul className="mt-3 divide-y">
                {listaTentativas.map((t: any, i: number) => (
                  <li key={i} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-semibold text-navy-dark">{t.simulados?.titulo ?? "Simulado"}</p>
                      <p className="text-xs text-navy-dark/50">
                        {new Date(t.created_at).toLocaleDateString("pt-BR")} — {t.acertos}/{t.total} acertos
                      </p>
                    </div>
                    <span className="font-display text-lg font-bold text-navy-dark">{Math.round(t.nota)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
