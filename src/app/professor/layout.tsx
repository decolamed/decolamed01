import Image from "next/image";
import { requireProfessor } from "@/lib/auth/permissions";
import { LogoutButton } from "@/components/auth/logout-button";

// Área isolada do professor (correção de redações). requireProfessor()
// garante que só um usuário com role 'professor' chega até aqui — os
// demais papéis são redirecionados pelo middleware antes de renderizar
// este layout. Sem navegação pro /admin: o professor não tem acesso ao
// resto do painel administrativo.
export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfessor();

  return (
    <div className="min-h-screen bg-sky">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Decola Med" width={36} height={36} />
          <span className="font-display font-bold text-navy-dark">Painel do professor</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-navy-dark/70">Olá, {profile.nome.split(" ")[0]}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
