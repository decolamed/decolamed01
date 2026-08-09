import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { AtividadeRunner } from "@/components/aluno/atividade-runner";
import { PaginaAluno, CartaoAluno } from "@/components/aluno/pagina-aluno";
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

  // Mesma moldura da listagem: quem entra numa atividade continua na aba
  // Atividades, e a tela de execução não pode parecer outro lugar.
  if (questoes.length === 0) {
    return (
      <PaginaAluno titulo={a.titulo} voltarPara="/aluno/atividades" rotuloVoltar="Voltar às atividades">
        <CartaoAluno className="py-10 text-center">
          <p className="text-sm font-semibold text-navy-dark/50">
            Essa atividade ainda não tem questões cadastradas.
          </p>
        </CartaoAluno>
      </PaginaAluno>
    );
  }

  return (
    <PaginaAluno titulo={a.titulo} voltarPara="/aluno/atividades" rotuloVoltar="Voltar às atividades">
      <AtividadeRunner
        atividadeId={a.id}
        titulo={a.titulo}
        gabaritoModo={a.gabarito_modo}
        tempoLimiteMinutos={a.tempo_limite_minutos}
        questoes={questoes}
      />
    </PaginaAluno>
  );
}
