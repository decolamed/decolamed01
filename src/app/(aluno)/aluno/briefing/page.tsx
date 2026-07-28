import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { getNomeVestibular } from "@/lib/site/marca";
import { BriefingWizard } from "@/components/aluno/briefing-wizard";

// Reprodução fiel do scrOnb do protótipo (arquivo Decola_Med_App_dc.html).
// 3 passos: intro → briefing → animação "calculando rota" → decolar. Ao
// concluir, o aluno vai direto pro slideboard (/aluno/tutorial), e depois
// pra /aluno.
export default async function AlunoBriefingPage({
  searchParams
}: {
  searchParams: { erro?: string };
}) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const [{ data: briefing }, nomeVestibular] = await Promise.all([
    supabase.from("aluno_briefing").select("*").eq("aluno_id", profile.id).maybeSingle(),
    getNomeVestibular()
  ]);

  return <BriefingWizard briefingInicial={briefing as any} erro={searchParams.erro} nomeVestibular={nomeVestibular} />;
}
