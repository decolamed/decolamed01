-- Aplicada no projeto remoto em 19/08/2026 (ajustes_do_mentor_na_rota).
--
-- O MENTOR EDITA O CRONOGRAMA DE UM ALUNO
--
-- Generaliza `aluno_rota_dias_limpos` (migration 063), que guardava só
-- "este dia fica vazio". Agora a linha guarda O CONTEÚDO do dia: uma lista de
-- itens que SUBSTITUI a que o gerador montaria. Esvaziar um dia passa a ser o
-- caso particular de `itens = []` — um conceito só, em vez de dois.
--
-- Por que não editar `aluno_rota_dias` direto: a rota é REGERADA a cada
-- leitura da tela do aluno (rotaDoAluno -> gerarRota -> sincronizarRota). Uma
-- edição ali seria desfeita no carregamento seguinte. `aluno_rota_dias` é
-- resultado; esta tabela é INTENÇÃO, e intenção sobrevive à regeração.
--
-- É por aluno: a mesma edição nunca vaza para o cronograma de outro. O
-- cronograma compartilhado continua sendo `trilha_dias`, intocado por aqui.

create table if not exists public.aluno_rota_dias_ajustes (
  aluno_id      uuid        not null references public.profiles(id) on delete cascade,
  route_day     integer     not null check (route_day > 0),
  titulo        text,
  itens         jsonb       not null default '[]'::jsonb,
  atualizado_em timestamptz not null default now(),
  primary key (aluno_id, route_day),
  constraint ajustes_itens_e_lista check (jsonb_typeof(itens) = 'array')
);

comment on table public.aluno_rota_dias_ajustes is
  'Conteúdo que o mentor definiu para um dia da rota de UM aluno. Substitui o que o gerador montaria.';

alter table public.aluno_rota_dias_ajustes enable row level security;

create policy aluno_rota_dias_ajustes_select on public.aluno_rota_dias_ajustes
  for select using (auth.uid() = aluno_id or public.is_admin());

create policy aluno_rota_dias_ajustes_admin on public.aluno_rota_dias_ajustes
  for all using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_rota_dias_ajustes_aluno
  on public.aluno_rota_dias_ajustes (aluno_id);

-- Os dias já esvaziados viram ajustes com lista vazia — mesmo efeito, um
-- conceito só. Nenhum mentor perde o que já tinha feito.
insert into public.aluno_rota_dias_ajustes (aluno_id, route_day, itens, atualizado_em)
select aluno_id, route_day, '[]'::jsonb, criado_em
from public.aluno_rota_dias_limpos
on conflict (aluno_id, route_day) do nothing;

drop table if exists public.aluno_rota_dias_limpos;

-- `redefinir_perfil_aluno` teve a linha dos dias esvaziados trocada pela dos
-- ajustes. Reconstruída a partir da definição vigente no banco — ver o
-- histórico 042/049/061/063 antes de reescrevê-la de novo.
