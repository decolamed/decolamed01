-- DECOLA MED — MIGRAÇÃO 009: flashcards
create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  materia text not null, assunto text, frente text not null, verso text not null,
  ativo boolean not null default true, criado_por uuid references profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger trg_flashcards_updated_at before update on flashcards for each row execute function set_updated_at();
create table if not exists flashcard_revisoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  flashcard_id uuid not null references flashcards(id) on delete cascade,
  lembrou boolean not null, created_at timestamptz not null default now()
);
create index if not exists idx_flashcards_materia on flashcards(materia);
create index if not exists idx_flashcard_revisoes_aluno on flashcard_revisoes(aluno_id);
alter table flashcards enable row level security;
alter table flashcard_revisoes enable row level security;
create policy "flashcards_admin_all" on flashcards for all using (is_admin()) with check (is_admin());
create policy "flashcards_select_ativos" on flashcards for select using (ativo = true or is_admin());
create policy "flashcard_revisoes_own" on flashcard_revisoes for all using (aluno_id = auth.uid() or is_admin()) with check (aluno_id = auth.uid() or is_admin());
