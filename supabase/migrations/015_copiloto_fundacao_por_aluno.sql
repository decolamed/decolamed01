-- DECOLA MED — MIGRAÇÃO 015: plano PRO, briefing, cronograma individual, biblioteca
alter table planos add column if not exists tem_copiloto boolean not null default false;
create table if not exists aluno_briefing (
  aluno_id uuid primary key references profiles(id) on delete cascade,
  data_prova date not null,
  horas_por_dia_semana numeric not null default 3 check (horas_por_dia_semana >= 0.5 and horas_por_dia_semana <= 16),
  horas_por_dia_fim_semana numeric not null default 4 check (horas_por_dia_fim_semana >= 0.5 and horas_por_dia_fim_semana <= 16),
  dias_estuda text[] not null default array['seg','ter','qua','qui','sex','sab'],
  observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger trg_aluno_briefing_updated_at before update on aluno_briefing for each row execute function set_updated_at();
alter table aluno_briefing enable row level security;
create policy "aluno_briefing_admin_all" on aluno_briefing for all using (is_admin()) with check (is_admin());
create policy "aluno_briefing_select_own" on aluno_briefing for select using (aluno_id = auth.uid());
create policy "aluno_briefing_insert_own" on aluno_briefing for insert with check (aluno_id = auth.uid());
create policy "aluno_briefing_update_own" on aluno_briefing for update using (aluno_id = auth.uid()) with check (aluno_id = auth.uid());
create table if not exists aluno_missoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  data date not null, titulo text not null, materia text, assunto text,
  tipo text not null default 'aula' check (tipo in ('aula','questoes','flashcards','simulado','revisao','livre')),
  duracao_minutos integer not null default 30, prioridade integer not null default 1,
  origem text not null default 'admin' check (origem in ('admin','copiloto','briefing_inicial')),
  motivo_copiloto text, concluida boolean not null default false, concluida_em timestamptz,
  ref_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger trg_aluno_missoes_updated_at before update on aluno_missoes for each row execute function set_updated_at();
create index if not exists idx_aluno_missoes_aluno_data on aluno_missoes(aluno_id, data);
alter table aluno_missoes enable row level security;
create policy "aluno_missoes_admin_all" on aluno_missoes for all using (is_admin()) with check (is_admin());
create policy "aluno_missoes_select_own" on aluno_missoes for select using (aluno_id = auth.uid());
create policy "aluno_missoes_update_own" on aluno_missoes for update using (aluno_id = auth.uid()) with check (aluno_id = auth.uid());
create table if not exists conteudos_biblioteca (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'aula' check (tipo in ('aula','artigo','pdf','video_externo')),
  titulo text not null, materia text not null, assunto text, url text,
  duracao_minutos integer not null default 30, descricao text,
  ativo boolean not null default true, criado_por uuid references profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger trg_conteudos_biblioteca_updated_at before update on conteudos_biblioteca for each row execute function set_updated_at();
alter table conteudos_biblioteca enable row level security;
create policy "conteudos_admin_all" on conteudos_biblioteca for all using (is_admin()) with check (is_admin());
create policy "conteudos_select_ativos" on conteudos_biblioteca for select using (ativo = true or is_admin());
