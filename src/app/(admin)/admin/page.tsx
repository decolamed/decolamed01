import { createAdminClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [{ count: totalAlunos }, { count: totalMatriculasAtivas }, { count: totalPlanos }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "aluno"),
    supabase.from("matriculas").select("*", { count: "exact", head: true }).eq("status", "ativa"),
    supabase.from("planos").select("*", { count: "exact", head: true }).eq("ativo", true)
  ]);

  const cards = [
    { label: "Alunos cadastrados", value: totalAlunos ?? 0 },
    { label: "Matrículas ativas", value: totalMatriculasAtivas ?? 0 },
    { label: "Planos ativos", value: totalPlanos ?? 0 }
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Visão geral</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-navy-dark/60">{card.label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-navy-dark">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
