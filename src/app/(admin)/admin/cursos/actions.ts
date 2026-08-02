"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

export async function criarConteudo(tipo: "aula" | "pdf", titulo: string, materia: string, assunto: string | null, url: string | null, duracao: number) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim() || !materia.trim()) return { ok: false as const, erro: "Preencha título e matéria." };
  const { error } = await supabase.from("conteudos_biblioteca").insert({
    tipo,
    titulo: titulo.trim(),
    materia: materia.trim(),
    assunto: assunto?.trim() || null,
    url: url?.trim() || null,
    duracao_minutos: duracao,
    ativo: true,
    criado_por: admin.id
  });
  revalidatePath(`/admin/cursos`);
  revalidatePath(`/admin/pdfs`);
  if (error) return { ok: false as const, erro: "Não foi possível criar." };
  return { ok: true as const };
}

// Edição de conteúdo já cadastrado. Sem isso, corrigir um título com erro
// de digitação ou uma URL trocada exigia excluir e cadastrar de novo — o
// que, além de trabalhoso, quebra qualquer dia do cronograma que já aponte
// para aquele item pelo ref_id.
export async function atualizarConteudo(
  id: string,
  titulo: string,
  materia: string,
  assunto: string | null,
  url: string | null,
  duracao: number
) {
  await requireAdmin();
  const supabase = createAdminClient();
  if (!titulo.trim() || !materia.trim()) return { ok: false as const, erro: "Preencha título e matéria." };
  const { error } = await supabase
    .from("conteudos_biblioteca")
    .update({
      titulo: titulo.trim(),
      materia: materia.trim(),
      assunto: assunto?.trim() || null,
      url: url?.trim() || null,
      duracao_minutos: duracao
    })
    .eq("id", id);
  revalidatePath(`/admin/cursos`);
  revalidatePath(`/admin/pdfs`);
  revalidatePath("/aluno");
  if (error) return { ok: false as const, erro: "Não foi possível salvar as alterações." };
  return { ok: true as const };
}

// Importação em massa de aulas via YouTube — ver buscarInfoYoutube() em
// src/lib/importacao/youtube.ts, que já buscou título/matéria sugerida
// antes desta chamada. Mesmo padrão de retorno de salvarQuestoesEmLote().
export async function criarConteudosEmLote(
  itens: { titulo: string; materia: string; assunto: string | null; url: string; duracao: number }[]
) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  let sucesso = 0;
  let falha = 0;
  for (const item of itens) {
    if (!item.titulo.trim() || !item.materia.trim()) {
      falha++;
      continue;
    }
    const { error } = await supabase.from("conteudos_biblioteca").insert({
      tipo: "aula",
      titulo: item.titulo.trim(),
      materia: item.materia.trim(),
      assunto: item.assunto?.trim() || null,
      url: item.url.trim() || null,
      duracao_minutos: item.duracao,
      ativo: true,
      criado_por: admin.id
    });
    if (error) falha++;
    else sucesso++;
  }

  revalidatePath("/admin/cursos");
  revalidatePath("/admin/pdfs");
  return { sucesso, falha };
}

// Devolve o resultado (em vez de void) porque a tela faz atualização
// otimista: ela já pinta o novo estado antes da resposta. Sem saber que a
// gravação falhou, o admin via o botão trocar, acreditava ter desativado o
// item e só descobria o contrário no próximo carregamento da página.
export async function alternarAtivoConteudo(id: string, ativo: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("conteudos_biblioteca").update({ ativo: !ativo }).eq("id", id);
  revalidatePath(`/admin/cursos`);
  revalidatePath(`/admin/pdfs`);
  revalidatePath("/aluno");
  return { ok: !error };
}

export async function excluirConteudo(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("conteudos_biblioteca").delete().eq("id", id);
  revalidatePath(`/admin/cursos`);
  revalidatePath(`/admin/pdfs`);
  revalidatePath("/admin/trilha");
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  return { ok: !error };
}

// ---- Títulos reais do YouTube ---------------------------------------------
// A importação inicial gravou 242 das 253 aulas como "Aula 1", "Aula 2"…
// Isso não é só feio: com título genérico a busca desta tela não encontra
// nada ("mitose" devolvia zero resultados) e o aluno não sabe o que vai
// assistir. O oEmbed do YouTube é público e devolve o título real sem
// precisar de chave de API.

function extrairVideoId(url: string): string | null {
  return (
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/[?&]v=([\w-]{6,})/) ||
    url.match(/youtube\.com\/embed\/([\w-]{6,})/)
  )?.[1] ?? null;
}

async function buscarTituloYoutube(url: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, {
      signal: AbortSignal.timeout(6000)
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { title?: string };
    return data.title || null;
  } catch {
    return null;
  }
}

/**
 * Substitui os títulos genéricos ("Aula N") pelo título real do vídeo.
 *
 * Processa no máximo `limite` por chamada de propósito: são requisições de
 * rede uma a uma, e tentar 242 numa única Server Action estoura o tempo da
 * requisição e não entrega nada. A tela chama de novo enquanto `restantes`
 * for maior que zero, mostrando o progresso — assim uma falha no meio do
 * caminho não perde o que já foi corrigido.
 */
export async function atualizarTitulosGenericos(limite = 25) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: aulas, error } = await supabase
    .from("conteudos_biblioteca")
    .select("id, titulo, url")
    .eq("tipo", "aula")
    .not("url", "is", null)
    .order("titulo");
  if (error) return { ok: false as const, erro: "Não foi possível listar as aulas." };

  const genericas = ((aulas as { id: string; titulo: string; url: string }[]) ?? []).filter((a) =>
    /^Aula \d+$/.test(a.titulo)
  );

  let atualizados = 0;
  let semTitulo = 0;
  for (const aula of genericas.slice(0, limite)) {
    if (!extrairVideoId(aula.url)) {
      semTitulo++;
      continue;
    }
    const titulo = await buscarTituloYoutube(aula.url);
    if (!titulo) {
      semTitulo++;
      continue;
    }
    const { error: erroUpdate } = await supabase
      .from("conteudos_biblioteca")
      .update({ titulo })
      .eq("id", aula.id);
    if (erroUpdate) semTitulo++;
    else atualizados++;
  }

  revalidatePath("/admin/cursos");
  revalidatePath("/admin/trilha");
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  return {
    ok: true as const,
    atualizados,
    semTitulo,
    restantes: Math.max(0, genericas.length - limite)
  };
}
