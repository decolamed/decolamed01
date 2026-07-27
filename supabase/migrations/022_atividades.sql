-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 022: módulo de Atividades
--
-- Separado de simulados de propósito (mesmo motivo pra existir os dois: uma
-- avaliação baseada em questões, mas com regras próprias de gabarito, peso
-- e tempo — não reaproveita simulado_tentativas/simulado_questoes).
-- ============================================================================

create table if not exists atividades (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  materia text,
  descricao text,
  -- 'imediato': aluno vê se acertou/errou questão por questão, na hora.
  -- 'apos_envio': só vê o gabarito depois de enviar a atividade inteira
  -- (igual simulado).
  gabarito_modo text not null default 'imediato' check (gabarito_modo in ('imediato', 'apos_envio')),
  tempo_limite_minutos integer, -- null = sem limite de tempo
  peso_facape numeric not null default 1,
  ativo boolean not null default true,
  criado_por uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_atividades_updated_at before update on atividades for each row execute function set_updated_at();

alter table atividades enable row level security;
create policy "atividades_admin_all" on atividades for all using (is_admin()) with check (is_admin());
create policy "atividades_select_ativas" on atividades for select using (ativo = true or is_admin());

create table if not exists atividade_questoes (
  id uuid primary key default gen_random_uuid(),
  atividade_id uuid not null references atividades(id) on delete cascade,
  questao_id uuid not null references questoes(id) on delete cascade,
  ordem integer not null default 0
);

alter table atividade_questoes enable row level security;
create policy "atividade_questoes_admin_all" on atividade_questoes for all using (is_admin()) with check (is_admin());
create policy "atividade_questoes_select_all" on atividade_questoes for select using (true);

create table if not exists atividade_tentativas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  atividade_id uuid not null references atividades(id) on delete cascade,
  respostas jsonb not null default '{}'::jsonb,
  acertos integer not null default 0,
  total integer not null default 0,
  nota numeric not null default 0,
  iniciado_em timestamptz not null default now(),
  finalizado_em timestamptz,
  created_at timestamptz not null default now()
);

alter table atividade_tentativas enable row level security;
create policy "atividade_tentativas_admin_all" on atividade_tentativas for all using (is_admin()) with check (is_admin());
create policy "atividade_tentativas_own" on atividade_tentativas for all using (aluno_id = auth.uid()) with check (aluno_id = auth.uid());
