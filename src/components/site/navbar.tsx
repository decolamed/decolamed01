import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-dark/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Decola Med" width={40} height={40} className="rounded-md" />
          <span className="font-display text-lg font-bold text-white">Decola Med</span>
        </Link>
        <div className="flex items-center gap-6 font-body text-sm font-semibold text-white/90">
          <Link href="/" className="hover:text-orange">Sobre a plataforma</Link>
          <Link
            href="/planos"
            className="rounded-full bg-orange px-4 py-2 text-white shadow-md shadow-orange/30 transition hover:bg-orange-dark"
          >
            Quero agora
          </Link>
        </div>
      </nav>
    </header>
  );
}
