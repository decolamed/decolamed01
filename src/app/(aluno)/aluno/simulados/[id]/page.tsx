import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { getNomeVestibular, rotuloNotaPonderada } from "@/lib/site/marca";
import { SimuladoRunner, type PropostaRedacao } from "@/components/aluno/simulado-runner";
import { normalizarIdioma } from "@/lib/site/idioma-aluno";
import { PaginaAluno, CartaoAluno } from "@/components/aluno/pagina-aluno";
import type { Simulado } from "@/types/database";

export default async function AlunoSimuladoPage({ params }: { params: { id: string } }) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { data: simulado } = await supabase.from("simulados").select("*").eq("id", params.id).eq("ativo", true).maybeSingle();
  if (!simulado) notFound();

  // Idioma já escolhido no briefing: quando o simulado tem a variável de
  // idioma ligada, ele entra como sugestão inicial para o aluno não precisar
  // responder duas vezes a mesma pergunta.
  const { data: briefing } = await supabase
    .from("aluno_briefing")
    .select("idioma_prova")
    .eq("aluno_id", profile.id)
    .maybeSingle();

  // IMPORTANTE: nunca selecionar resposta_correta aqui — essa página vira
  // props de um Client Component, e tudo que for pra props de Client
  // Component acaba indo pro HTML/JS que chega no navegador. A correção só
  // acontece no servidor, em actions.ts, depois que o aluno já respondeu.
  const { data: itens } = await supabase
    .from("simulado_questoes")
    .select("questao_id, ordem, questoes(id, enunciado, alternativas, materia, imagens)")
    .eq("simulado_id", params.id)
    .order("ordem");

  const questoes = (itens ?? []).map((item: any) => item.questoes).filter(Boolean);
  const titulo = (simulado as Simulado).titulo;

  // O simulado é aberto pela aba Atividades (as duas listagens foram
  // unificadas na visão do aluno), então o "voltar" leva para lá e a moldura
  // é a mesma — sair da lista e cair num visual diferente é o que fazia a
  // execução parecer outro produto.
  if (questoes.length === 0) {
    return (
      <PaginaAluno titulo={titulo} voltarPara="/aluno/atividades" rotuloVoltar="Voltar às atividades">
        <CartaoAluno className="py-10 text-center">
          <p className="text-sm font-semibold text-navy-dark/50">
            Este simulado ainda não tem questões cadastradas.
          </p>
        </CartaoAluno>
      </PaginaAluno>
    );
  }

  const nomeVestibular = await getNomeVestibular();

  return (
    <PaginaAluno titulo={titulo} voltarPara="/aluno/atividades" rotuloVoltar="Voltar às atividades">
      <SimuladoRunner
        simuladoId={params.id}
        titulo={titulo}
        tempoMinutos={(simulado as Simulado).tempo_minutos}
        questoes={questoes}
        rotuloNota={rotuloNotaPonderada(nomeVestibular)}
        nomeVestibular={nomeVestibular}
        variavelIdioma={Boolean((simulado as { variavel_idioma?: boolean }).variavel_idioma)}
        idiomaDoBriefing={normalizarIdioma(briefing?.idioma_prova)}
        redacao={(simulado as { redacao?: PropostaRedacao | null }).redacao ?? null}
      />
    </PaginaAluno>
  );
}
