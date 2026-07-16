import { redirect } from "next/navigation";

// Formulário genérico de matrícula (sem plano fixo) descontinuado — a
// inscrição agora só acontece pelo link específico de cada plano, gerado em
// /admin/planos (/inscricao/[slug]).
export default function MatriculaPage() {
  redirect("/login");
}
