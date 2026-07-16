-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 004: novo role "parceiro" (afiliados)
-- Rode no SQL editor do Supabase DEPOIS das migrações 001, 002 e 003.
--
-- Esta migração faz SOMENTE o ALTER TYPE. O Postgres não permite usar um
-- valor de enum recém-adicionado na mesma transação em que ele foi criado
-- (erro: "unsafe use of new value of enum type"). Por isso o restante da
-- feature (colunas, tabelas, policies que já usam 'parceiro') fica na
-- migração 005, que deve rodar depois desta ter sido commitada.
-- ============================================================================

alter type user_role add value if not exists 'parceiro';
