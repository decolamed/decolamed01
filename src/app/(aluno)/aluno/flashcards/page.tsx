import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { FlashcardsStudy } from "@/components/aluno/flashcards-study";
import { materiasUnicas, mesmaMateria } from "@/lib/site/materia-canonica";
import { montarRodada, mensagemDeRetomada } from "@/lib/site/continuidade";
import type { Flashcard } from "@/types/database";

const LIMITE_POR_RODADA = 15;

export default async function AlunoFlashcardsPage({
  searchParams
}: {
  searchParams: { materia?: string };
}) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  // Sem `.limit(50)`: com o teto, o sorteio só via as 50 primeiras linhas e
  // os demais flashcards nunca apareciam numa rodada — parte do sintoma de
  // "importei 300 e só tenho 60".
  const { data: cardsData } = await supabase.from("flashcards").select("*").eq("ativo", true);

  const todos = ((cardsData as Flashcard[]) ?? []).filter(
    (c) => !searchParams.materia || mesmaMateria(c.materia, searchParams.materia)
  );
  // Mesma regra do Banco de Questões: o que ainda não foi revisado vem
  // primeiro, pelo id do card. O sorteio que existia aqui devolvia 15 cards
  // novos a cada abertura, e o aluno reencontrava os mesmos de sempre.
  const { data: revisadosData } = await supabase
    .from("flashcard_revisoes")
    .select("flashcard_id")
    .eq("aluno_id", profile.id);
  const revisados = new Set(((revisadosData as { flashcard_id: string }[]) ?? []).map((r) => r.flashcard_id));

  const rodada = montarRodada(todos, revisados, LIMITE_POR_RODADA);
  const cards = rodada.itens;
  const avisoRetomada = mensagemDeRetomada(rodada, "card", "cards");

  const materias = materiasUnicas((cardsData ?? []).map((m: any) => m.materia)).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">🃏 Flashcards</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      {materias.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/aluno/flashcards"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${!searchParams.materia ? "bg-orange text-white" : "bg-white text-navy-dark"}`}
          >
            Todas
          </Link>
          {materias.map((m) => (
            <Link
              key={m}
              href={`/aluno/flashcards?materia=${encodeURIComponent(m)}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${mesmaMateria(searchParams.materia, m) ? "bg-orange text-white" : "bg-white text-navy-dark"}`}
            >
              {m}
            </Link>
          ))}
        </div>
      )}

      <div className="mx-auto mt-6 max-w-lg">
        {avisoRetomada && (
          <p className="mb-3 rounded-xl bg-navy/5 px-4 py-2.5 text-xs font-semibold text-navy-dark/70">
            {avisoRetomada}
          </p>
        )}
        <FlashcardsStudy cards={cards} />
      </div>
    </div>
  );
}
