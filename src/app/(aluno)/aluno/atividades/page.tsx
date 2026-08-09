import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PaginaAluno, CartaoAluno } from "@/components/aluno/pagina-aluno";

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
    <PaginaAluno
      titulo="Atividades"
      descricao="Simulados e atividades em um só lugar. O título de cada item diz do que se trata."
    >
      <div className="space-y-3">
        {disponiveis.map((item) => (
          <CartaoAluno key={item.href} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-navy-dark">{item.titulo}</p>

                {/* Etiquetas em vez de uma linha corrida de texto: no cartão
                    branco sobre o navy, blocos separados leem melhor e
                    acompanham o padrão de "chips" usado no resto do app. */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Etiqueta>
                    {item.totalQuestoes > 0
                      ? `${item.totalQuestoes} ${item.totalQuestoes === 1 ? "questão" : "questões"}`
                      : "Somente redação"}
                  </Etiqueta>
                  {item.temRedacao && item.totalQuestoes > 0 && <Etiqueta>+ redação</Etiqueta>}
                  {item.minutos != null && <Etiqueta>{item.minutos} min</Etiqueta>}
                  {item.materia && <Etiqueta>{item.materia}</Etiqueta>}
                  {item.ultimaNota != null && (
                    <span className="rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-extrabold text-green">
                      Última nota: {item.ultimaNota}%
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={item.href}
                className="shrink-0 rounded-full bg-orange px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-orange-dark"
              >
                {item.ultimaNota != null ? "Refazer" : "Começar"}
              </Link>
            </div>
          </CartaoAluno>
        ))}

        {disponiveis.length === 0 && (
          <CartaoAluno className="py-10 text-center">
            <p className="text-sm font-semibold text-navy-dark/50">Nenhuma atividade disponível ainda.</p>
          </CartaoAluno>
        )}
      </div>
    </PaginaAluno>
  );
}

/** Etiqueta neutra de metadado do cartão (quantidade, tempo, matéria). */
function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-bold text-navy-dark/60">{children}</span>
  );
}
