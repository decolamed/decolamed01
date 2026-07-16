import { redirect } from "next/navigation";
import { requireAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { verificarAcessoMatricula, type MotivoAcessoBloqueado } from "@/lib/matricula/acesso";
import { montarLinkWhatsapp } from "@/lib/site/whatsapp";

const TITULOS: Record<MotivoAcessoBloqueado, string> = {
  sem_matricula: "Nenhuma matrícula encontrada",
  pendente: "Pagamento pendente",
  bloqueada: "Acesso bloqueado",
  cancelada: "Matrícula cancelada",
  expirada: "Seu acesso expirou"
};

export default async function AcessoExpiradoPage() {
  // Só requireAluno() aqui (sem checagem de matrícula) — de propósito, para
  // não criar loop de redirect com o middleware/requireAcessoAluno(), que
  // mandam justamente para esta página quando o acesso está bloqueado.
  const profile = await requireAluno();
  const supabase = createClient();
  const acesso = await verificarAcessoMatricula(supabase, profile.id);

  // Se por algum motivo o aluno chegou aqui com o acesso em dia (ex.: o
  // admin acabou de reativar a matrícula), não faz sentido deixá-lo preso
  // numa página de erro — manda de volta para a plataforma.
  if (acesso.liberado) {
    redirect("/aluno");
  }

  const { data: config } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", "site.contato.whatsapp")
    .maybeSingle();
  const numeroWhatsapp = config?.valor as string | undefined;
  const motivo = acesso.motivo ?? "expirada";

  // Não existe mais catálogo público de planos — renovação/reativação agora
  // passa sempre pelo suporte, que gera um novo link específico (ou reativa
  // manualmente em /admin/matriculas).
  const linkRenovar = montarLinkWhatsapp(
    numeroWhatsapp,
    "Olá! Meu acesso à plataforma Decola Med está indisponível e eu gostaria de renovar/reativar meu plano."
  );
  const linkSuporte = montarLinkWhatsapp(numeroWhatsapp);

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="rounded-2xl bg-white p-8 shadow">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange/10 text-2xl">
          ⏳
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-navy-dark">{TITULOS[motivo]}</h1>
        <p className="mt-3 text-navy-dark/70">{acesso.mensagem}</p>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={linkRenovar}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
          >
            Renovar meu plano
          </a>
          <a
            href={linkSuporte}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-navy/20 px-6 py-3 font-display font-semibold text-navy-dark hover:bg-navy/5"
          >
            Falar com o suporte
          </a>
        </div>
      </div>
    </div>
  );
}
