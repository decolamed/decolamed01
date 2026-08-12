-- O Redefinir Perfil precisa apagar as sessões de questões também.
--
-- Sem isto o reset seria parcial de um jeito invisível: o histórico de
-- questões "já usadas" sobreviveria ao apagamento de tudo o mais, e as
-- atividades da jornada nova pulariam questões que o aluno respondeu numa
-- jornada que deixou de existir. Num banco de 82 questões de Biologia, dois
-- resets seguidos deixariam a matéria sem questões inéditas.
create or replace function public.redefinir_perfil_aluno(p_aluno_id uuid)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  removidos jsonb := '{}'::jsonb;
  n integer;
begin
  if auth.uid() is not null
     and auth.uid() <> p_aluno_id
     and not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Sem permissão para redefinir este perfil.' using errcode = 'insufficient_privilege';
  end if;

  delete from public.respostas_aluno        where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('respostas', n);

  delete from public.flashcard_revisoes     where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('revisoes', n);

  delete from public.simulado_tentativas    where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('simulados', n);

  delete from public.atividade_tentativas   where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('atividades', n);

  delete from public.aluno_progresso_itens  where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('progresso', n);

  delete from public.aluno_missoes          where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('missoes', n);

  delete from public.copiloto_recomendacoes where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('recomendacoes', n);

  delete from public.copiloto_eventos       where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('eventos', n);

  delete from public.copiloto_checkin       where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('checkins', n);

  delete from public.copiloto_producoes_ia  where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('producoes_ia', n);

  -- As atividades diárias e o histórico de questões já usadas.
  delete from public.aluno_sessao_questoes  where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('sessoes_questoes', n);

  -- A rota personalizada nasce do briefing; apagada a origem, ela some junto.
  delete from public.aluno_rota_dias        where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('rota_dias', n);

  -- O briefing é a última coisa a sair, para que qualquer falha acima aborte
  -- a transação com o perfil ainda configurado.
  delete from public.aluno_briefing         where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('briefing', n);

  return removidos;
end;
$function$;
