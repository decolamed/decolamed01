import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { SimuladoRunner } from "@/components/aluno/simulado-runner";
import type { Simulado } from "@/types/database";

export default async function AlunoSimuladoPage({ params }: { params: { id: string } }) {
  await requireAcessoAluno();
  const supabase = createClient();

  const { data: simulado } = await supabase.from("simulados").select("*").eq("id", params.id).eq("ativo", true).maybeSingle();
  if (!simulado) notFound();

  // IMPORTANTE: nunca selecionar resposta_correta aqui — essa página vira
  // props de um Client Component, e tudo que for pra props de Client
  // Component acaba indo pro HTML/JS que chega no navegador. A correção só
  // acontece no servidor, em actions.ts, depois que o aluno já respondeu.
  const { data: itens } = await supabase
    .from("simulado_questoes")
    .select("questao_id, ordem, questoes(id, enunciado, alternativas, materia)")
    .eq("simulado_id", params.id)
    .order("ordem");

  const questoes = (itens ?? []).map((item: any) => item.questoes).filter(Boolean);

  if (questoes.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <p className="text-navy-dark/70">Este simulado ainda não tem questões cadastradas.</p>
        <Link href="/aluno/simulados" className="mt-4 inline-block text-navy hover:underline">
          ← Voltar
        </Link>
      </div>
    );
  }

  return (
    <SimuladoRunner
      simuladoId={params.id}
      titulo={(simulado as Simulado).titulo}
      tempoMinutos={(simulado as Simulado).tempo_minutos}
      questoes={questoes}
    />
  );
}
