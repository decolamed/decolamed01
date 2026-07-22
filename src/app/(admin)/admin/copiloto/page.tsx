import Link from "next/link";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

export default async function AdminCopilotoPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: eventos }, { data: recs }] = await Promise.all([
    supabase
      .from("copiloto_eventos")
      .select("*, profiles(nome)")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("copiloto_recomendacoes")
      .select("*, profiles(nome)")
      .order("gerado_em", { ascending: false })
      .limit(30)
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Copiloto</h1>
      <p className="mt-1 text-sm text-navy-dark/60">
        O Copiloto observa a atividade dos alunos e sugere revisões quando algo importante acontece
        (erros seguidos, precisão baixa numa matéria, nota ruim em simulado, etc.).
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/copiloto/pesos" className="rounded-lg bg-orange px-4 py-2 text-sm font-bold text-white">
          Configurar pesos da FACAPE →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow">
          <h2 className="font-display font-bold text-navy-dark">Últimas recomendações criadas</h2>
          <ul className="mt-3 divide-y">
            {(recs ?? []).length === 0 && (
              <li className="py-4 text-sm text-navy-dark/50">Nenhuma recomendação criada ainda.</li>
            )}
            {(recs ?? []).map((r: any) => (
              <li key={r.id} className="py-3 text-sm">
                <p className="font-semibold text-navy-dark">
                  {r.profiles?.nome ?? "aluno"} · {r.titulo}
                </p>
                <p className="text-xs text-navy-dark/60">{r.motivo}</p>
                <p className="mt-0.5 text-xs text-navy-dark/40">
                  {new Date(r.gerado_em).toLocaleString("pt-BR")} · fonte: {r.fonte} · status: {r.status}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <h2 className="font-display font-bold text-navy-dark">Últimos gatilhos disparados</h2>
          <ul className="mt-3 divide-y">
            {(eventos ?? []).length === 0 && (
              <li className="py-4 text-sm text-navy-dark/50">Nenhum evento ainda.</li>
            )}
            {(eventos ?? []).map((e: any) => (
              <li key={e.id} className="py-3 text-sm">
                <p className="font-semibold text-navy-dark">
                  {e.profiles?.nome ?? "aluno"} · <span className="font-mono text-xs text-navy">{e.gatilho}</span>
                </p>
                <p className="text-xs text-navy-dark/60">
                  {e.materia}{e.assunto ? ` · ${e.assunto}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-navy-dark/40">
                  {new Date(e.created_at).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
