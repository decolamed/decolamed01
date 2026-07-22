import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { Simulado, SimuladoTentativa } from "@/types/database";

export default async function AlunoSimuladosPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { data: simuladosData } = await supabase.from("simulados").select("*").eq("ativo", true);
  const simulados = (simuladosData as Simulado[]) ?? [];

  const { data: contagens } = await supabase.from("simulado_questoes").select("simulado_id");
  const totalPorSimulado = new Map<string, number>();
  (contagens ?? []).forEach((c: any) => totalPorSimulado.set(c.simulado_id, (totalPorSimulado.get(c.simulado_id) ?? 0) + 1));

  const { data: tentativasData } = await supabase
    .from("simulado_tentativas")
    .select("*")
    .eq("aluno_id", profile.id)
    .order("created_at", { ascending: false });
  const tentativas = (tentativasData as SimuladoTentativa[]) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">⏱️ Simulados</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {simulados.map((s) => {
          const total = totalPorSimulado.get(s.id) ?? 0;
          return (
            <div key={s.id} className="rounded-2xl bg-white p-6 shadow">
              <h2 className="font-display font-bold text-navy-dark">{s.titulo}</h2>
              {s.descricao && <p className="mt-1 text-sm text-navy-dark/60">{s.descricao}</p>}
              <p className="mt-3 text-sm text-navy-dark/70">
                {total} questão{total !== 1 ? "ões" : ""} · {s.tempo_minutos} minutos
              </p>
              {total > 0 ? (
                <Link
                  href={`/aluno/simulados/${s.id}`}
                  className="mt-4 inline-block rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
                >
                  Iniciar simulado
                </Link>
              ) : (
                <p className="mt-4 text-sm text-navy-dark/40">Ainda sem questões cadastradas.</p>
              )}
            </div>
          );
        })}
        {simulados.length === 0 && (
          <p className="text-navy-dark/50">Nenhum simulado disponível no momento.</p>
        )}
      </div>

      {tentativas.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-lg font-bold text-navy-dark">Seu histórico</h2>
          <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow">
            <ul className="divide-y">
              {tentativas.map((t) => {
                const simulado = simulados.find((s) => s.id === t.simulado_id);
                return (
                  <li key={t.id} className="flex items-center justify-between p-4 text-sm">
                    <div>
                      <p className="font-semibold text-navy-dark">{simulado?.titulo ?? "Simulado"}</p>
                      <p className="text-xs text-navy-dark/50">
                        {new Date(t.created_at).toLocaleDateString("pt-BR")} — {t.acertos}/{t.total} acertos
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-lg font-bold text-navy-dark">
                        {Math.round((t as any).nota_facape ?? t.nota)}%
                      </span>
                      {(t as any).nota_facape != null && (
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-dark/40">
                          Nota FACAPE
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
