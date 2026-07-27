import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { montarLinkWhatsapp } from "@/lib/site/whatsapp";
import DecolaApp from "./decola-app";

export default async function AlunoHomePage() {
  // Camada 2 de proteção (a camada 1 é o middleware): garante que mesmo que
  // a rota seja alcançada por algum outro caminho, o conteúdo só renderiza
  // para quem tem matrícula ativa e dentro do prazo.
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const [{ data: matricula }, { data: config }] = await Promise.all([
    supabase
      .from("matriculas")
      .select("planos(nome)")
      .eq("aluno_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("configuracoes").select("valor").eq("chave", "site.contato.whatsapp").maybeSingle()
  ]);

  const planoNome = (matricula as any)?.planos?.nome as string | undefined;
  const plano = planoNome && planoNome.toLowerCase().includes("guiado") ? "voo-guiado" : "decolando";
  const numeroWhatsapp = config?.valor as string | undefined;

  return (
    <DecolaApp
      nome={profile.nome}
      email={profile.email}
      plano={plano}
      whatsappSuporte={montarLinkWhatsapp(numeroWhatsapp, "Olá! Preciso de ajuda com a plataforma Decola Med.")}
      whatsappRedacao={montarLinkWhatsapp(numeroWhatsapp, "Olá! Quero enviar minha redação ✍")}
    />
  );
}
