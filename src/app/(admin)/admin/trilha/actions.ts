"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import type { TrilhaItem } from "@/types/database";

const PATH = "/admin/trilha";

export async function salvarDiaTrilha(diaNumero: number, titulo: string, itens: TrilhaItem[]) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("trilha_dias").upsert(
    { dia_numero: diaNumero, titulo: titulo.trim() || `Dia ${diaNumero}`, itens },
    { onConflict: "dia_numero" }
  );

  revalidatePath(PATH);
  revalidatePath("/aluno/cronograma");
  return { ok: !error, erro: error?.message };
}

// Extrai o ID de um link do YouTube em qualquer formato usado no material
// (youtu.be/ID, watch?v=ID, com parâmetros extras de compartilhamento).
function extrairVideoId(url: string): string | null {
  const m =
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/[?&]v=([\w-]{6,})/) ||
    url.match(/youtube\.com\/embed\/([\w-]{6,})/);
  return m ? m[1] : null;
}

// Busca o título e o canal reais de um vídeo via oEmbed do YouTube — não
// precisa de chave de API, é um endpoint público. Usado para substituir os
// títulos genéricos ("Aula 1", "Aula 2"...) que a importação inicial deixou.
async function buscarTituloYoutube(url: string): Promise<{ titulo: string; canal: string } | null> {
  try {
    const resp = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, {
      signal: AbortSignal.timeout(6000)
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { title?: string; author_name?: string };
    if (!data.title) return null;
    return { titulo: data.title, canal: data.author_name ?? "" };
  } catch {
    return null;
  }
}

// Substitui, num único dia da trilha, os títulos genéricos de aula pelo
// título real do vídeo no YouTube. Ação explícita (botão por dia) em vez de
// automática, porque são requisições de rede — mais fácil de acompanhar e
// refazer dia a dia do que um botão único "atualizar tudo" sem feedback.
export async function atualizarTitulosDoDia(diaNumero: number) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: dia, error: erroBusca } = await supabase
    .from("trilha_dias")
    .select("itens")
    .eq("dia_numero", diaNumero)
    .maybeSingle();
  if (erroBusca || !dia) return { ok: false as const, erro: erroBusca?.message ?? "Dia não encontrado." };

  const itens = dia.itens as TrilhaItem[];
  let atualizados = 0;
  const novos: TrilhaItem[] = [];
  for (const item of itens) {
    if (item.tipo !== "aula" || !item.url) {
      novos.push(item);
      continue;
    }
    const videoId = extrairVideoId(item.url);
    const info = videoId ? await buscarTituloYoutube(item.url) : null;
    if (info) {
      novos.push({ ...item, titulo: info.titulo });
      atualizados += 1;
    } else {
      novos.push(item);
    }
  }

  const { error } = await supabase.from("trilha_dias").update({ itens: novos }).eq("dia_numero", diaNumero);
  revalidatePath(PATH);
  revalidatePath("/aluno/cronograma");
  return { ok: !error, atualizados, total: itens.filter((i) => i.tipo === "aula").length };
}
