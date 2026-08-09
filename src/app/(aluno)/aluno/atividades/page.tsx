import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// ATIVIDADES — aba única do aluno (item 13)
//
// Antes existiam duas abas separadas, "Atividades" e "Simulados", com o
// mesmo propósito para o aluno: abrir uma avaliação, responder e ver a nota.
// A separação era um detalhe de como o conteúdo foi cadastrado no admin, não
// algo que fizesse diferença para quem estuda.
//
// Agora existe só esta. Ela lista as duas origens juntas, e o que diferencia
// um item do outro é o TÍTULO que o administrador escreveu — "Simulado ENEM
// 2026" ou "Atividade de Física — Cinemática". Cada item continua abrindo o
// seu executor original, então nenhuma regra de nota, peso, cronômetro ou
// exibição de resultado mudou.
// ============================================================================

// A lista precisa refletir o que o admin publicou agora, não uma versão em
// cache de antes da última atividade criada.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ItemAvaliacao {
  id: string;
  titulo: string;
  href: string;
  totalQuestoes: number;
  minutos: number | null;
  materia: string | null;
  temRedacao: boolean;
  ultimaNota: number | null;
  criadoEm: string;
}

export default async function AlunoAtividadesPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const [
    { data: atividades },
    { data: tentativasAtividade },
    { data: questoesAtividade },
    { data: simulados },
    { data: tentativasSimulado },
    { data: questoesSimulado }
  ] = await Promise.all([
    supabase.from("atividades").select("*").eq("ativo", true).order("created_at", { ascending: false }),
    supabase.from("atividade_tentativas").select("atividade_id, nota, finalizado_em").eq("aluno_id", profile.id),
    supabase.from("atividade_questoes").select("atividade_id"),
    supabase.from("simulados").select("*").eq("ativo", true).order("created_at", { ascending: false }),
    supabase.from("simulado_tentativas").select("simulado_id, nota, finalizado_em").eq("aluno_id", profile.id),
    supabase.from("simulado_questoes").select("simulado_id")
  ]);

  const contar = (linhas: unknown[] | null, campo: string) => {
    const mapa = new Map<string, number>();
    (linhas ?? []).forEach((l) => {
      const id = (l as Record<string, string>)[campo];
      mapa.set(id, (mapa.get(id) ?? 0) + 1);
    });
    return mapa;
  };

  const ultimaNota = (linhas: unknown[] | null, campo: string) => {
    const mapa = new Map<string, number>();
    (linhas ?? []).forEach((l) => {
      const t = l as Record<string, unknown>;
      const id = t[campo] as string;
      mapa.set(id, Number(t.nota));
    });
    return mapa;
  };

  const qtdAtividade = contar(questoesAtividade, "atividade_id");
  const qtdSimulado = contar(questoesSimulado, "simulado_id");
  const notaAtividade = ultimaNota(tentativasAtividade, "atividade_id");
  const notaSimulado = ultimaNota(tentativasSimulado, "simulado_id");

  const itens: ItemAvaliacao[] = [
    ...((atividades ?? []) as Record<string, any>[]).map((a) => ({
      id: a.id as string,
      titulo: a.titulo as string,
      href: `/aluno/atividades/${a.id}`,
      totalQuestoes: qtdAtividade.get(a.id) ?? 0,
      minutos: (a.tempo_limite_minutos as number | null) ?? null,
      materia: (a.materia as string | null) ?? null,
      temRedacao: Boolean(a.redacao),
      ultimaNota: notaAtividade.get(a.id) ?? null,
      criadoEm: a.created_at as string
    })),
    ...((simulados ?? []) as Record<string, any>[]).map((s) => ({
      id: s.id as string,
      titulo: s.titulo as string,
      href: `/aluno/simulados/${s.id}`,
      totalQuestoes: qtdSimulado.get(s.id) ?? 0,
      minutos: (s.tempo_minutos as number | null) ?? null,
      materia: null,
      temRedacao: Boolean(s.redacao),
      ultimaNota: notaSimulado.get(s.id) ?? null,
      criadoEm: s.created_at as string
    }))
  ]
    // Uma lista só, do mais recente para o mais antigo — a origem do
    // registro não deve influenciar a ordem que o aluno vê.
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  // Item aberto só faz sentido com conteúdo dentro: sem questões e sem
  // redação, o botão levaria a uma tela vazia.
  const disponiveis = itens.filter((i) => i.totalQuestoes > 0 || i.temRedacao);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">Atividades</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">← Voltar ao painel</Link>
      </div>
      <p className="mt-1 text-sm text-navy-dark/60">
        Simulados e atividades em um só lugar. O título de cada item diz do que se trata.
      </p>

      <div className="mt-6 space-y-3">
        {disponiveis.map((item) => (
          <div key={item.href} className="rounded-2xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display font-bold text-navy-dark">{item.titulo}</p>
                <p className="text-xs text-navy-dark/50">
                  {item.totalQuestoes > 0
                    ? `${item.totalQuestoes} ${item.totalQuestoes === 1 ? "questão" : "questões"}`
                    : "Somente redação"}
                  {item.temRedacao && item.totalQuestoes > 0 ? " + redação" : ""}
                  {item.minutos ? ` · ${item.minutos} min` : ""}
                  {item.materia ? ` · ${item.materia}` : ""}
                </p>
                {item.ultimaNota != null && (
                  <p className="mt-1 text-xs font-semibold text-green-700">Última nota: {item.ultimaNota}%</p>
                )}
              </div>
              <Link
                href={item.href}
                className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-dark"
              >
                {item.ultimaNota != null ? "Refazer" : "Começar"}
              </Link>
            </div>
          </div>
        ))}

        {disponiveis.length === 0 && (
          <p className="py-6 text-center text-sm text-navy-dark/50">Nenhuma atividade disponível ainda.</p>
        )}
      </div>
    </div>
  );
}
