import { requireAcessoAluno } from "@/lib/auth/permissions";
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
  const [{ data: briefing }, nomeVestibular, materias] = await Promise.all([
    supabase.from("aluno_briefing").select("*").eq("aluno_id", profile.id).maybeSingle(),
    getNomeVestibular(),
    getMateriasDoConteudo()
  ]);

  return (
    <BriefingWizard
      briefingInicial={briefing as any}
      erro={searchParams.erro}
      nomeVestibular={nomeVestibular}
      materias={materias}
    />
  );
}
