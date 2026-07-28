import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { alunoTemCopiloto } from "@/lib/copiloto/permissao";
import type { CronogramaDia, TrilhaDia, TrilhaItem } from "@/types/database";
import { CronogramaCopiloto } from "@/components/aluno/cronograma-copiloto";

const DIAS_SEMANA_LABEL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const ICONE_TRILHA: Record<string, string> = {
  aula: "🎬",
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

// Item da trilha já traz a URL da aula direto (sem precisar de join com
// conteudos_biblioteca), então o link é bem mais simples que o do Copiloto.
function montarHrefTrilha(item: TrilhaItem): string | null {
  switch (item.tipo) {
    case "aula":
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

// Dia 1 da trilha é o dia em que o acesso do aluno foi liberado — não um dia
// fixo do calendário. Cada aluno começa no seu próprio dia 1, e o programa
// se estende por 40 dias corridos a partir daí.
function calcularDiaTrilha(acessoLiberadoEm: string): number {
  const inicio = new Date(acessoLiberadoEm.slice(0, 10) + "T00:00:00");
  const hoje = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");
  const diffDias = Math.floor((hoje.getTime() - inicio.getTime()) / 86400000);
  return Math.min(40, Math.max(1, diffDias + 1));
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
              Dia {diaAtual} de 40
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
                  target={item.tipo === "aula" ? "_blank" : undefined}
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

  // ==== MODO FALLBACK (cronograma fixo semanal, sem missões geradas) ====
  const { data } = await supabase.from("cronograma_dias").select("*");
  const porDia = new Map((data as CronogramaDia[] ?? []).map((d) => [d.dia_semana, d]));
  const diaSemanaHoje = hoje.getDay();
  const missaoHoje = porDia.get(diaSemanaHoje);

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
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Hoje · {DIAS_SEMANA_LABEL[diaSemanaHoje]}</p>
        <p className="mt-1 font-display text-xl font-bold">{missaoHoje?.titulo ?? "Sem missão cadastrada hoje"}</p>
        {missaoHoje && missaoHoje.atividades.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {missaoHoje.atividades.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white/85">
                <span>✈️</span> {a}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-white/70">Dia livre — aproveite pra revisar o que quiser.</p>
        )}
      </div>

      <h2 className="mt-8 font-display text-lg font-bold text-navy-dark">Semana completa</h2>
      <div className="mt-3 space-y-2">
        {DIAS_SEMANA_LABEL.map((nome, i) => {
          const dia = porDia.get(i);
          const éHoje = i === diaSemanaHoje;
          return (
            <div
              key={i}
              className={`rounded-2xl p-4 shadow ${éHoje ? "border-2 border-orange bg-orange/5" : "bg-white"}`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wide ${éHoje ? "text-orange-dark" : "text-navy-dark/50"}`}>
                {nome}{éHoje ? " · Hoje" : ""}
              </p>
              <p className="mt-1 font-display font-bold text-navy-dark">{dia?.titulo ?? "Dia livre"}</p>
              {dia && dia.atividades.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-sm text-navy-dark/60">
                  {dia.atividades.map((a, ai) => (
                    <li key={ai}>• {a}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

