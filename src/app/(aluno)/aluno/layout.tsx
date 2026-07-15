import Image from "next/image";
import { requireAluno } from "@/lib/auth/permissions";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AlunoLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAluno();

  return (
    <div className="min-h-screen bg-sky">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Decola Med" width={36} height={36} />
          <span className="font-display font-bold text-navy-dark">Área do aluno</span>
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
