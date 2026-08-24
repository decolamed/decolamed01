import { redirect } from "next/navigation";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { alunoTemCopiloto } from "@/lib/copiloto/permissao";
import { createClient } from "@/lib/supabase/server";
import { getNomeVestibular } from "@/lib/site/marca";
import { getMateriasDoConteudo } from "@/lib/site/materias";
import { BriefingWizard } from "@/components/aluno/briefing-wizard";

// Reprodução fiel do scrOnb do protótipo (arquivo Decola_Med_App_dc.html).
// 3 passos: intro → briefing → animação "calculando rota" → decolar. Ao
// concluir, o aluno vai direto pro slideboard (/aluno/tutorial), e depois
// pra /aluno.
// O aluno chega aqui logo depois de um Redefinir Perfil, que acabou de
// apagar o briefing. Uma versão em cache traria de volta as respostas
// antigas no formulário e daria a impressão de que o reset não funcionou.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AlunoBriefingPage({
  searchParams
}: {
  searchParams: { erro?: string };
}) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const [{ data: briefing }, nomeVestibular, materias, temCopiloto] = await Promise.all([
    supabase.from("aluno_briefing").select("*").eq("aluno_id", profile.id).maybeSingle(),
    getNomeVestibular(),
    getMateriasDoConteudo(),
    alunoTemCopiloto(profile.id)
  ]);

  // O briefing INICIAL do Voo Guiado é do mentor, não do aluno: ele é
  // preenchido no painel administrativo depois da mentoria. Sem esta guarda,
  // bastava digitar /aluno/briefing para contornar o fluxo novo e criar um
  // cronograma por conta própria — que é justamente o que a mudança tirou.
  //
  // Depois que o mentor envia, esta mesma tela volta a ser o RECALIBRAR VOO,
  // que continua sendo do aluno.
  if (temCopiloto && !briefing) {
    redirect("/aluno/cronograma");
  }

  // O DECOLANDO NÃO TEM BRIEFING. O cronograma dele é fixo — os mesmos 40
  // blocos, sem data de prova, sem dias da semana, sem horas por dia. Antes
  // esta tela só não era alcançada porque nada linkava para cá; bastava
  // digitar o endereço para responder um questionário que não muda nada no
  // plano dele, e ainda gravar um briefing que faria o resto da plataforma
  // tratá-lo como aluno de plano adaptativo.
  if (!temCopiloto) {
    redirect("/aluno");
  }

  return (
    <BriefingWizard
      briefingInicial={briefing as any}
      erro={searchParams.erro}
      nomeVestibular={nomeVestibular}
      materias={materias}
    />
  );
}
