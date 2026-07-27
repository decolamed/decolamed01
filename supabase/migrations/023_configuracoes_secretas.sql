-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 023: configurações secretas (chaves de API)
--
-- `configuracoes` tem uma policy de SELECT pública (`config_select_publico`
-- using (true)) — correta pra WhatsApp/Instagram/link de base de temas
-- (informação pública do site), mas isso tornaria QUALQUER chave de API
-- guardada ali legível por qualquer pessoa via REST do Supabase, sem nem
-- precisar estar logada. Por isso chaves de API (Gemini, e outras no
-- futuro) ficam nesta tabela separada, sem nenhuma policy de select
-- público — só admin (is_admin()) ou o service role (painel admin/servidor)
-- conseguem ler.
-- ============================================================================

create table if not exists configuracoes_secretas (
  chave text primary key,
  valor text not null,
  updated_at timestamptz not null default now()
);

create trigger trg_configuracoes_secretas_updated_at before update on configuracoes_secretas for each row execute function set_updated_at();

alter table configuracoes_secretas enable row level security;
create policy "config_secretas_admin_all" on configuracoes_secretas for all using (is_admin()) with check (is_admin());
