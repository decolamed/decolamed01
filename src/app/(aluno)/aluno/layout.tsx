import { requireAluno } from "@/lib/auth/permissions";

// Sem chrome visual aqui de propósito: a página principal (/aluno) é um app
// imersivo com sua própria navegação (cabeçalho, abas, menus) — ver
// decola-app.tsx. A única outra página desta área (/aluno/acesso-expirado)
// tem seu próprio cabeçalho simples.
export default async function AlunoLayout({ children }: { children: React.ReactNode }) {
  await requireAluno();
  return <>{children}</>;
}
