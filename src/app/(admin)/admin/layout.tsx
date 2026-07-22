import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth/permissions";
import { LogoutButton } from "@/components/auth/logout-button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { Icon } from "@/components/admin/icon";

// Grupo "Gestão" segue a mesma ordem/rótulos do design "Decola Med Admin"
// (Torre de Comando) — Matrículas não existe no design (que trata acesso
// dentro de Usuários), mas é uma tela real e importante deste projeto, então
// fica junto do grupo de gestão.
const GRUPO_GESTAO = [
  { href: "/admin", label: "Visão Geral", icon: "gauge" },
  { href: "/admin/vendas", label: "Vendas", icon: "money" },
  { href: "/admin/usuarios", label: "Usuários", icon: "user" },
  { href: "/admin/matriculas", label: "Matrículas", icon: "file" },
  { href: "/admin/planos", label: "Planos", icon: "ticket" },
  { href: "/admin/cupons", label: "Cupons", icon: "gift" },
  { href: "/admin/notificacoes", label: "Notificações", icon: "bell" },
  { href: "/admin/relatos", label: "Relatos de Erros", icon: "alert" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "gear" }
] as const;

// Grupo "Conteúdo" — telas de gestão do material de estudo do app do aluno.
// Ainda sem tabela no banco (ver PreviewBanner em cada página / seção 10 do
// ARCHITECTURE.md): a interação é real, os dados vivem só na sessão do
// navegador.
const GRUPO_CONTEUDO = [
  { href: "/admin/cursos", label: "Cursos & Aulas", icon: "video" },
  { href: "/admin/cronograma", label: "Cronograma & Missões", icon: "calendar" },
  { href: "/admin/questoes", label: "Banco de Questões", icon: "target" },
  { href: "/admin/simulados", label: "Simulados", icon: "file" },
  { href: "/admin/flashcards", label: "Flashcards", icon: "cards" },
  { href: "/admin/pdfs", label: "PDFs", icon: "file" },
  { href: "/admin/links", label: "Links Externos", icon: "link2" },
  { href: "/admin/banners", label: "Banners", icon: "image" },
  { href: "/admin/conquistas", label: "Conquistas", icon: "trophy" }
] as const;

const NAV = [...GRUPO_GESTAO, ...GRUPO_CONTEUDO];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-sky font-[family-name:var(--font-montserrat)]">
      <aside className="sticky top-0 hidden h-screen w-[238px] shrink-0 flex-col overflow-y-auto bg-gradient-to-b from-[#0d4a79] to-navy-dark p-3.5 pb-4 pt-5 sm:flex">
        <Image src="/assets/logo.png" alt="Decola Med" width={32} height={32} className="ml-2 mb-1" />
        <div className="ml-2 mb-2 text-[9.5px] font-extrabold uppercase tracking-widest text-white/45">
          Torre de Comando · Admin
        </div>
        <div className="mb-1 ml-3 mt-2 text-[9px] font-extrabold uppercase tracking-widest text-white/35">Gestão</div>
        <nav className="flex flex-col gap-0.5">
          {GRUPO_GESTAO.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-[11px] px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mb-1 ml-3 mt-3 text-[9px] font-extrabold uppercase tracking-widest text-white/35">Conteúdo</div>
        <nav className="flex flex-col gap-0.5">
          {GRUPO_CONTEUDO.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-[11px] px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <Link
          href="/aluno"
          className="mb-1.5 flex items-center gap-2.5 rounded-[11px] bg-white/[0.08] px-3 py-2.5 text-[11.5px] font-bold text-white"
        >
          <Icon name="plane" size={15} className="text-[#F8935A]" />
          Ver app do aluno →
        </Link>
        <div className="px-3 py-2">
          <LogoutButton />
        </div>
      </aside>

      <div className="relative flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-navy-dark/10 bg-white px-6 py-3.5 sm:hidden">
          <AdminMobileNav nav={NAV as unknown as { href: string; label: string }[]} />
          <span className="text-xs font-semibold text-navy-dark/60">Olá, {profile.nome.split(" ")[0]}</span>
        </header>
        <main className="p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
