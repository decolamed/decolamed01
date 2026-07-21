import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth/permissions";
import { LogoutButton } from "@/components/auth/logout-button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

const NAV = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/vendas", label: "Vendas" },
  { href: "/admin/planos", label: "Planos" },
  { href: "/admin/cupons", label: "Cupons" },
  { href: "/admin/matriculas", label: "Matrículas" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/questoes", label: "Banco de questões" },
  { href: "/admin/configuracoes", label: "Configurações do site" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-sky">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-navy-dark p-5 text-white sm:flex">
        <div className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Decola Med" width={32} height={32} />
          <span className="font-display font-bold">Painel admin</span>
        </div>
        <nav className="mt-8 flex flex-col gap-1 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 hover:bg-white/10">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="relative flex-1">
        <header className="flex items-center justify-between gap-3 border-b bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Só aparece em telas pequenas — a barra lateral acima cobre telas grandes. */}
            <AdminMobileNav nav={NAV} />
            <span className="text-sm text-navy-dark/70">Logado como {profile.nome}</span>
          </div>
          <LogoutButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
