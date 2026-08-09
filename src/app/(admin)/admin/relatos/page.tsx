import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { RelatosManager, type RelatoExibicao } from "./relatos-manager";
import type { StatusRelato } from "@/lib/site/relatos";

// Relato é fila de atendimento: precisa refletir o banco no instante em que
// o admin abre a tela. Sem isto, uma versão em cache podia esconder um
// relato recém-enviado, e a impressão era de que a mensagem do aluno nunca
// chegou — quando na verdade já estava gravada.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminRelatosPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  // Sem filtro de status: a tela precisa do histórico inteiro para os
  // contadores e para o filtro funcionarem. Antes havia um .eq("status",
  // "pendente") aqui, e por isso marcar um relato como resolvido o fazia
  // sumir — na prática, equivalia a apagar.
  const { data, error } = await supabase
    .from("relatos_erro")
    .select("id, mensagem, pagina, status, created_at, profiles(nome, email)")
    .order("created_at", { ascending: false });

  // A consulta usa o vínculo `profiles(...)`, que depende da chave
  // estrangeira relatos_erro.aluno_id → profiles.id. Se esse vínculo se
  // perder, o PostgREST devolve erro e `data` vem nulo: a tela mostraria
  // "nenhum relato" com a fila cheia no banco. Um erro registrado é
  // diagnosticável; uma lista vazia em silêncio parece "o aluno não enviou".
  if (error) {
    console.error("Falha ao carregar a fila de relatos:", error.message);
  }

  const relatos: RelatoExibicao[] = (data ?? []).map((r: any) => {
    // A categoria vem embutida no início da mensagem como "[Questão] texto…".
    const match = r.mensagem.match(/^\[(.+?)\]\s*([\s\S]*)$/);
    return {
      id: r.id,
      nome: r.profiles?.nome ?? "Aluno",
      email: r.profiles?.email ?? "",
      texto: match ? match[2] : r.mensagem,
      categoria: match ? match[1] : "Outro",
      pagina: r.pagina ?? null,
      status: (r.status ?? "pendente") as StatusRelato,
      data: new Date(r.created_at).toLocaleString("pt-BR")
    };
  });

  return <RelatosManager relatos={relatos} />;
}
