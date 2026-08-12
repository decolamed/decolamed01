-- ============================================================================
-- SESSÃO DE QUESTÕES DA ATIVIDADE DIÁRIA
--
-- A atividade "5 questões de Biologia" do cronograma não tinha existência
-- própria: era um link para o Banco de Questões filtrado pela matéria. O
-- aluno recebia as 82 questões de Biologia ("1 / 82" no cabeçalho) e, na
-- versão web, um sorteio novo a cada carregamento — sair e voltar trocava as
-- questões.
--
-- Esta tabela dá corpo à atividade: as questões são escolhidas UMA vez,
-- ficam gravadas, e são as mesmas em toda reabertura. Também é ela que
-- permite não repetir questões entre atividades da mesma matéria: o que já
-- foi usado por ESTE aluno sai do sorteio seguinte.
-- ============================================================================

create table if not exists public.aluno_sessao_questoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles(id) on delete cascade,

  -- Identifica a atividade. Para um item do cronograma é a mesma chave do
  -- progresso (`trilha:<dia>:<índice>`); para uma missão do Copiloto,
  -- `missao:<uuid>`.
  chave text not null,

  materia text not null,

  -- As questões da sessão, na ordem em que o aluno responde. Ordem importa:
  -- é o que faz "Questão 3/5" significar sempre a mesma questão.
  questao_ids uuid[] not null,

  -- Quantas o item pedia. Guardado para a tela saber dizer "só havia 3
  -- questões inéditas" em vez de fingir que a atividade tinha 3.
  quantidade_pedida integer not null default 5,

  criada_em timestamptz not null default now(),

  -- Uma sessão por atividade. É isto que garante a persistência: a segunda
  -- abertura encontra a linha existente em vez de sortear de novo.
  unique (aluno_id, chave)
);

create index if not exists aluno_sessao_questoes_aluno_materia_idx
  on public.aluno_sessao_questoes (aluno_id, materia);

alter table public.aluno_sessao_questoes enable row level security;

create policy aluno_sessao_questoes_own on public.aluno_sessao_questoes
  for all
  to authenticated
  using (aluno_id = (select auth.uid()) or is_admin())
  with check (aluno_id = (select auth.uid()) or is_admin());

comment on table public.aluno_sessao_questoes is
  'Questões sorteadas para uma atividade diária do cronograma. Fixas a partir da criação e excluídas dos sorteios seguintes do mesmo aluno.';
