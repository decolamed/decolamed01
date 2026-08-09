import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { getNomeVestibular } from "@/lib/site/marca";
import { QuestoesManager } from "./questoes-manager";
import { materiasUnicas } from "@/lib/site/materia-canonica";
import type { Questao } from "@/types/database";

// Mesma razão do /admin/flashcards: os totais por matéria exibidos aqui
// precisam ser os do banco neste instante, não os de uma versão em cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminQuestoesPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data }, { data: emSimulados }, { data: emAtividades }, nomeVestibular] = await Promise.all([
    supabase.from("questoes").select("*").order("created_at", { ascending: false }),
    supabase.from("simulado_questoes").select("questao_id, simulados(titulo)"),
    supabase.from("atividade_questoes").select("questao_id, atividades(titulo)"),
    getNomeVestibular()
  ]);
  const questoes = (data as Questao[]) ?? [];
  const materiasExistentes = materiasUnicas(questoes.map((q) => q.materia)).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  // Onde cada questão já está sendo usada — pra evitar reaproveitar sem
  // querer (ou pra confirmar de propósito) a mesma questão em vários
  // lugares, direto na tela do banco.
  const usoPorQuestao = new Map<string, { tipo: "Simulado" | "Atividade"; titulo: string }[]>();
  (emSimulados ?? []).forEach((r: any) => {
    if (!r.simulados) return;
    const lista = usoPorQuestao.get(r.questao_id) ?? [];
    lista.push({ tipo: "Simulado", titulo: r.simulados.titulo });
    usoPorQuestao.set(r.questao_id, lista);
  });
  (emAtividades ?? []).forEach((r: any) => {
    if (!r.atividades) return;
    const lista = usoPorQuestao.get(r.questao_id) ?? [];
    lista.push({ tipo: "Atividade", titulo: r.atividades.titulo });
    usoPorQuestao.set(r.questao_id, lista);
  });

  return (
    <QuestoesManager
      questoes={questoes}
      materiasExistentes={materiasExistentes}
      usoPorQuestao={Object.fromEntries(usoPorQuestao)}
      nomeVestibular={nomeVestibular}
    />
  );
}
