-- DECOLA MED — MIGRAÇÃO 014: fundação do Copiloto (pesos, eventos, recomendações)
create table if not exists materias_peso (
  materia text primary key, peso numeric not null default 1.0 check (peso >= 0),
  observacao text, updated_at timestamptz not null default now()
);
create trigger trg_materias_peso_updated_at before update on materias_peso for each row execute function set_updated_at();
alter table materias_peso enable row level security;
create policy "materias_peso_admin_all" on materias_peso for all using (is_admin()) with check (is_admin());
create policy "materias_peso_select_all" on materias_peso for select using (true);
create table if not exists copiloto_eventos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  gatilho text not null, materia text, assunto text,
  detalhes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_copiloto_eventos_aluno on copiloto_eventos(aluno_id, created_at desc);
alter table copiloto_eventos enable row level security;
create policy "copiloto_eventos_admin_all" on copiloto_eventos for all using (is_admin()) with check (is_admin());
create policy "copiloto_eventos_select_own" on copiloto_eventos for select using (aluno_id = auth.uid());
create table if not exists copiloto_recomendacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  tipo text not null, materia text not null, assunto text, titulo text not null, motivo text,
  payload jsonb not null default '{}'::jsonb, prioridade integer not null default 1,
  status text not null default 'pendente' check (status in ('pendente','concluida','descartada')),
  fonte text not null default 'gatilho',
  gerado_em timestamptz not null default now(), concluida_em timestamptz
);
create index if not exists idx_copiloto_rec_aluno_status on copiloto_recomendacoes(aluno_id, status);
alter table copiloto_recomendacoes enable row level security;
create policy "copiloto_rec_admin_all" on copiloto_recomendacoes for all using (is_admin()) with check (is_admin());
create policy "copiloto_rec_select_own" on copiloto_recomendacoes for select using (aluno_id = auth.uid());
create policy "copiloto_rec_update_own" on copiloto_recomendacoes for update using (aluno_id = auth.uid()) with check (aluno_id = auth.uid());
