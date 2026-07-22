-- DECOLA MED — MIGRAÇÃO 008: banco de questões
create table if not exists questoes (
  id uuid primary key default gen_random_uuid(),
  materia text not null,
  assunto text,
  enunciado text not null,
  alternativas jsonb not null,
  resposta_correta text not null,
  explicacao text,
  dificuldade text not null default 'media' check (dificuldade in ('facil', 'media', 'dificil')),
  ativo boolean not null default true,
  criado_por uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_questoes_updated_at before update on questoes for each row execute function set_updated_at();
create table if not exists respostas_aluno (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  questao_id uuid not null references questoes(id) on delete cascade,
  alternativa_escolhida text not null,
  correta boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_questoes_materia on questoes(materia);
create index if not exists idx_respostas_aluno_aluno on respostas_aluno(aluno_id);
create index if not exists idx_respostas_aluno_questao on respostas_aluno(questao_id);
alter table questoes enable row level security;
alter table respostas_aluno enable row level security;
create policy "questoes_admin_all" on questoes for all using (is_admin()) with check (is_admin());
create policy "questoes_select_ativas" on questoes for select using (ativo = true or is_admin());
create policy "respostas_aluno_own" on respostas_aluno for all using (aluno_id = auth.uid() or is_admin()) with check (aluno_id = auth.uid() or is_admin());
