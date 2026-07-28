import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { AtividadeRunner } from "@/components/aluno/atividade-runner";
import type { Atividade } from "@/types/database";

export default async function AlunoAtividadePage({ params }: { params: { id: string } }) {
  await requireAcessoAluno();
  const supabase = createClient();

  const { data: atividade } = await supabase.from("atividades").select("*").eq("id", params.id).eq("ativo", true).maybeSingle();
  if (!atividade) notFound();
  const a = atividade as Atividade;

  // Sem resposta_correta: essa lista vira props de um Client Component — a
  // correção de verdade só acontece no servidor (corrigirQuestaoAtividade /
  // submeterAtividade), mesmo padrão de segurança usado em simulados.
  const { data: itens } = await supabase
    .from("atividade_questoes")
    .select("questao_id, ordem, questoes(id, enunciado, alternativas, imagens)")
    .eq("atividade_id", params.id)
    .order("ordem");

  const questoes = (itens ?? [])
    .filter((i: any) => i.questoes)
    .map((i: any) => ({
      id: i.questoes.id,
      enunciado: i.questoes.enunciado,
      alternativas: i.questoes.alternativas,
      imagens: i.questoes.imagens ?? []
    }));

  if (questoes.length === 0) {
    return (
      <div>
        <Link href="/aluno/atividades" className="text-sm text-navy hover:underline">← Voltar às atividades</Link>
        <p className="mt-6 text-center text-sm text-navy-dark/50">Essa atividade ainda não tem questões cadastradas.</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/aluno/atividades" className="text-sm text-navy hover:underline">← Voltar às atividades</Link>
      <div className="mt-3">
        <AtividadeRunner atividadeId={a.id} titulo={a.titulo} gabaritoModo={a.gabarito_modo} tempoLimiteMinutos={a.tempo_limite_minutos} questoes={questoes} />
      </div>
    </div>
  );
}
