-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 030: reaplica search_path em is_professor()
--
-- A migração 024 (hardening_seguranca) já tinha fixado o search_path de
-- is_professor() como proteção contra sequestro de função em funções
-- SECURITY DEFINER. Uma migração posterior (professor_role, reaplicada em
-- 2026-07-26 fora deste repositório) recriou a função com
-- `create or replace function` sem repetir o `set search_path` — e
-- `create or replace` NÃO herda o proconfig da definição anterior quando a
-- nova definição não o especifica, então a proteção foi silenciosamente
-- perdida. Auditoria pré-deploy encontrou isso comparando o proconfig real
-- de cada função contra a lista da migração 024.
--
-- LIÇÃO: qualquer `create or replace function` numa função que já tem
-- `set search_path` precisa repetir essa cláusula, ou rodar este tipo de
-- ALTER de novo depois. Vale conferir a cada nova migração que recriar uma
-- função já protegida.
-- ============================================================================

alter function public.is_professor() set search_path = public, pg_temp;
