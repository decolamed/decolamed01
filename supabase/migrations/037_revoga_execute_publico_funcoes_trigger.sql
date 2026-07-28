-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 037: revoga EXECUTE público de funções de trigger
--
-- prevent_self_role_escalation() (trigger em profiles), sync_comissao_
-- parceiro() (trigger em pagamentos) e rls_auto_enable() (event trigger
-- "ensure_rls", que ativa RLS automaticamente em toda tabela nova criada em
-- public) só fazem sentido disparadas pelo próprio mecanismo de trigger do
-- Postgres — que não depende de GRANT EXECUTE do papel que originou o
-- comando. CREATE FUNCTION concede EXECUTE a PUBLIC por padrão, então
-- qualquer usuário anônimo ou autenticado conseguia chamá-las direto via
-- /rest/v1/rpc/<nome> do PostgREST (apontado pelo linter de segurança do
-- Supabase). Chamar diretamente não tinha efeito real (as duas primeiras
-- dependem de NEW/OLD de contexto de trigger; a terceira, de contexto de
-- event trigger), mas não há motivo pra deixar a porta aberta.
--
-- is_admin()/is_parceiro()/is_professor() ficam de fora de propósito: são
-- usadas dentro de praticamente toda política de RLS do projeto (using
-- (is_admin()) etc.) avaliada como o papel "authenticated" — revogar
-- EXECUTE delas quebraria essas políticas inteiras.
-- ============================================================================

revoke execute on function public.prevent_self_role_escalation() from public;
revoke execute on function public.sync_comissao_parceiro() from public;
revoke execute on function public.rls_auto_enable() from public;
