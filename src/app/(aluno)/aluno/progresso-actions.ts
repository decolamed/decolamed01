"use server";

import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

// Acima de 90% do vídeo assistido, consideramos a aula concluída
// automaticamente — o aluno raramente assiste os 2-3 segundos finais
// (encerramento, créditos), e travar a conclusão em 100% deixaria a maioria
// das aulas eternamente "incompletas".
const LIMIAR_CONCLUSAO = 0.9;

// Salva a posição atual da videoaula (pra "Continuar assistindo") e marca
// conclusão automática ao passar do limiar — chamado periodicamente pelo
// player enquanto o aluno assiste (ver scrPlayer() em decola-app.tsx).
export async function salvarProgressoVideo(chave: string, posicaoSegundos: number, duracaoSegundos: number, finalizado: boolean) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const concluida = finalizado || (duracaoSegundos > 0 && posicaoSegundos / duracaoSegundos >= LIMIAR_CONCLUSAO);

  const { data: atual } = await supabase
    .from("aluno_progresso_itens")
    .select("concluida")
    .eq("aluno_id", profile.id)
    .eq("chave", chave)
    .maybeSingle();

  const { error } = await supabase.from("aluno_progresso_itens").upsert(
    {
      aluno_id: profile.id,
      chave,
      posicao_segundos: Math.max(0, Math.floor(posicaoSegundos)),
      duracao_segundos: Math.max(0, Math.floor(duracaoSegundos)),
      concluida: concluida || !!atual?.concluida,
      concluida_em: concluida && !atual?.concluida ? new Date().toISOString() : undefined
    },
    { onConflict: "aluno_id,chave" }
  );

  return { ok: !error, erro: error?.message, concluida: concluida || !!atual?.concluida };
}

// Alternância manual de conclusão — usada tanto pra aulas (o aluno pode
// marcar como concluída sem assistir até o fim, ou desmarcar) quanto pra
// qualquer outro item do cronograma (pdf/link/questões/flashcards/simulado/
// revisão/livre), que não têm progresso de vídeo.
export async function alternarConclusaoItem(chave: string, concluida: boolean) {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { error } = await supabase.from("aluno_progresso_itens").upsert(
    {
      aluno_id: profile.id,
      chave,
      concluida,
      concluida_em: concluida ? new Date().toISOString() : null
    },
    { onConflict: "aluno_id,chave" }
  );

  return { ok: !error, erro: error?.message };
}
