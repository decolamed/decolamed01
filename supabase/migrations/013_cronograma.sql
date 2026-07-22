-- DECOLA MED — MIGRAÇÃO 013: cronograma semanal fixo
create table if not exists cronograma_dias (
  id uuid primary key default gen_random_uuid(),
  dia_semana integer not null unique check (dia_semana between 0 and 6),
  titulo text not null default 'Missão do dia',
  atividades jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger trg_cronograma_dias_updated_at before update on cronograma_dias for each row execute function set_updated_at();
alter table cronograma_dias enable row level security;
create policy "cronograma_admin_all" on cronograma_dias for all using (is_admin()) with check (is_admin());
create policy "cronograma_select_all" on cronograma_dias for select using (true);
