-- DECOLA MED — MIGRAÇÃO 010: simulados
create table if not exists simulados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null, descricao text, tempo_minutos integer not null default 60,
  ativo boolean not null default true, criado_por uuid references profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger trg_simulados_updated_at before update on simulados for each row execute function set_updated_at();
create table if not exists simulado_questoes (
  id uuid primary key default gen_random_uuid(),
  simulado_id uuid not null references simulados(id) on delete cascade,
  questao_id uuid not null references questoes(id) on delete cascade,
  ordem integer not null default 0, unique (simulado_id, questao_id)
);
create table if not exists simulado_tentativas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  simulado_id uuid not null references simulados(id) on delete cascade,
  respostas jsonb not null default '{}'::jsonb, acertos integer not null default 0,
  total integer not null default 0, nota numeric not null default 0,
  iniciado_em timestamptz not null default now(), finalizado_em timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_simulado_questoes_simulado on simulado_questoes(simulado_id);
create index if not exists idx_simulado_tentativas_aluno on simulado_tentativas(aluno_id);
create index if not exists idx_simulado_tentativas_simulado on simulado_tentativas(simulado_id);
alter table simulados enable row level security;
alter table simulado_questoes enable row level security;
alter table simulado_tentativas enable row level security;
create policy "simulados_admin_all" on simulados for all using (is_admin()) with check (is_admin());
create policy "simulados_select_ativos" on simulados for select using (ativo = true or is_admin());
create policy "simulado_questoes_admin_all" on simulado_questoes for all using (is_admin()) with check (is_admin());
create policy "simulado_questoes_select_all" on simulado_questoes for select using (true);
create policy "simulado_tentativas_own" on simulado_tentativas for all using (aluno_id = auth.uid() or is_admin()) with check (aluno_id = auth.uid() or is_admin());
