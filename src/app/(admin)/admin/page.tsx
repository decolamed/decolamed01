import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { formatarCentavos } from "@/lib/formatacao";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [
    { count: totalAlunos },
    { count: totalMatriculasAtivas },
    { count: totalPlanos },
    { count: totalParceiros },
    { data: vendasRecentes }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "aluno"),
    supabase.from("matriculas").select("*", { count: "exact", head: true }).eq("status", "ativa"),
    supabase.from("planos").select("*", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "parceiro"),
    supabase.from("pagamentos").select("valor_centavos, status").in("status", ["confirmado", "recebido"])
  ]);

  const totalVendidoCentavos = (vendasRecentes ?? []).reduce((s, v) => s + v.valor_centavos, 0);

  const cards = [
    { icone: "🧑‍🎓", label: "Alunos cadastrados", value: totalAlunos ?? 0 },
    { icone: "✅", label: "Matrículas ativas", value: totalMatriculasAtivas ?? 0 },
    { icone: "🗂️", label: "Planos ativos", value: totalPlanos ?? 0 },
    { icone: "🤝", label: "Parceiros", value: totalParceiros ?? 0 },
    { icone: "💰", label: "Total vendido", value: formatarCentavos(totalVendidoCentavos) }
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Visão geral</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-6 shadow">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange/10 text-lg">
              {card.icone}
            </span>
            <p className="mt-3 text-sm text-navy-dark/60">{card.label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-navy-dark">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
