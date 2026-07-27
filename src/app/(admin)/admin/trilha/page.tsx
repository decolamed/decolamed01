import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { TrilhaManager } from "./trilha-manager";
import type { TrilhaDia, ConteudoBiblioteca, LinkExterno, Simulado } from "@/types/database";

export default async function AdminTrilhaPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: dias }, { data: conteudos }, { data: links }, { data: simulados }, { data: materiasData }, { data: questoesData }, { data: flashcardsData }] = await Promise.all([
    supabase.from("trilha_dias").select("*").order("dia_numero"),
    supabase.from("conteudos_biblioteca").select("*").eq("ativo", true).order("titulo"),
    supabase.from("links_externos").select("*").eq("ativo", true).order("titulo"),
    supabase.from("simulados").select("*").eq("ativo", true).order("titulo"),
    supabase.from("materias_peso").select("materia").order("materia"),
    supabase.from("questoes").select("materia").eq("ativo", true),
    supabase.from("flashcards").select("materia").eq("ativo", true)
  ]);

  const todosConteudos = (conteudos as ConteudoBiblioteca[]) ?? [];

  const contarPorMateria = (linhas: { materia: string }[] | null) => {
    const mapa = new Map<string, number>();
    (linhas ?? []).forEach((l) => mapa.set(l.materia, (mapa.get(l.materia) ?? 0) + 1));
    return mapa;
  };
  const questoesPorMateria = contarPorMateria(questoesData);
  const flashcardsPorMateria = contarPorMateria(flashcardsData);

  return (
    <TrilhaManager
      dias={(dias as TrilhaDia[]) ?? []}
      aulas={todosConteudos.filter((c) => c.tipo === "aula")}
      pdfs={todosConteudos.filter((c) => c.tipo === "pdf" || c.tipo === "artigo")}
      links={(links as LinkExterno[]) ?? []}
      simulados={(simulados as Simulado[]) ?? []}
      materias={(materiasData ?? []).map((m: any) => m.materia)}
      questoesPorMateria={Object.fromEntries(questoesPorMateria)}
      flashcardsPorMateria={Object.fromEntries(flashcardsPorMateria)}
    />
  );
}
