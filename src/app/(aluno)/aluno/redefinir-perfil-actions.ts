"use server";

import { revalidatePath } from "next/cache";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

/**
 * Zera a jornada do aluno e o devolve ao estado de conta recém-criada.
 *
 * Apaga: respostas, revisões de flashcards, tentativas de simulado e de
 * atividade, progresso de itens, missões, tudo que o Copiloto tinha
 * adaptado (recomendações, eventos, check-ins, produções de IA), a ROTA
 * personalizada (aluno_rota_dias) e o próprio briefing.
 *
 * A rota entrou nessa lista porque sem ela o reset era parcial de um jeito
 * bem visível: o aluno zerava tudo e continuava vendo o mesmo cronograma,
 * com as mesmas datas — a rota gravada sobrevivia ao briefing que a gerou.
 *
 * Preserva: cadastro e autenticação, matrícula, plano e créditos de redação
 * — o item 19 é explícito em manter a conta.
 *
 * A remoção acontece dentro de uma função no banco (redefinir_perfil_aluno)
 * para ser atômica: apagar metade das tabelas deixaria o aluno num estado
 * pior do que o de antes.
 *
 * O Copiloto NÃO é executado aqui, de propósito. Ele rodava logo após a
 * limpeza e, com o briefing ainda preservado, reconstruía missões e
 * recomendações na mesma hora: a página recarregava e o aluno via a jornada
 * de volta, com toda a aparência de que o reset não tinha funcionado. A nova
 * rota nasce quando o aluno responde o briefing de novo (ver
 * briefing/actions.ts → reprojetarJornada), e aí sem nenhuma influência do
 * histórico antigo, como pede o item 19.6.
 */
export async function redefinirPerfilAluno(): Promise<{ ok: true } | { ok: false; erro: string }> {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { error } = await supabase.rpc("redefinir_perfil_aluno", { p_aluno_id: profile.id });

  if (error) {
    console.error("Falha ao redefinir perfil do aluno:", error.message);
    return { ok: false, erro: "Não foi possível redefinir seu perfil. Tente de novo." };
  }

  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  revalidatePath("/aluno/copiloto");
  revalidatePath("/aluno/briefing");
  return { ok: true };
}
