-- ============================================================================
-- 061 — O admin escolhe os dois simulados do Voo Guiado
--
-- COMO ERA
-- --------
-- `contextoDaRota` pegava os dois simulados mais antigos da tabela:
--
--     .order("created_at", { ascending: true }).order("id").slice(0, 2)
--
-- Três problemas nisso:
--
--   1. o administrador não escolhia nada. Cadastrar um simulado novo não dava
--      jeito de usá-lo — a única alavanca era a data de criação, que a
--      interface não deixa editar;
--   2. com um único simulado utilizável (que é o caso hoje), o fallback
--      `simulados[ordem - 1] ?? simulados[0]` fazia os DOIS dias de simulado
--      abrirem o mesmo simulado, em silêncio;
--   3. como a rota é regerada a cada leitura da tela, a escolha era refeita
--      toda vez. Desativar um simulado trocava o simulado de todo mundo no
--      meio do caminho, inclusive de quem já o tinha feito.
--
-- COMO FICA
-- ---------
-- Duas chaves em `configuracoes` guardam a escolha do admin, e esta tabela
-- FIXA por aluno o que ele recebeu. A rota deixa de depender da configuração
-- assim que o vínculo é criado:
--
--   • simulado já realizado     → fica para sempre, mesmo desativado depois;
--   • fixado e ainda utilizável → fica; a configuração nova vale para os
--                                 próximos alunos;
--   • fixado e inutilizável,    → substitui pelo configurado hoje. É a única
--     sem tentativa               regra de substituição que existe;
--   • sem nada fixado           → usa a configuração atual e fixa.
--
-- Isto NÃO tem relação com os itens de simulado do cronograma padrão
-- (trilha_dias), que continuam valendo só para o plano Decolando. São dois
-- sistemas separados, de propósito.
--
-- `simulado_tentativas` não é tocado por nada aqui.
-- ============================================================================

-- ---------------------------------------------------------------- a escolha
insert into configuracoes (chave, valor)
values
  ('voo_guiado.simulado_1_id', '""'::jsonb),
  ('voo_guiado.simulado_2_id', '""'::jsonb)
on conflict (chave) do nothing;

-- ------------------------------------------------------------- o vínculo
create table if not exists public.aluno_simulados_rota (
  aluno_id uuid not null references public.profiles(id) on delete cascade,

  -- 1 = primeiro simulado da rota, 2 = segundo. É a POSIÇÃO, não a ordem
  -- cronológica: quem decide a data é `posicionarSimulados`.
  ordem smallint not null check (ordem in (1, 2)),

  -- `on delete set null` em vez de cascade: apagado o simulado, o vínculo
  -- sobrevive com a data de quando foi atribuído, e a rota trata a posição
  -- como vazia (e reatribui). Com cascade perderíamos o rastro de que houve
  -- uma atribuição ali.
  simulado_id uuid references public.simulados(id) on delete set null,

  atribuido_em timestamptz not null default now(),

  primary key (aluno_id, ordem)
);

comment on table public.aluno_simulados_rota is
  'Qual simulado foi atribuído a cada uma das duas posições da rota do aluno. Existe para a rota, que é regerada a cada leitura, não trocar o simulado de quem já está com o cronograma em andamento.';

alter table public.aluno_simulados_rota enable row level security;

-- Mesmas políticas de aluno_rota_dias: o aluno lê e grava a própria linha
-- (a rota é gerada na leitura da tela dele, com a sessão dele), o admin vê
-- tudo.
drop policy if exists aluno_simulados_rota_select_own on public.aluno_simulados_rota;
create policy aluno_simulados_rota_select_own on public.aluno_simulados_rota
  for select using (aluno_id = (select auth.uid()) or is_admin());

drop policy if exists aluno_simulados_rota_write_own on public.aluno_simulados_rota;
create policy aluno_simulados_rota_write_own on public.aluno_simulados_rota
  for all
  to authenticated
  using (aluno_id = auth.uid())
  with check (aluno_id = auth.uid());

drop policy if exists aluno_simulados_rota_admin_all on public.aluno_simulados_rota;
create policy aluno_simulados_rota_admin_all on public.aluno_simulados_rota
  for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------- o reset limpa o vínculo
-- "Redefinir Perfil" apaga a rota e o briefing; o vínculo do simulado nasce
-- da rota e tem de sair junto, senão o aluno zerado voltaria com o simulado
-- do cronograma anterior preso à posição 1.
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

  -- O vínculo com os simulados da rota sai junto com a rota: sem isto o
  -- aluno zerado voltaria com o simulado do cronograma anterior preso à
  -- posição 1, e o "Redefinir Perfil" seria parcial de novo.
  delete from public.aluno_simulados_rota   where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('simulados_rota', n);

  -- O briefing é a última coisa a sair, para que qualquer falha acima aborte
  -- a transação com o perfil ainda configurado.
  delete from public.aluno_briefing         where aluno_id = p_aluno_id; get diagnostics n = row_count;
  removidos := removidos || jsonb_build_object('briefing', n);

  return removidos;
end;
$function$;
