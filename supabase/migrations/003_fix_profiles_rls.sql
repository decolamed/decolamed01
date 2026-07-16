-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 003: correção crítica de RLS (escalonamento de privilégio)
-- Rode no SQL editor do Supabase DEPOIS das migrações 001 (schema.sql) e 002.
--
-- PROBLEMA ENCONTRADO NA AUDITORIA:
-- As policies "profiles_update_own_or_admin" e "profiles_admin_insert" tinham
-- USING/WITH CHECK checando apenas "auth.uid() = id" — sem restringir quais
-- colunas podem mudar. Como a policy de UPDATE não tinha um WITH CHECK
-- próprio, o Postgres reaproveita o USING como check, e isso permitia que
-- QUALQUER aluno autenticado rodasse, direto do navegador:
--
--   supabase.from('profiles').update({ role: 'admin' }).eq('id', meuId)
--
-- ...e a policy aceitava, porque auth.uid() = id continua verdadeiro. Ou seja,
-- qualquer aluno logado conseguia se autopromover a admin. Corrigido abaixo:
-- agora um usuário só pode alterar o próprio perfil se o role continuar
-- 'aluno' (ou seja, sem conseguir setar 'admin' nele mesmo); só quem já é
-- admin pode alterar roles.
-- ============================================================================

drop policy if exists "profiles_update_own_or_admin" on profiles;
create policy "profiles_update_own_or_admin" on profiles
  for update
  using (auth.uid() = id or is_admin())
  with check (
    is_admin() or (auth.uid() = id and role = 'aluno')
  );

drop policy if exists "profiles_admin_insert" on profiles;
create policy "profiles_admin_insert" on profiles
  for insert
  with check (
    is_admin() or (auth.uid() = id and role = 'aluno')
  );

-- Reforço secundário (menor risco, mas mesma classe de problema):
-- "notificacoes_update_own" também não tinha WITH CHECK, então um aluno
-- marcando a própria notificação como lida também conseguiria, via chamada
-- direta à API, reatribuir a notificação para outro usuario_id. Baixo risco
-- hoje (a UI ainda não escreve nessa tabela), mas custa pouco fechar agora.
drop policy if exists "notificacoes_update_own" on notificacoes;
create policy "notificacoes_update_own" on notificacoes
  for update
  using (usuario_id = auth.uid() or is_admin())
  with check (usuario_id = auth.uid() or is_admin());
