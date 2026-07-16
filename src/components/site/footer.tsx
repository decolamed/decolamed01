import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { montarLinkWhatsapp } from "@/lib/site/whatsapp";

export async function SiteFooter() {
  const supabase = createClient();
  const { data: config } = await supabase
    .from("configuracoes")
    .select("chave, valor")
    .in("chave", ["site.contato.whatsapp", "site.contato.instagram"]);

  const whatsapp = (config?.find((c) => c.chave === "site.contato.whatsapp")?.valor as string) ?? "";
  const instagram = (config?.find((c) => c.chave === "site.contato.instagram")?.valor as string) ?? "decolamed";

  return (
    <footer className="border-t border-white/10 bg-navy-dark px-5 py-10 text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm">
        <div className="flex flex-col gap-1">
          <span className="font-display text-base font-bold text-white">Decola Med</span>
          <p>Preparação estratégica para aprovação em Medicina.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="hover:text-orange">Sobre a plataforma</Link>
          <Link href="/planos" className="hover:text-orange">Planos</Link>
          <Link href="/contato" className="hover:text-orange">Suporte</Link>
          <span className="text-white/40">Política de privacidade (em breve)</span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Fale conosco:</span>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={montarLinkWhatsapp(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
            >
              WhatsApp
            </a>
            <a
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange"
            >
              @{instagram}
            </a>
          </div>
        </div>

        <p className="text-xs text-white/40">
          Pagamentos processados pela Asaas, instituição regulamentada pelo Banco Central do Brasil.
        </p>
      </div>
    </footer>
  );
}
