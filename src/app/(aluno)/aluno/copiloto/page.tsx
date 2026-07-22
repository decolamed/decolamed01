import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/admin/submit-button";
import { marcarRecomendacao } from "@/app/(aluno)/aluno/copiloto/actions";

const ICONE_TIPO: Record<string, string> = {
  questoes: "🎯",
  flashcards: "🃏",
  simulado: "⏱️",
  aula: "🎬"
};

const LINK_TIPO: Record<string, (materia: string) => string> = {
  questoes: (m) => `/aluno/questoes?materia=${encodeURIComponent(m)}`,
  flashcards: (m) => `/aluno/flashcards?materia=${encodeURIComponent(m)}`,
  simulado: () => `/aluno/simulados`,
  aula: () => `/aluno`
};

export default async function AlunoCopilotoPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { data } = await supabase
    .from("copiloto_recomendacoes")
    .select("*")
    .eq("aluno_id", profile.id)
    .eq("status", "pendente")
    .order("prioridade", { ascending: false })
    .order("gerado_em", { ascending: false });

  const recs = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">🤖 Copiloto</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      <p className="mt-2 text-sm text-navy-dark/60">
        O Copiloto acompanha seu estudo e sugere o que revisar em seguida, focando nos pontos que mais podem
        subir sua nota.
      </p>

      {recs.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow">
          <span className="text-4xl">✨</span>
          <p className="mt-3 text-navy-dark/70">
            Sem recomendações pendentes no momento. Continue estudando — quando o Copiloto identificar algo que
            vale a pena revisar, ele aparece aqui.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {recs.map((r: any) => {
            const marcarConcluida = marcarRecomendacao.bind(null, r.id, "concluida" as const);
            const descartar = marcarRecomendacao.bind(null, r.id, "descartada" as const);
            const linkAtividade = LINK_TIPO[r.tipo]?.(r.materia) ?? "/aluno";
            const icone = ICONE_TIPO[r.tipo] ?? "📌";
            const corPrioridade = r.prioridade >= 3 ? "border-red-400 bg-red-50" : r.prioridade >= 2 ? "border-orange bg-orange/5" : "border-navy/10 bg-white";
            return (
              <div key={r.id} className={`rounded-2xl border-2 p-5 shadow-sm ${corPrioridade}`}>
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    {icone}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-navy-dark/50">
                      {r.materia}{r.assunto ? ` · ${r.assunto}` : ""}
                    </p>
                    <h2 className="mt-0.5 font-display font-bold text-navy-dark">{r.titulo}</h2>
                    <p className="mt-1 text-sm text-navy-dark/70">{r.motivo}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={linkAtividade}
                    className="rounded-full bg-orange px-5 py-2 text-sm font-bold text-white hover:bg-orange-dark"
                  >
                    Fazer agora →
                  </Link>
                  <form action={marcarConcluida}>
                    <SubmitButton
                      pendingText="..."
                      className="rounded-full border border-navy/20 px-5 py-2 text-sm font-semibold text-navy-dark hover:bg-navy/5"
                    >
                      Já revisei ✓
                    </SubmitButton>
                  </form>
                  <form action={descartar}>
                    <SubmitButton
                      pendingText="..."
                      className="rounded-full px-5 py-2 text-sm font-semibold text-navy-dark/50 hover:text-navy-dark"
                    >
                      Dispensar
                    </SubmitButton>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
