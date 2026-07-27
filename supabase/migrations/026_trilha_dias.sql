-- DECOLA MED — MIGRAÇÃO 026: trilha do curso (sequência linear de dias, dia 1..N)
--
-- cronograma_dias (migração 013) é um ciclo SEMANAL fixo (dia_semana 0-6,
-- repete toda semana pra todo aluno). A trilha do curso é diferente: uma
-- sequência linear de dias contados a partir da entrada do aluno na
-- plataforma (Dia 1 = primeiro dia dele), sem repetição semanal. Por isso
-- vive em tabela própria em vez de forçar isso dentro de cronograma_dias.
--
-- Reaproveita o mesmo formato de item usado em CronogramaItem (tipo, ref_id,
-- url, materia, titulo) pra manter compatibilidade futura com o resto do
-- app, com tipos adicionais pra atividades que ainda não têm conteúdo
-- estruturado na plataforma (leitura de livro, redação, revisão geral).

create table if not exists trilha_dias (
  id uuid primary key default gen_random_uuid(),
  dia_numero integer not null unique check (dia_numero >= 1),
  titulo text not null default 'Missão do dia',
  itens jsonb not null default '[]'::jsonb,
  atividades jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_trilha_dias_updated_at before update on trilha_dias for each row execute function set_updated_at();

alter table trilha_dias enable row level security;
create policy "trilha_dias_admin_all" on trilha_dias for all using (is_admin()) with check (is_admin());
create policy "trilha_dias_select_all" on trilha_dias for select using (true);
