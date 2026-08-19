-- Aplicada no projeto remoto em 19/08/2026 (dias_esvaziados_pelo_mentor).
--
-- DIAS QUE O MENTOR ESVAZIOU
--
-- A rota do aluno é REGERADA a cada leitura da tela (rotaDoAluno →
-- gerarRota → sincronizarRota). Apagar o conteúdo direto em
-- `aluno_rota_dias` seria desfeito no carregamento seguinte.
--
-- Esta tabela é a intenção do mentor, e é ela que entra como ENTRADA da
-- geração — mesmo padrão já usado por `aluno_simulados_rota`. O dia continua
-- existindo, com a mesma data e o mesmo número; só não recebe conteúdo.

create table if not exists public.aluno_rota_dias_limpos (
  aluno_id   uuid        not null references public.profiles(id) on delete cascade,
  route_day  integer     not null check (route_day > 0),
  criado_em  timestamptz not null default now(),
  primary key (aluno_id, route_day)
);

comment on table public.aluno_rota_dias_limpos is
  'Dias da rota que o mentor esvaziou no painel. O dia continua na rota, sem conteúdo.';

alter table public.aluno_rota_dias_limpos enable row level security;

create policy aluno_rota_dias_limpos_select on public.aluno_rota_dias_limpos
  for select using (auth.uid() = aluno_id or public.is_admin());

create policy aluno_rota_dias_limpos_admin on public.aluno_rota_dias_limpos
  for all using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_rota_dias_limpos_aluno
  on public.aluno_rota_dias_limpos (aluno_id);

-- `redefinir_perfil_aluno` ganhou o delete desta tabela: um aluno zerado não
-- pode voltar com buracos no cronograma novo. A função foi reconstruída a
-- partir da definição vigente no banco, acrescentando UMA linha — ver o
-- histórico de migrations 042/049/061 antes de reescrevê-la de novo.
