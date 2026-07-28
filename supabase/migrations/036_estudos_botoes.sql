-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 036: botões personalizados da aba Estudos
--
-- Permite ao admin adicionar atalhos à aba Estudos do app do aluno sem
-- alterar código (ex.: "Bagagem Essencial" apontando pra um PDF ou link).
--
-- tipo controla como o botão abre pro aluno (ver scrEstudos() em
-- decola-app.tsx):
--   "link" / "pdf" — abre no navegador interno (scrBrowser)
--   "aula"         — abre no player integrado de videoaula (scrPlayer),
--                     com progresso salvo automaticamente
--   "app"          — navega pra uma tela já existente do app; `link` guarda
--                     a chave da tela (ex.: "flashcards", "questoes")
-- ============================================================================

create table if not exists public.estudos_botoes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  icone text not null default 'book',
  tipo text not null default 'link' check (tipo in ('link','aula','pdf','app')),
  link text not null,
  ordem integer not null default 0,
  ativo boolean not null default true,
  criado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_estudos_botoes_updated_at
  before update on public.estudos_botoes
  for each row execute function set_updated_at();

alter table public.estudos_botoes enable row level security;

create policy "estudos_botoes_admin_all" on public.estudos_botoes
  for all using (is_admin()) with check (is_admin());
create policy "estudos_botoes_select_ativos" on public.estudos_botoes
  for select using (ativo = true or is_admin());
