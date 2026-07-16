import Image from "next/image";
import Link from "next/link";

// Este navbar só aparece nas páginas de inscrição/confirmação de pagamento
// (/inscricao/[slug] e /matricula/confirmacao) — não existe mais site de
// vendas navegável, então não há mais CTA nem links de navegação aqui, só a
// marca.
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-dark/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Decola Med" width={40} height={40} className="rounded-md" />
          <span className="font-display text-lg font-bold text-white">Decola Med</span>
        </Link>
      </nav>
    </header>
  );
}
