import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { FlashcardsManager } from "./flashcards-manager";
import { materiasUnicas } from "@/lib/site/materia-canonica";
import type { Flashcard } from "@/types/database";

// O contador "X flashcards cadastrados" só é honesto se a página reler o
// banco a cada acesso. Sem isto, uma versão em cache mostraria o total de
// antes da última importação ou exclusão — que é o tipo de número velho que
// motivou o pedido.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminFlashcardsPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  // `ordem` guarda a sequência pedagógica do lote importado; cartões avulsos
  // (criados na mão, sem ordem) caem no fim, do mais recente pro mais antigo.
  const { data } = await supabase
    .from("flashcards")
    .select("*")
    .order("ordem", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  const cards = (data as Flashcard[]) ?? [];
  const materiasExistentes = materiasUnicas(cards.map((c) => c.materia)).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  return <FlashcardsManager cards={cards} materiasExistentes={materiasExistentes} />;
}
