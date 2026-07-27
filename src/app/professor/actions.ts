"use server";

import { revalidatePath } from "next/cache";
import { requireProfessor } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";

const PATH = "/professor";

export async function adicionarCredito(alunoId: string) {
  const professor = await requireProfessor();
  const supabase = createAdminClient();
  const { error } = await supabase.from("redacoes_creditos_ajustes").insert({
    aluno_id: alunoId,
    quantidade: 1,
    motivo: "Crédito adicionado manualmente pelo professor",
    criado_por: professor.id
  });
  if (error) console.error("Falha ao adicionar crédito de redação:", error);
  revalidatePath(PATH);
}

export async function removerCredito(alunoId: string) {
  const professor = await requireProfessor();
  const supabase = createAdminClient();
  const { error } = await supabase.from("redacoes_creditos_ajustes").insert({
    aluno_id: alunoId,
    quantidade: -1,
    motivo: "Crédito removido manualmente pelo professor",
    criado_por: professor.id
  });
  if (error) console.error("Falha ao remover crédito de redação:", error);
  revalidatePath(PATH);
}

// Marca uma redação como corrigida: consome 1 crédito (mesma tabela já
// usada pelo admin em /admin/usuarios/[id]) e notifica o aluno — é assim
// que o aluno fica sabendo que a correção dele já saiu.
export async function corrigirRedacao(alunoId: string) {
  const professor = await requireProfessor();
  const supabase = createAdminClient();

  const { error } = await supabase.from("redacoes_creditos_consumidos").insert({
    aluno_id: alunoId,
    registrado_por: professor.id,
    observacao: "Correção registrada pelo professor"
  });

  if (!error) {
    await supabase.from("notificacoes").insert({
      usuario_id: alunoId,
      titulo: "Redação corrigida!",
      mensagem: "Sua redação já foi corrigida. Confira o retorno com a professora pelo WhatsApp.",
      lida: false
    });
  } else {
    console.error("Falha ao registrar correção de redação:", error);
  }

  revalidatePath(PATH);
}

// Tira o aluno da lista do painel de redação — não afeta a conta do aluno
// nem seus créditos, só deixa de aparecer aqui (reversível pelo admin,
// direto na tabela, se precisar).
export async function removerDaLista(alunoId: string) {
  const professor = await requireProfessor();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("redacoes_professor_ocultos")
    .upsert({ aluno_id: alunoId, ocultado_por: professor.id }, { onConflict: "aluno_id" });
  if (error) console.error("Falha ao remover aluno da lista de redação:", error);
  revalidatePath(PATH);
}
