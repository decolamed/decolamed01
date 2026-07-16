-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 006: guarda de alteração de role via trigger
-- Rode no SQL editor do Supabase DEPOIS da migração 005.
--
-- POR QUE ESTA MUDANÇA É NECESSÁRIA:
-- A policy "profiles_update_own_or_admin" (criada em 001, corrigida em 003)
-- trava a autopromoção exigindo, para updates feitos pelo próprio usuário,
-- que o campo `role` do registro resultante seja literalmente 'aluno':
--
--   with check (is_admin() or (auth.uid() = id and role = 'aluno'))
--
-- Isso funcionava enquanto só existiam os roles 'aluno' e 'admin'. Com a
-- introdução do role 'parceiro' (migração 004), essa mesma regra passaria a
-- BLOQUEAR um parceiro de editar o próprio perfil (ex.: atualizar telefone),
-- porque depois do update `role` continuaria 'parceiro', não 'aluno', e o
-- WITH CHECK falharia.
--
-- A correção troca a validação de "role tem que ser literalmente aluno" por
-- uma trigger que compara o role ANTES e DEPOIS do update: qualquer usuário
-- não-admin que tentar mudar o próprio `role` (para qualquer valor, inclusive
-- 'parceiro' ou 'admin') tem a operação bloqueada. Isso é mais robusto que a
-- checagem por string na policy porque funciona para qualquer role atual do
-- usuário, sem precisar listar cada valor permitido.
-- ============================================================================

-- ATENÇÃO — armadilha evitada aqui: praticamente todas as ações administrativas
-- deste projeto (tornarAdmin, removerAdmin, tornarParceiro...) rodam através
-- de createAdminClient() (service role key), que NÃO carrega um JWT de
-- usuário. Nesse contexto auth.uid() é NULL e is_admin() sempre retornaria
-- falso — se a trigger dependesse só de is_admin(), ela bloquearia até as
-- próprias ações administrativas legítimas. Por isso a trigger também libera
-- quando o role do Postgres em uso tem o atributo BYPASSRLS (que é
-- exatamente o caso do role `service_role` do Supabase, além do superusuário
-- usado pelas migrações) — ou seja, ela só entra em ação para conexões que
-- passam pelo RLS normal (anon/authenticated), que é onde a autopromoção
-- via chamada direta ao Supabase (client-side) poderia acontecer.
create or replace function prevent_self_role_escalation()
returns trigger as $$
begin
  if new.role is distinct from old.role
     and not is_admin()
     and not exists (select 1 from pg_roles where rolname = current_user and rolbypassrls) then
    raise exception 'Apenas administradores podem alterar o role de um usuário.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_self_role_escalation on profiles;
create trigger trg_prevent_self_role_escalation
  before update on profiles
  for each row execute function prevent_self_role_escalation();

-- Com a trigger cuidando da proteção de `role`, simplificamos a policy de
-- update para permitir que qualquer usuário edite o próprio perfil (a
-- trigger acima barra a troca de role; os demais campos — nome, telefone —
-- continuam livres para o próprio dono editar, como já era o caso).
drop policy if exists "profiles_update_own_or_admin" on profiles;
create policy "profiles_update_own_or_admin" on profiles
  for update
  using (auth.uid() = id or is_admin())
  with check (auth.uid() = id or is_admin());

-- Mesmo raciocínio para o insert: a trigger não roda em INSERT (old é null),
-- então mantemos aqui a regra explícita de que um usuário só pode inserir o
-- próprio profile como 'aluno' — perfis 'admin'/'parceiro' só são criados
-- pelo fluxo administrativo (que usa a service role key, e portanto ignora
-- RLS de qualquer forma).
drop policy if exists "profiles_admin_insert" on profiles;
create policy "profiles_admin_insert" on profiles
  for insert
  with check (
    is_admin() or (auth.uid() = id and role = 'aluno')
  );
