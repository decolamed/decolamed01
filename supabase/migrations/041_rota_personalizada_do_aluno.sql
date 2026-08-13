-- ============================================================================
-- ROTA PERSONALIZADA DO ALUNO
--
-- Até aqui não existia rota. O cronograma do aluno era derivado a cada
-- leitura de três fontes que discordavam entre si:
--
--   conteúdo      → trilha_dias (template global, dia_numero 1..40)
--   "dia de hoje" → dias desde matriculas.acesso_liberado_em
--   datas         → hoje + (dia_numero − dia_de_hoje)
--
-- A data que o aluno informou no briefing (inicio_estudos) NUNCA entrava
-- nessa conta. Medido neste banco: matrícula 2026-07-22, início informado
-- 2026-08-12, hoje 2026-08-12 → o sistema calculava "dia 22" e datava o dia
-- 1 em 2026-07-22. Daí "Dia 22" como segundo dia, "21 dias anteriores" e as
-- atividades em julho num cronograma que começa em agosto.
--
-- Esta tabela torna a rota um objeto de primeira classe, com três conceitos
-- que antes estavam fundidos num único `dia_numero`:
--
--   route_day      → posição do aluno na SUA rota (1..N). É o que a tela mostra.
--   template_days  → de quais dias do template veio o conteúdo. Só referência.
--   scheduled_date → a data real em que ele executa aquele dia.
--
-- `trilha_dias` continua intacta: é a fonte de conteúdo dos dois planos, não
-- a régua de ninguém.
-- ============================================================================

create table if not exists public.aluno_rota_dias (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles(id) on delete cascade,

  -- Posição na rota do aluno. 1..N, sem buraco.
  route_day integer not null check (route_day >= 1),

  -- Data real de execução. Nunca antes do início informado, nunca no dia da
  -- prova ou depois.
  scheduled_date date not null,

  -- Origem do conteúdo no template. Vazio nos dias de simulado e revisão,
  -- que a rota cria por conta própria.
  template_days integer[] not null default '{}',

  tipo text not null check (tipo in ('estudo', 'simulado', 'revisao')),
  titulo text not null,
  itens jsonb not null default '[]'::jsonb,
  minutos integer not null default 0,

  -- Assinatura dos parâmetros que geraram a rota (início, prova, dias da
  -- semana, minutos/dia). Quando o briefing muda, a assinatura muda e a rota
  -- inteira é regerada — é o que impede duas versões de cronograma
  -- convivendo.
  assinatura text not null,
  gerada_em timestamptz not null default now(),

  -- Um dia por posição e um dia por data: sem duplicidade possível.
  unique (aluno_id, route_day),
  unique (aluno_id, scheduled_date)
);

create index if not exists aluno_rota_dias_aluno_data_idx
  on public.aluno_rota_dias (aluno_id, scheduled_date);

alter table public.aluno_rota_dias enable row level security;

create policy aluno_rota_dias_select_own on public.aluno_rota_dias
  for select using (aluno_id = (select auth.uid()) or is_admin());

create policy aluno_rota_dias_admin_all on public.aluno_rota_dias
  for all using (is_admin()) with check (is_admin());

comment on table public.aluno_rota_dias is
  'Rota personalizada do aluno: um registro por dia da rota. route_day é a numeração que o aluno vê; template_days guarda apenas a origem do conteúdo em trilha_dias.';
