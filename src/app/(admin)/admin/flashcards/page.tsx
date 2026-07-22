import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { FlashcardsManager } from "./flashcards-manager";
import type { Flashcard } from "@/types/database";

export default async function AdminFlashcardsPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase.from("flashcards").select("*").order("created_at", { ascending: false });
  const cards = (data as Flashcard[]) ?? [];
  const materiasExistentes = Array.from(new Set(cards.map((c) => c.materia))).sort();

  return <FlashcardsManager cards={cards} materiasExistentes={materiasExistentes} />;
}
