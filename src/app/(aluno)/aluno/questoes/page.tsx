import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { QuestoesPractice } from "@/components/aluno/questoes-practice";
import { materiasUnicas, mesmaMateria } from "@/lib/site/materia-canonica";
import { montarRodada, mensagemDeRetomada } from "@/lib/site/continuidade";
import type { Questao } from "@/types/database";

const LIMITE_POR_RODADA = 10;

export default async function AlunoQuestoesPage({
  searchParams
}: {
  searchParams: { materia?: string };
}) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  // RLS ("questoes_select_ativas") garante que só questões ativas aparecem
  // aqui, mesmo que alguém tente forjar o filtro.
  const query = supabase.from("questoes").select("*").eq("ativo", true);

  // Sem `.limit()` antes do sorteio: com um teto, o embaralhamento só
  // acontecia dentro das N primeiras linhas devolvidas pelo banco, e as
  // questões cadastradas depois nunca caíam numa rodada.
  const { data: questoesData } = await query;

  // Filtro por matéria em código, com mesmaMateria(): um link antigo com
  // "?materia=Português" continua encontrando as questões de "Linguagens"
  // em vez de devolver uma tela vazia.
  const todas = ((questoesData as Questao[]) ?? []).filter(
    (q) => !searchParams.materia || mesmaMateria(q.materia, searchParams.materia)
  );

  // Continuar de onde parou, pelo histórico REAL de respostas (por id, nunca
  // por índice). Antes esta linha era um `sort(() => Math.random() - 0.5)`:
  // rodada nova a cada visita, quase sempre recomeçando em questões já
  // respondidas. Ver lib/site/continuidade.ts.
  const { data: respondidasData } = await supabase
    .from("respostas_aluno")
    .select("questao_id")
    .eq("aluno_id", profile.id);
  const respondidas = new Set(((respondidasData as { questao_id: string }[]) ?? []).map((r) => r.questao_id));

  const rodada = montarRodada(todas, respondidas, LIMITE_POR_RODADA);
  const questoes = rodada.itens;
  const avisoRetomada = mensagemDeRetomada(rodada, "questão", "questões");

  const { data: materiasData } = await supabase.from("questoes").select("materia").eq("ativo", true);
  const materias = materiasUnicas((materiasData ?? []).map((m: any) => m.materia)).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">🎯 Questões</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      {materias.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/aluno/questoes"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${!searchParams.materia ? "bg-orange text-white" : "bg-white text-navy-dark"}`}
          >
            Todas
          </Link>
          {materias.map((m) => (
            <Link
              key={m}
              href={`/aluno/questoes?materia=${encodeURIComponent(m)}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${mesmaMateria(searchParams.materia, m) ? "bg-orange text-white" : "bg-white text-navy-dark"}`}
            >
              {m}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        {avisoRetomada && (
          <p className="mb-3 rounded-xl bg-navy/5 px-4 py-2.5 text-xs font-semibold text-navy-dark/70">
            {avisoRetomada}
          </p>
        )}
        <QuestoesPractice questoes={questoes} />
      </div>
    </div>
  );
}
