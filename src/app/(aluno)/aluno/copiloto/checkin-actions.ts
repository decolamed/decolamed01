"use server";

import { revalidatePath } from "next/cache";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

/**
 * O aluno escolhe uma opção numa pergunta do Copiloto.
 * A resposta é salva; o algoritmo vai aplicar a ação na próxima execução
 * (que acontece quando o aluno faz qualquer atividade).
 */
export async function responderCheckin(
  checkinId: string,
  opcaoValor: string,
  acaoTipo: string,
  acaoPayload: Record<string, unknown>
) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { error } = await supabase
    .from("copiloto_checkin")
    .update({
      resposta_valor: opcaoValor,
      resposta_acao: { acao_tipo: acaoTipo, acao_payload: acaoPayload },
      respondida: true,
      respondida_em: new Date().toISOString()
    })
    .eq("id", checkinId)
    .eq("aluno_id", profile.id); // segurança: só pode responder as próprias

  revalidatePath("/aluno");
  revalidatePath("/aluno/copiloto");
  // Sem isso, uma falha deixava o cartão exatamente como estava e sem
  // nenhuma mensagem: da perspectiva do aluno, o botão simplesmente não
  // fazia nada.
  return { ok: !error };
}
