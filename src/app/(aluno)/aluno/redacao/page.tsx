import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { montarLinkWhatsapp } from "@/lib/site/whatsapp";

const PASSOS = [
  { icone: "✏️", titulo: "1. Escolha um tema", desc: "Acesse a Base de Temas (link abaixo) ou os materiais de Estudos." },
  { icone: "📝", titulo: "2. Escreva sua redação", desc: "Pode ser digitada ou escrita à mão (foto legível)." },
  { icone: "📤", titulo: "3. Envie pelo WhatsApp", desc: "Mande direto para a professora de redação pelo botão abaixo." },
  { icone: "✅", titulo: "4. Correção pelo WhatsApp", desc: "A professora corrige e devolve com comentários pelo próprio WhatsApp." },
  { icone: "⭐", titulo: "5. Crédito consumido após a correção", desc: "Só desconta quando a professora confirmar a correção realizada." }
];

export default async function AlunoRedacaoPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const [{ data: perfilComPlano }, { data: consumidos }, { data: configs }] = await Promise.all([
    supabase.from("profiles").select("planos(creditos_redacao)").eq("id", profile.id).maybeSingle(),
    supabase.from("redacoes_creditos_consumidos").select("id").eq("aluno_id", profile.id),
    supabase.from("configuracoes").select("chave, valor").in("chave", ["redacao.whatsapp", "redacao.base_temas_url"])
  ]);

  const creditosTotais = (perfilComPlano as any)?.planos?.creditos_redacao ?? 0;
  const totalConsumidos = (consumidos ?? []).length;
  const creditosDisponiveis = Math.max(0, creditosTotais - totalConsumidos);

  const mapaConfig = new Map((configs ?? []).map((c: any) => [c.chave, c.valor]));
  const numeroWhatsapp = mapaConfig.get("redacao.whatsapp") as string | undefined;
  const baseTemasUrl = mapaConfig.get("redacao.base_temas_url") as string | undefined;

  const linkWhatsapp = montarLinkWhatsapp(
    numeroWhatsapp,
    "Olá! Quero enviar minha redação para correção. ✍️"
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">✍️ Redação</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      <div
        className="mt-6 rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Seus créditos de redação</p>
        <p className="mt-1 font-display text-3xl font-extrabold">{creditosDisponiveis} disponíve{creditosDisponiveis !== 1 ? "is" : "l"}</p>
        <p className="mt-1 text-sm text-white/70">
          {totalConsumidos} já corrigida{totalConsumidos !== 1 ? "s" : ""} de {creditosTotais} incluída{creditosTotais !== 1 ? "s" : ""} no seu plano
        </p>
      </div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-navy-dark/50">Como funciona</p>
      <div className="mt-3 space-y-2">
        {PASSOS.map((p) => (
          <div key={p.titulo} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-lg">
              {p.icone}
            </span>
            <div>
              <p className="font-display font-bold text-navy-dark">{p.titulo}</p>
              <p className="text-sm text-navy-dark/60">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-navy/5 p-4 text-sm text-navy-dark/70">
        A redação <strong>não é enviada pela plataforma</strong> — todo o envio e acompanhamento acontecem pelo
        WhatsApp da professora. Aqui você só acompanha os seus créditos.
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-green-600 px-6 py-3 text-center font-display font-bold text-white hover:bg-green-700"
        >
          Enviar redação pelo WhatsApp →
        </a>
        {baseTemasUrl && (
          <a
            href={baseTemasUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full border-2 border-navy/20 px-6 py-3 text-center font-display font-semibold text-navy-dark hover:bg-navy/5"
          >
            Base de Temas →
          </a>
        )}
      </div>
    </div>
  );
}
