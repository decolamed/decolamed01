-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 007: concede GRANTs básicos de tabela
-- Rode no SQL editor do Supabase DEPOIS de todas as migrações anteriores.
--
-- POR QUE ISSO É NECESSÁRIO:
-- RLS (Row Level Security) e GRANT são duas camadas DIFERENTES de permissão
-- no Postgres:
--   - GRANT decide se o role (anon/authenticated) pode tentar ler/escrever
--     na tabela, sem olhar pra nenhuma linha específica.
--   - RLS (as policies "create policy ...") decide, DEPOIS que o GRANT já
--     liberou, quais LINHAS especificamente aquele usuário pode ver/mudar.
--
-- Este projeto sempre configurou RLS com cuidado (é a segurança de verdade),
-- mas nunca havia um GRANT explícito de tabela em nenhuma migração — o
-- acesso que funcionava até agora vinha só de client usando a service role
-- key (que ignora GRANT e RLS) nas páginas do admin, ou de alguma
-- configuração herdada do projeto. Uma leitura feita direto pelo navegador
-- (client anônimo/authenticated "de verdade", sem service role) esbarra
-- nisso e retorna "permission denied for table X" — um erro de GRANT, que
-- acontece ANTES de qualquer policy de RLS ser avaliada.
--
-- A correção abaixo é segura: ela só libera a "porta de entrada" da tabela.
-- Quem pode ver/editar CADA LINHA continua 100% controlado pelas policies de
-- RLS já existentes (nada muda em relação a quem vê o quê).
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

-- Garante que tabelas criadas no futuro (novas migrações) já nasçam com o
-- mesmo GRANT, sem precisar lembrar de repetir isso toda vez.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
