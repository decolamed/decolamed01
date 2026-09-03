-- ===========================================================================
-- O MÍNIMO DO SUPABASE, PARA PODER TESTAR O schema.sql NUM POSTGRES QUALQUER
--
-- O `schema.sql` depende de três coisas que o Supabase já traz pronto e que um
-- Postgres cru não tem: a tabela `auth.users`, a função `auth.uid()` e os
-- papéis `anon` / `authenticated` / `service_role`.
--
-- Este arquivo cria só isso, e do jeito mais parecido possível com o original:
-- `auth.uid()` lendo o `sub` do JWT em `request.jwt.claims` é exatamente como o
-- Supabase implementa. É essa fidelidade que faz o teste de RLS valer alguma
-- coisa — um `auth.uid()` de mentira que devolvesse um valor fixo testaria o
-- teste, não o schema.
--
-- NÃO faz parte do aplicativo. Só existe para `npm run test:banco`.
-- ===========================================================================

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb default '{}'::jsonb
);

-- Mesma implementação do Supabase: o id do usuário vem do JWT da requisição.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid;
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end;
$$;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
grant select on auth.users to authenticated;
