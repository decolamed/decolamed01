-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 035: progresso de itens (videoaulas e missões)
--
-- Tabela única e genérica para dois usos:
--   1) posição/duração da videoaula (segundos) — permite "Continuar
--      assistindo" e concluir automaticamente ao passar de 90% do vídeo;
--   2) conclusão manual de qualquer item mostrado ao aluno (aula, PDF, link,
--      questões, flashcards, simulado, revisão, dia livre) — cobre tanto os
--      itens do cronograma (trilha_dias, sem registro individual por aluno)
--      quanto aulas soltas assistidas fora do cronograma (Estudos/Hangar).
--
-- `chave` identifica o item de forma estável sem precisar de uma FK única
-- por tipo:
--   "aula:<conteudo_id>"        — vídeo de conteudos_biblioteca (qualquer
--                                  tela que abra essa aula usa a mesma chave,
--                                  então o progresso e a conclusão são
--                                  compartilhados entre cronograma/Estudos)
--   "trilha:<dia_numero>:<indice>" — item de um dia do cronograma que não é
--                                  aula (pdf/link/questões/flashcards/
--                                  simulado/revisão/livre)
-- ============================================================================

create table if not exists public.aluno_progresso_itens (
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  chave text not null,
  concluida boolean not null default false,
  concluida_em timestamptz,
  posicao_segundos integer not null default 0,
  duracao_segundos integer,
  updated_at timestamptz not null default now(),
  primary key (aluno_id, chave)
);

create index if not exists idx_aluno_progresso_itens_aluno on public.aluno_progresso_itens(aluno_id);

create trigger trg_aluno_progresso_itens_updated_at
  before update on public.aluno_progresso_itens
  for each row execute function set_updated_at();

alter table public.aluno_progresso_itens enable row level security;

-- (select auth.uid()) em vez de auth.uid() puro: o Postgres resolve o
-- select uma única vez por consulta (InitPlan) em vez de reavaliar a
-- função a cada linha — recomendação oficial do Supabase para políticas
-- de RLS em tabelas que podem crescer bastante.
create policy "aluno_progresso_itens_own" on public.aluno_progresso_itens
  for all using (aluno_id = (select auth.uid()) or is_admin())
  with check (aluno_id = (select auth.uid()) or is_admin());
