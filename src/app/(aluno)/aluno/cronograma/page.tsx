import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { alunoTemCopiloto } from "@/lib/copiloto/permissao";
import { calcularDiaTrilha } from "@/lib/trilha/dia";
import type { TrilhaDia, TrilhaItem } from "@/types/database";
import { CronogramaCopiloto } from "@/components/aluno/cronograma-copiloto";

const ICONE_TRILHA: Record<string, string> = {
  aula: "🎬",
  pdf: "📄",
  link: "🔗",
  questoes: "🎯",
  flashcards: "🃏",
  simulado: "⏱️",
  revisao: "🔁",
  livre: "☕"
};

// Monta o link de destino de cada missão a partir do tipo + ref_id. Sem isso
// a lista fica só de leitura; com isso o aluno toca no item e vai direto pra
// aula/atividade/simulado/redação real.
function montarHref(
  tipo: string,
  refId: string | null,
  urlsAula: Map<string, string>
): string | null {
  switch (tipo) {
    case "aula":
      return refId ? urlsAula.get(refId) ?? null : null;
    case "questoes":
      return refId ? `/aluno/atividades/${refId}` : "/aluno/questoes";
    case "simulado":
      return refId ? `/aluno/simulados/${refId}` : "/aluno/simulados";
    case "flashcards":
      return "/aluno/flashcards";
    default:
      return null;
  }
}

// Item da trilha já traz a URL da aula/pdf/link direto (sem precisar de
// join com conteudos_biblioteca/links_externos), então o link é bem mais
// simples que o do Copiloto.
function montarHrefTrilha(item: TrilhaItem): string | null {
  switch (item.tipo) {
    case "aula":
    case "pdf":
    case "link":
      return item.url;
    case "questoes":
      return item.materia ? `/aluno/questoes?materia=${encodeURIComponent(item.materia)}` : "/aluno/questoes";
    case "flashcards":
      return item.materia ? `/aluno/flashcards?materia=${encodeURIComponent(item.materia)}` : "/aluno/flashcards";
    case "simulado":
      return "/aluno/simulados";
    default:
      return null;
  }
}

export default async function AlunoCronogramaPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const temCopiloto = await alunoTemCopiloto(profile.id);

  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const fim = new Date(hoje);
  fim.setDate(fim.getDate() + 7);
  const fimStr = fim.toISOString().slice(0, 10);

  const { data: missoesBrutas } = await supabase
    .from("aluno_missoes")
    .select("*")
    .eq("aluno_id", profile.id)
    .gte("data", hojeStr)
    .lte("data", fimStr)
    .order("data")
    .order("prioridade", { ascending: false });

  // ==== MODO MISSÕES (Copiloto adaptativo OU missões avulsas do admin) ====
  if (temCopiloto || (missoesBrutas && missoesBrutas.length > 0)) {
    const idsAula = (missoesBrutas ?? []).filter((m) => m.tipo === "aula" && m.ref_id).map((m) => m.ref_id as string);
    const urlsAula = new Map<string, string>();
    if (idsAula.length > 0) {
      const { data: conteudos } = await supabase.from("conteudos_biblioteca").select("id, url").in("id", idsAula);
      (conteudos ?? []).forEach((c) => c.url && urlsAula.set(c.id, c.url));
    }

    const missoes = (missoesBrutas ?? []).map((m) => ({
      ...m,
      href: montarHref(m.tipo, m.ref_id, urlsAula)
    }));

    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-navy-dark">🗓️ Meu voo</h1>
          <Link href="/aluno" className="text-sm text-navy hover:underline">
            ← Voltar ao painel
          </Link>
        </div>

        <div
          className="mt-4 rounded-2xl p-4 text-sm text-white"
          style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}
        >
          <p className="font-display font-bold">✈️ {temCopiloto ? "Rota adaptativa do Copiloto" : "Programa de estudos"}</p>
          <p className="mt-1 text-white/70">
            {temCopiloto
              ? "Seu cronograma é ajustado conforme seu desempenho. Quando o Copiloto identifica algo que vale revisar, ele adiciona missões extras aqui automaticamente."
              : "Sua trilha de estudos, dia a dia, a partir do seu início na plataforma."}
          </p>
        </div>

        <CronogramaCopiloto missoes={missoes} hojeStr={hojeStr} />
      </div>
    );
  }

  // ==== MODO TRILHA (programa padrão de 40 dias, sem Copiloto) ====
  // Dia 1 = data em que o acesso do aluno foi liberado (matriculas.acesso_liberado_em).
  const { data: matricula } = await supabase
    .from("matriculas")
    .select("acesso_liberado_em")
    .eq("aluno_id", profile.id)
    .not("acesso_liberado_em", "is", null)
    .order("acesso_liberado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (matricula?.acesso_liberado_em) {
    const diaAtual = calcularDiaTrilha(matricula.acesso_liberado_em);
    const { data: diaTrilha } = await supabase
      .from("trilha_dias")
      .select("*")
      .eq("dia_numero", diaAtual)
      .maybeSingle();

    if (diaTrilha) {
      const itens = (diaTrilha as TrilhaDia).itens;
      return (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-bold text-navy-dark">🗓️ Minha trilha</h1>
            <Link href="/aluno" className="text-sm text-navy hover:underline">
              ← Voltar ao painel
            </Link>
          </div>

          <div
            className="mt-4 rounded-2xl p-4 text-sm text-white"
            style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Dia {diaAtual}
            </p>
            <p className="mt-1 font-display font-bold">{(diaTrilha as TrilhaDia).titulo}</p>
            <p className="mt-1 text-white/70">Sua trilha de estudos, dia a dia, a partir do seu início na plataforma.</p>
          </div>

          <div className="mt-4 space-y-2">
            {itens.length === 0 && (
              <p className="rounded-2xl bg-white p-4 text-sm text-navy-dark/60 shadow">
                Dia livre — aproveite pra revisar o que quiser.
              </p>
            )}
            {itens.map((item, i) => {
              const href = montarHrefTrilha(item);
              const conteudo = (
                <>
                  <span className="text-xl">{ICONE_TRILHA[item.tipo] ?? "📌"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold text-navy-dark">{item.titulo}</p>
                    {item.materia && <p className="text-xs text-navy-dark/50">{item.materia}</p>}
                  </div>
                  {href && <span className="text-navy-dark/30">↗</span>}
                </>
              );
              return href ? (
                <a
                  key={i}
                  href={href}
                  target={item.tipo === "aula" || item.tipo === "pdf" || item.tipo === "link" ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow hover:bg-navy-dark/5"
                >
                  {conteudo}
                </a>
              ) : (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow">
                  {conteudo}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  }

  // ==== MODO SEM MISSÃO CADASTRADA ====
  // Sem Copiloto, sem missões avulsas e sem dia cadastrado no cronograma
  // (trilha_dias) para o dia atual do aluno — nada a mostrar além do aviso.
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">🗓️ Cronograma</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      <div
        className="mt-6 rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}
      >
        <p className="mt-1 font-display text-xl font-bold">Sem missão cadastrada hoje</p>
        <p className="mt-2 text-sm text-white/70">Fale com a coordenação ou aguarde o próximo dia do cronograma.</p>
      </div>
    </div>
  );
}
