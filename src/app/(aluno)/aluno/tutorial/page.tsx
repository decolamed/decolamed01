import { requireAcessoAluno } from "@/lib/auth/permissions";
import { TutorialSlideboard } from "@/components/aluno/tutorial-slideboard";

export default async function AlunoTutorialPage() {
  await requireAcessoAluno();
  return <TutorialSlideboard />;
}
