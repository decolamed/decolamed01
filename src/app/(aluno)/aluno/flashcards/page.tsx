import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { FlashcardsStudy } from "@/components/aluno/flashcards-study";
import type { Flashcard } from "@/types/database";

const LIMITE_POR_RODADA = 15;

export default async function AlunoFlashcardsPage({
  searchParams
}: {
  searchParams: { materia?: string };
}) {
  await requireAcessoAluno();
  const supabase = createClient();

  let query = supabase.from("flashcards").select("*").eq("ativo", true);
  if (searchParams.materia) query = query.eq("materia", searchParams.materia);

  const { data: cardsData } = await query.limit(50);
  const todos = (cardsData as Flashcard[]) ?? [];
  const cards = [...todos].sort(() => Math.random() - 0.5).slice(0, LIMITE_POR_RODADA);

  const { data: materiasData } = await supabase.from("flashcards").select("materia").eq("ativo", true);
  const materias = Array.from(new Set((materiasData ?? []).map((m: any) => m.materia))).sort();

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
              className={`rounded-full px-4 py-2 text-sm font-semibold ${searchParams.materia === m ? "bg-orange text-white" : "bg-white text-navy-dark"}`}
            >
              {m}
            </Link>
          ))}
        </div>
      )}

      <div className="mx-auto mt-6 max-w-lg">
        <FlashcardsStudy cards={cards} />
      </div>
    </div>
  );
}
