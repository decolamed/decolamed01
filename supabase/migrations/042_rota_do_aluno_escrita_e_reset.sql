-- 1) A rota é dado DERIVADO do briefing do próprio aluno. Ele precisa poder
--    gravá-la, senão a primeira geração falharia em silêncio e a tela cairia
--    de volta na régua do template.
drop policy if exists aluno_rota_dias_write_own on public.aluno_rota_dias;
create policy aluno_rota_dias_write_own on public.aluno_rota_dias
  for all
  to authenticated
  using (aluno_id = auth.uid())
  with check (aluno_id = auth.uid());

-- 2) Redefinir Perfil precisa apagar a rota também. Sem isto o aluno zerava
--    tudo e continuava vendo o cronograma antigo, com as datas antigas —
--    exatamente o sintoma de "o reset não resetou".
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
