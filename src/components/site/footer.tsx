import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-navy-dark px-5 py-10 text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm">
        <div className="flex flex-col gap-1">
          <span className="font-display text-base font-bold text-white">Decola Med</span>
          <p>Preparação estratégica para aprovação em Medicina.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/planos" className="hover:text-orange">Planos</Link>
          <Link href="/contato" className="hover:text-orange">Fale conosco</Link>
          <Link href="#" className="hover:text-orange">Condições e suporte</Link>
          <Link href="#" className="hover:text-orange">Política de privacidade</Link>
        </div>
        <p className="text-xs text-white/40">
          Pagamentos processados pela Asaas, instituição regulamentada pelo Banco Central do Brasil.
        </p>
      </div>
    </footer>
  );
}
