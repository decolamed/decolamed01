-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 019: documenta conteudos_biblioteca e links_externos
--
-- Essas duas tabelas já existiam no banco remoto (criadas fora do fluxo de
-- migrations versionadas, junto com as seções de conteúdo do admin em
-- /admin/cursos, /admin/pdfs e /admin/links), mas nunca tinham um arquivo de
-- migração correspondente no repositório — puro débito de rastreabilidade,
-- sem nenhuma alteração de schema real aqui. `if not exists`/DO blocks
-- tornam a migração idempotente mesmo já existindo no ambiente atual.
-- ============================================================================

create table if not exists conteudos_biblioteca (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'aula' check (tipo in ('aula','artigo','pdf','video_externo')),
  titulo text not null,
  materia text not null,
  assunto text,
  url text,
  duracao_minutos integer not null default 30,
  descricao text,
  ativo boolean not null default true,
  criado_por uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_conteudos_biblioteca_updated_at') then
    create trigger trg_conteudos_biblioteca_updated_at before update on conteudos_biblioteca for each row execute function set_updated_at();
  end if;
end $$;

alter table conteudos_biblioteca enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'conteudos_biblioteca' and policyname = 'conteudos_admin_all') then
    create policy "conteudos_admin_all" on conteudos_biblioteca for all using (is_admin()) with check (is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'conteudos_biblioteca' and policyname = 'conteudos_select_ativos') then
    create policy "conteudos_select_ativos" on conteudos_biblioteca for select using (ativo = true or is_admin());
  end if;
end $$;

create table if not exists links_externos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  url text not null,
  categoria text,
  ativo boolean not null default true,
  ordem integer not null default 0,
  criado_por uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_links_externos_updated_at') then
    create trigger trg_links_externos_updated_at before update on links_externos for each row execute function set_updated_at();
  end if;
end $$;

alter table links_externos enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'links_externos' and policyname = 'links_externos_admin_all') then
    create policy "links_externos_admin_all" on links_externos for all using (is_admin()) with check (is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'links_externos' and policyname = 'links_externos_select_ativos') then
    create policy "links_externos_select_ativos" on links_externos for select using (ativo = true or is_admin());
  end if;
end $$;
