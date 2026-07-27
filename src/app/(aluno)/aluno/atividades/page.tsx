import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { Atividade } from "@/types/database";

export default async function AlunoAtividadesPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const [{ data: atividades }, { data: minhasTentativas }, { data: questoesData }] = await Promise.all([
    supabase.from("atividades").select("*").eq("ativo", true).order("created_at", { ascending: false }),
    supabase.from("atividade_tentativas").select("atividade_id, nota, finalizado_em").eq("aluno_id", profile.id),
    supabase.from("atividade_questoes").select("atividade_id")
  ]);

  const totalPorId = new Map<string, number>();
  (questoesData ?? []).forEach((q: any) => totalPorId.set(q.atividade_id, (totalPorId.get(q.atividade_id) ?? 0) + 1));

  const tentativasPorAtividade = new Map<string, { nota: number; finalizado_em: string | null }[]>();
  (minhasTentativas ?? []).forEach((t: any) => {
    const lista = tentativasPorAtividade.get(t.atividade_id) ?? [];
    lista.push({ nota: t.nota, finalizado_em: t.finalizado_em });
    tentativasPorAtividade.set(t.atividade_id, lista);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">🎯 Atividades</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">← Voltar ao painel</Link>
      </div>
      <p className="mt-1 text-sm text-navy-dark/60">Avaliações baseadas em questões, separadas dos simulados.</p>

      <div className="mt-6 space-y-3">
        {(atividades as Atividade[] ?? []).map((a) => {
          const total = totalPorId.get(a.id) ?? 0;
          const tentativas = tentativasPorAtividade.get(a.id) ?? [];
          const ultima = tentativas[tentativas.length - 1];
          return (
            <div key={a.id} className="rounded-2xl bg-white p-5 shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display font-bold text-navy-dark">{a.titulo}</p>
                  <p className="text-xs text-navy-dark/50">
                    {total} questões{a.tempo_limite_minutos ? ` · ${a.tempo_limite_minutos} min` : ""}
                    {a.materia ? ` · ${a.materia}` : ""}
                  </p>
                  {ultima && <p className="mt-1 text-xs font-semibold text-green-700">Última nota: {ultima.nota}%</p>}
                </div>
                {total > 0 && (
                  <Link href={`/aluno/atividades/${a.id}`} className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-dark">
                    {ultima ? "Refazer" : "Começar"}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        {(atividades ?? []).length === 0 && (
          <p className="py-6 text-center text-sm text-navy-dark/50">Nenhuma atividade disponível ainda.</p>
        )}
      </div>
    </div>
  );
}
