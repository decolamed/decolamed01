import { createAdminClient } from "@/lib/supabase/server";
import type { UsoQuestao } from "@/components/admin/seletor-questoes";

/**
 * Onde cada questão do banco já está sendo usada (Alteração 4.6).
 *
 * Duas consultas para o banco inteiro, não uma por questão: montar um simulado
 * com centenas de questões visíveis não pode disparar centenas de consultas.
 *
 * Os selos servem para o admin não repetir a mesma questão sem perceber ao
 * montar prova nova — mas não bloqueiam nada: reutilizar de propósito é
 * legítimo, o problema é fazer isso às cegas.
 */
export async function carregarUsoDasQuestoes(): Promise<Record<string, UsoQuestao>> {
  const supabase = createAdminClient();

  const [{ data: emAtividades }, { data: emSimulados }] = await Promise.all([
    supabase.from("atividade_questoes").select("questao_id, atividades(titulo)"),
    supabase.from("simulado_questoes").select("questao_id, simulados(titulo)")
  ]);

  const uso: Record<string, UsoQuestao> = {};
  const registrar = (questaoId: string, onde: "atividades" | "simulados", titulo: string | null) => {
    if (!questaoId) return;
    uso[questaoId] ??= { atividades: [], simulados: [] };
    uso[questaoId][onde].push(titulo || "(sem título)");
  };

  ((emAtividades ?? []) as any[]).forEach((r) => registrar(r.questao_id, "atividades", r.atividades?.titulo ?? null));
  ((emSimulados ?? []) as any[]).forEach((r) => registrar(r.questao_id, "simulados", r.simulados?.titulo ?? null));

  return uso;
}
