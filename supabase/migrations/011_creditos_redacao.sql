-- DECOLA MED — MIGRAÇÃO 011: créditos de redação
alter table planos add column if not exists creditos_redacao integer not null default 0;
create table if not exists redacoes_creditos_consumidos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  registrado_por uuid references profiles(id), observacao text,
  created_at timestamptz not null default now()
);
create index if not exists idx_redacoes_consumidos_aluno on redacoes_creditos_consumidos(aluno_id);
alter table redacoes_creditos_consumidos enable row level security;
create policy "redacoes_consumidos_admin_all" on redacoes_creditos_consumidos for all using (is_admin()) with check (is_admin());
create policy "redacoes_consumidos_select_own" on redacoes_creditos_consumidos for select using (aluno_id = auth.uid());
