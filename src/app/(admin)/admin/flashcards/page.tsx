import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { FlashcardsManager } from "./flashcards-manager";
import type { Flashcard } from "@/types/database";

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
  const materiasExistentes = Array.from(new Set(cards.map((c) => c.materia))).sort();

  return <FlashcardsManager cards={cards} materiasExistentes={materiasExistentes} />;
}
