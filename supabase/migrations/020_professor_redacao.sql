-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 020: painel dedicado do professor (redação)
--
-- Reverte o "professor usa o painel do admin" temporário da migração 018:
-- agora existe uma área própria (/professor) para o professor de redação
-- acompanhar os créditos de redação dos alunos.
--
-- Duas tabelas novas:
-- 1) redacoes_creditos_ajustes: os créditos de redação hoje vêm só do plano
--    do aluno (planos.creditos_redacao, fixo). Isso permite o professor
--    adicionar/remover créditos manualmente por aluno (bônus, cortesia,
--    correção extra etc.) sem mexer no plano dele. Quantidade positiva =
--    crédito adicionado; negativa = removido.
-- 2) redacoes_professor_ocultos: permite ao professor "remover" um aluno da
--    lista do painel de redação sem excluir a conta do aluno de verdade
--    (isso continua sendo uma ação exclusiva do admin em /admin/usuarios).
-- ============================================================================

create or replace function is_professor()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'professor'
  );
$$ language sql stable security definer;

create table if not exists redacoes_creditos_ajustes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  quantidade integer not null,
  motivo text,
  criado_por uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table redacoes_creditos_ajustes enable row level security;

create policy "redacoes_ajustes_admin_all" on redacoes_creditos_ajustes for all using (is_admin()) with check (is_admin());
create policy "redacoes_ajustes_professor_all" on redacoes_creditos_ajustes for all using (is_professor()) with check (is_professor());
create policy "redacoes_ajustes_select_own" on redacoes_creditos_ajustes for select using (aluno_id = auth.uid());

create table if not exists redacoes_professor_ocultos (
  aluno_id uuid primary key references profiles(id) on delete cascade,
  ocultado_por uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table redacoes_professor_ocultos enable row level security;

create policy "redacoes_ocultos_admin_all" on redacoes_professor_ocultos for all using (is_admin()) with check (is_admin());
create policy "redacoes_ocultos_professor_all" on redacoes_professor_ocultos for all using (is_professor()) with check (is_professor());

-- O professor precisa notificar o aluno quando marca uma redação como
-- corrigida (mesma tabela já usada por /admin/notificacoes).
create policy "notificacoes_professor_insert" on notificacoes for insert with check (is_professor());
