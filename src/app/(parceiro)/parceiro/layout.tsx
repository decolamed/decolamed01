import Image from "next/image";
import { requireParceiro } from "@/lib/auth/permissions";
import { LogoutButton } from "@/components/auth/logout-button";

// Área isolada do parceiro/afiliado. requireParceiro() garante que só um
// usuário com role 'parceiro' chega até aqui (admin e aluno são
// redirecionados pelo middleware antes mesmo de renderizar este layout).
// Nenhuma navegação aqui aponta para /admin — o parceiro não tem acesso ao
// painel administrativo geral, por definição.
export default async function ParceiroLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireParceiro();

  return (
    <div className="min-h-screen bg-sky">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Decola Med" width={36} height={36} />
          <span className="font-display font-bold text-navy-dark">Área do parceiro</span>
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
