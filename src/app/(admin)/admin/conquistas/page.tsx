import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";

const BADGES = [
  { icone: "🎯", titulo: "Primeiras 10 Questões", descricao: "Respondeu 10+ questões", criterio: "q10" },
  { icone: "💯", titulo: "100 Questões", descricao: "Respondeu 100+ questões", criterio: "q100" },
  { icone: "⭐", titulo: "Precisão 90%+", descricao: "Precisão ≥ 90% com 20+ questões", criterio: "prec90" },
  { icone: "🃏", titulo: "Revisor Dedicado", descricao: "Lembrou 50+ flashcards", criterio: "fc50" },
  { icone: "📄", titulo: "Primeiro Simulado", descricao: "Concluiu 1 simulado", criterio: "sim1" },
  { icone: "🏅", titulo: "Simulado Expert", descricao: "Concluiu 3+ simulados", criterio: "sim3" },
  { icone: "🏆", titulo: "Top 10 no Ranking", descricao: "Está entre os 10 melhores por XP", criterio: "top10" }
];

export default async function AdminConquistasPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  // Busca os dados agregados de todos os alunos para calcular quantos
  // desbloquearam cada conquista.
  const [{ data: respostas }, { data: flashRevisoes }, { data: simuladoTentativas }, { data: ranking }] = await Promise.all([
    supabase.from("respostas_aluno").select("aluno_id, correta"),
    supabase.from("flashcard_revisoes").select("aluno_id, lembrou"),
    supabase.from("simulado_tentativas").select("aluno_id"),
    supabase.from("ranking_geral").select("aluno_id")
  ]);

  // Calcula desbloqueios por aluno
  const porAluno = new Map<string, { acertos: number; total: number; fc: number; sims: number }>();
  (respostas ?? []).forEach((r: any) => {
    const atual = porAluno.get(r.aluno_id) ?? { acertos: 0, total: 0, fc: 0, sims: 0 };
    atual.total++;
    if (r.correta) atual.acertos++;
    porAluno.set(r.aluno_id, atual);
  });
  (flashRevisoes ?? []).forEach((r: any) => {
    if (!r.lembrou) return;
    const atual = porAluno.get(r.aluno_id) ?? { acertos: 0, total: 0, fc: 0, sims: 0 };
    atual.fc++;
    porAluno.set(r.aluno_id, atual);
  });
  (simuladoTentativas ?? []).forEach((t: any) => {
    const atual = porAluno.get(t.aluno_id) ?? { acertos: 0, total: 0, fc: 0, sims: 0 };
    atual.sims++;
    porAluno.set(t.aluno_id, atual);
  });

  const topIds = new Set((ranking ?? []).slice(0, 10).map((r: any) => r.aluno_id));
  const totalAlunos = porAluno.size;

  function contarDesbloqueios(criterio: string) {
    let n = 0;
    porAluno.forEach((d, id) => {
      const precisao = d.total > 0 ? (d.acertos / d.total) * 100 : 0;
      if (criterio === "q10" && d.total >= 10) n++;
      else if (criterio === "q100" && d.total >= 100) n++;
      else if (criterio === "prec90" && d.total >= 20 && precisao >= 90) n++;
      else if (criterio === "fc50" && d.fc >= 50) n++;
      else if (criterio === "sim1" && d.sims >= 1) n++;
      else if (criterio === "sim3" && d.sims >= 3) n++;
      else if (criterio === "top10" && topIds.has(id)) n++;
    });
    return n;
  }

  return (
    <div>
      <PageHeader
        title="Conquistas"
        subtitle={`Catálogo de brasões e quantos alunos já desbloquearam cada um (${totalAlunos} aluno${totalAlunos !== 1 ? "s" : ""} com atividade)`}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((b) => {
          const n = contarDesbloqueios(b.criterio);
          const pct = totalAlunos > 0 ? Math.round((n / totalAlunos) * 100) : 0;
          return (
            <Card key={b.criterio}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange/10 text-2xl">{b.icone}</span>
                <div>
                  <p className="font-extrabold text-navy-dark">{b.titulo}</p>
                  <p className="text-xs font-semibold text-navy-dark/50">{b.descricao}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-bold text-navy-dark">{n} aluno{n !== 1 ? "s" : ""}</span>
                <span className="text-xs font-semibold text-navy-dark/50">{pct}% do total</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
                <div className="h-full bg-orange" style={{ width: `${pct}%` }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
