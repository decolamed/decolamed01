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

// O cronograma (trilha_dias) é a BASE de estudo de todo mundo — inclusive de
// quem tem Copiloto. As missões individuais (aluno_missoes) são um ACRÉSCIMO
// adaptativo em cima dele, não um substituto.
//
// Esta página ramificava em "tem Copiloto? → só missões" e nunca chegava ao
// cronograma: um aluno do plano PRO sem missões geradas via "sem cronograma"
// mesmo com os dias todos preenchidos pelo admin. Agora as duas fontes são
// buscadas sempre e renderizadas juntas.
export default async function AlunoCronogramaPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const temCopiloto = await alunoTemCopiloto(profile.id);

  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const fim = new Date(hoje);
  fim.setDate(fim.getDate() + 7);
  const fimStr = fim.toISOString().slice(0, 10);

  const [{ data: missoesBrutas }, { data: matricula }] = await Promise.all([
    supabase
      .from("aluno_missoes")
      .select("*")
      .eq("aluno_id", profile.id)
      .gte("data", hojeStr)
      .lte("data", fimStr)
      .order("data")
      .order("prioridade", { ascending: false }),
    supabase
      .from("matriculas")
      .select("acesso_liberado_em")
      .eq("aluno_id", profile.id)
      .not("acesso_liberado_em", "is", null)
      .order("acesso_liberado_em", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  // ---- Dia de hoje no cronograma ----
  let diaAtual: number | null = null;
  let diaTrilha: TrilhaDia | null = null;
  if (matricula?.acesso_liberado_em) {
    diaAtual = calcularDiaTrilha(matricula.acesso_liberado_em);
    const { data } = await supabase.from("trilha_dias").select("*").eq("dia_numero", diaAtual).maybeSingle();
    diaTrilha = (data as TrilhaDia) ?? null;
  }

  // ---- Missões individuais (Copiloto ou cadastradas pelo admin) ----
  const idsAula = (missoesBrutas ?? []).filter((m) => m.tipo === "aula" && m.ref_id).map((m) => m.ref_id as string);
  const urlsAula = new Map<string, string>();
  if (idsAula.length > 0) {
    const { data: conteudos } = await supabase.from("conteudos_biblioteca").select("id, url").in("id", idsAula);
    (conteudos ?? []).forEach((c) => c.url && urlsAula.set(c.id, c.url));
  }
  const missoes = (missoesBrutas ?? []).map((m) => ({ ...m, href: montarHref(m.tipo, m.ref_id, urlsAula) }));

  const semNada = !diaTrilha && missoes.length === 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">🗓️ Cronograma</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      {temCopiloto && (
        <div className="mt-4 rounded-2xl p-4 text-sm text-white" style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}>
          <p className="font-display font-bold">✈️ Rota adaptativa do Copiloto</p>
          <p className="mt-1 text-white/70">
            Você segue o cronograma abaixo e, quando o Copiloto identifica algo que vale revisar, ele acrescenta missões extras
            automaticamente.
          </p>
        </div>
      )}

      {diaTrilha && (
        <>
          <div className="mt-4 rounded-2xl p-4 text-sm text-white" style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Dia {diaAtual}</p>
            <p className="mt-1 font-display font-bold">{diaTrilha.titulo}</p>
            <p className="mt-1 text-white/70">Sua missão de hoje, a partir do seu início na plataforma.</p>
          </div>

          <div className="mt-4 space-y-2">
            {diaTrilha.itens.length === 0 && (
              <p className="rounded-2xl bg-white p-4 text-sm text-navy-dark/60 shadow">
                Dia livre — aproveite pra revisar o que quiser.
              </p>
            )}
            {diaTrilha.itens.map((item, i) => {
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
        </>
      )}

      {missoes.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-lg font-bold text-navy-dark">
            {temCopiloto ? "Missões extras do Copiloto" : "Missões individuais"}
          </h2>
          <CronogramaCopiloto missoes={missoes} hojeStr={hojeStr} />
        </>
      )}

      {semNada && (
        <div className="mt-6 rounded-2xl p-6 text-white" style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}>
          <p className="font-display text-xl font-bold">Sem missão cadastrada hoje</p>
          <p className="mt-2 text-sm text-white/70">Fale com a coordenação ou aguarde o próximo dia do cronograma.</p>
        </div>
      )}
    </div>
  );
}
