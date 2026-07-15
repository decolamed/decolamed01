import { createClient } from "@/lib/supabase/server";

export default async function ContatoPage() {
  const supabase = createClient();
  const { data: config } = await supabase
    .from("configuracoes")
    .select("chave, valor")
    .in("chave", ["site.contato.whatsapp", "site.contato.instagram"]);

  const whatsapp = (config?.find((c) => c.chave === "site.contato.whatsapp")?.valor as string) ?? "";
  const instagram = (config?.find((c) => c.chave === "site.contato.instagram")?.valor as string) ?? "decolamed";

  return (
    <section className="mx-auto max-w-2xl px-5 py-16 text-center">
      <h1 className="font-display text-3xl font-extrabold text-white">Fale conosco</h1>
      <p className="mt-3 text-white/70">
        Tire suas dúvidas sobre planos, matrícula ou pagamento antes de decolar.
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <a
          href={`https://wa.me/${whatsapp}`}
          className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white shadow-lg shadow-orange/30 hover:bg-orange-dark"
        >
          Falar no WhatsApp
        </a>
        <a href={`https://instagram.com/${instagram}`} className="text-white/70 underline">
          @{instagram}
        </a>
      </div>
    </section>
  );
}
