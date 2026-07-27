-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 024: correções de segurança apontadas pelo linter
-- do Supabase (mcp Supabase get_advisors) numa análise geral da plataforma.
-- ============================================================================

-- 1) `ranking_geral` concedia SELECT também pro papel `anon` (visitante sem
--    login) — qualquer pessoa na internet, sem estar logada, conseguia
--    listar o nome de todo aluno cadastrado e sua pontuação via REST do
--    Supabase. Só o app do aluno (autenticado) e o admin usam essa view —
--    não existe nenhuma tela pública que precise disso.
--
--    A view continua SECURITY DEFINER de propósito: profiles tem RLS que só
--    deixa cada aluno ver a própria linha (profiles_select_own_or_admin),
--    então pra o ranking mostrar a pontuação de TODO mundo pros alunos
--    logados, ela precisa rodar com permissão elevada — a única correção
--    necessária aqui era fechar o acesso anônimo, não remover o
--    SECURITY DEFINER (isso quebraria o ranking pra todo mundo que não é
--    admin).
revoke select on ranking_geral from anon;

-- 2) search_path mutável em função SECURITY DEFINER é um vetor clássico de
--    sequestro: sem search_path fixo, um schema malicioso criado antes de
--    "public" na ordem de busca do chamador poderia sobrepor uma tabela/
--    função usada dentro da função e ser executado com o privilégio dela.
--    Fixar o search_path elimina esse risco nas funções SECURITY DEFINER
--    usadas nas policies de RLS (e no trigger set_updated_at, por
--    consistência, embora não seja SECURITY DEFINER).
alter function public.is_admin() set search_path = public, pg_temp;
alter function public.is_parceiro() set search_path = public, pg_temp;
alter function public.is_professor() set search_path = public, pg_temp;
alter function public.prevent_self_role_escalation() set search_path = public, pg_temp;
alter function public.sync_comissao_parceiro() set search_path = public, pg_temp;
alter function public.set_updated_at() set search_path = public, pg_temp;
alter function public.set_valor_liquido_pagamento() set search_path = public, pg_temp;
