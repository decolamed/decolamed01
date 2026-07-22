import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { alunoTemCopiloto } from "@/lib/copiloto/permissao";
import type { CronogramaDia } from "@/types/database";
import { CronogramaCopiloto } from "@/components/aluno/cronograma-copiloto";

const DIAS_SEMANA_LABEL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default async function AlunoCronogramaPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const temCopiloto = await alunoTemCopiloto(profile.id);

  // ==== MODO COPILOTO (aluno tem plano com cronograma adaptativo) ====
  if (temCopiloto) {
    const hoje = new Date();
    const hojeStr = hoje.toISOString().slice(0, 10);
    const fim = new Date(hoje);
    fim.setDate(fim.getDate() + 7);
    const fimStr = fim.toISOString().slice(0, 10);

    const { data: missoes } = await supabase
      .from("aluno_missoes")
      .select("*")
      .eq("aluno_id", profile.id)
      .gte("data", hojeStr)
      .lte("data", fimStr)
      .order("data")
      .order("prioridade", { ascending: false });

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
          <p className="font-display font-bold">✈️ Rota adaptativa do Copiloto</p>
          <p className="mt-1 text-white/70">
            Seu cronograma é ajustado conforme seu desempenho. Quando o Copiloto identifica algo que vale
            revisar, ele adiciona missões extras aqui automaticamente.
          </p>
        </div>

        <CronogramaCopiloto missoes={missoes ?? []} hojeStr={hojeStr} />
      </div>
    );
  }

  // ==== MODO FALLBACK (cronograma fixo semanal, planos sem Copiloto) ====
  const { data } = await supabase.from("cronograma_dias").select("*");
  const porDia = new Map((data as CronogramaDia[] ?? []).map((d) => [d.dia_semana, d]));
  const hoje = new Date().getDay();
  const missaoHoje = porDia.get(hoje);

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
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Hoje · {DIAS_SEMANA_LABEL[hoje]}</p>
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
          const éHoje = i === hoje;
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
