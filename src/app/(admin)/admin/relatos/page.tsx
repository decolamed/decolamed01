import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { RelatosManager, type RelatoExibicao } from "./relatos-manager";

export default async function AdminRelatosPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("relatos_erro")
    .select("id, mensagem, created_at, profiles(nome, email)")
    .eq("status", "pendente")
    .order("created_at", { ascending: false });

  const relatos: RelatoExibicao[] = (data ?? []).map((r: any) => {
    const match = r.mensagem.match(/^\[(.+?)\]\s*([\s\S]*)$/);
    return {
      id: r.id,
      nome: r.profiles?.nome ?? "Aluno",
      email: r.profiles?.email ?? "",
      texto: match ? match[2] : r.mensagem,
      categoria: match ? match[1] : "Outro",
      data: new Date(r.created_at).toLocaleString("pt-BR")
    };
  });

  return <RelatosManager relatos={relatos} />;
}
