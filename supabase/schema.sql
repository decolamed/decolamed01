-- ============================================================================
-- DECOLA MED — SCHEMA INICIAL (Supabase / Postgres)
-- Rode este arquivo no SQL editor do Supabase (ou via supabase db push).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type user_role as enum ('aluno', 'admin');
create type matricula_status as enum ('pendente', 'ativa', 'bloqueada', 'cancelada');
create type pagamento_status as enum ('pendente', 'confirmado', 'recebido', 'estornado', 'falhou');
create type forma_pagamento as enum ('pix', 'boleto', 'cartao');

-- ----------------------------------------------------------------------------
-- PLANOS
-- Conteúdo 100% administrável pelo painel (nada fixo no código).
-- ----------------------------------------------------------------------------
create table planos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text,
  preco_centavos integer not null,
  ciclo text not null default 'unico', -- unico | mensal | anual (preparado p/ futuro)
  beneficios jsonb not null default '[]'::jsonb, -- lista de strings
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PROFILES
-- Estende auth.users do Supabase (não duplica email/senha).
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  telefone text,
  cpf text,
  role user_role not null default 'aluno',
  plano_id uuid references planos(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PRE_CADASTROS
-- Criado no momento em que o aluno preenche o formulário de matrícula,
-- antes da confirmação de pagamento.
-- ----------------------------------------------------------------------------
create table pre_cadastros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  cpf text not null,
  telefone text not null,
  plano_id uuid not null references planos(id),
  asaas_customer_id text,
  asaas_charge_id text,
  convertido boolean not null default false, -- true quando virou matrícula
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- MATRICULAS
-- ----------------------------------------------------------------------------
create table matriculas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references profiles(id) on delete set null,
  pre_cadastro_id uuid references pre_cadastros(id),
  plano_id uuid not null references planos(id),
  status matricula_status not null default 'pendente',
  asaas_customer_id text,
  asaas_charge_id text,
  acesso_liberado_em timestamptz,
  acesso_liberado_manualmente boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PAGAMENTOS
-- Um registro por cobrança/evento relevante vindo do Asaas.
-- ----------------------------------------------------------------------------
create table pagamentos (
  id uuid primary key default gen_random_uuid(),
  matricula_id uuid references matriculas(id) on delete set null,
  pre_cadastro_id uuid references pre_cadastros(id),
  asaas_payment_id text not null unique,
  valor_centavos integer not null,
  forma_pagamento forma_pagamento,
  status pagamento_status not null default 'pendente',
  data_pagamento timestamptz,
  payload jsonb, -- payload bruto do webhook, útil para auditoria
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PERMISSOES
-- Preparado para permissões granulares futuras. Hoje o controle principal
-- é profiles.role, mas esta tabela permite evoluir sem migrar schema.
-- ----------------------------------------------------------------------------
create table permissoes (
  id uuid primary key default gen_random_uuid(),
  chave text not null unique,
  descricao text
);

create table usuario_permissoes (
  usuario_id uuid references profiles(id) on delete cascade,
  permissao_id uuid references permissoes(id) on delete cascade,
  primary key (usuario_id, permissao_id)
);

-- ----------------------------------------------------------------------------
-- CONFIGURACOES
-- Textos e conteúdos institucionais do site, editáveis pelo painel.
-- Chave/valor simples: ex. ('site.hero.titulo', '"A sua aprovação..."')
-- ----------------------------------------------------------------------------
create table configuracoes (
  chave text primary key,
  valor jsonb not null,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- NOTIFICACOES
-- ----------------------------------------------------------------------------
create table notificacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references profiles(id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- TABELAS FUTURAS (NÃO CRIADAS AGORA — apenas documentadas para referência
-- de arquitetura, conforme escopo da v1). Quando forem implementadas, seguir
-- o mesmo padrão: FK para profiles/matriculas, RLS por role e por dono.
--
--   cursos, aulas, modulos_curso
--   questoes, alternativas, respostas_aluno
--   flashcards, flashcard_revisoes
--   redacoes, redacao_correcoes
--   simulados, simulado_resultados
--   desempenho_agregado
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TRIGGERS: updated_at automático
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_planos_updated_at before update on planos
  for each row execute function set_updated_at();
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_matriculas_updated_at before update on matriculas
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table planos enable row level security;
alter table profiles enable row level security;
alter table pre_cadastros enable row level security;
alter table matriculas enable row level security;
alter table pagamentos enable row level security;
alter table permissoes enable row level security;
alter table usuario_permissoes enable row level security;
alter table configuracoes enable row level security;
alter table notificacoes enable row level security;

-- helper: verifica se o usuário logado é admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- planos: público lê apenas ativos; admin gerencia tudo
create policy "planos_select_publico" on planos for select using (ativo = true or is_admin());
create policy "planos_admin_all" on planos for all using (is_admin()) with check (is_admin());

-- configuracoes: público lê tudo; admin gerencia
create policy "config_select_publico" on configuracoes for select using (true);
create policy "config_admin_all" on configuracoes for all using (is_admin()) with check (is_admin());

-- profiles: usuário vê/edita o próprio perfil; admin vê/edita todos
create policy "profiles_select_own_or_admin" on profiles for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own_or_admin" on profiles for update using (auth.uid() = id or is_admin());
create policy "profiles_admin_insert" on profiles for insert with check (auth.uid() = id or is_admin());

-- matriculas: aluno vê a própria; admin vê/gerencia todas
create policy "matriculas_select_own_or_admin" on matriculas for select using (aluno_id = auth.uid() or is_admin());
create policy "matriculas_admin_all" on matriculas for all using (is_admin()) with check (is_admin());

-- pagamentos: apenas admin (dados financeiros sensíveis) + o próprio aluno via matrícula
create policy "pagamentos_admin_all" on pagamentos for all using (is_admin()) with check (is_admin());
create policy "pagamentos_select_own" on pagamentos for select using (
  exists (select 1 from matriculas m where m.id = pagamentos.matricula_id and m.aluno_id = auth.uid())
);

-- pre_cadastros: apenas admin (contém CPF/telefone antes de virar usuário)
create policy "pre_cadastros_admin_all" on pre_cadastros for all using (is_admin()) with check (is_admin());

-- permissoes / usuario_permissoes: apenas admin
create policy "permissoes_admin_all" on permissoes for all using (is_admin()) with check (is_admin());
create policy "usuario_permissoes_admin_all" on usuario_permissoes for all using (is_admin()) with check (is_admin());

-- notificacoes: usuário vê as próprias; admin vê/gerencia todas
create policy "notificacoes_select_own_or_admin" on notificacoes for select using (usuario_id = auth.uid() or is_admin());
create policy "notificacoes_update_own" on notificacoes for update using (usuario_id = auth.uid() or is_admin());
create policy "notificacoes_admin_insert" on notificacoes for insert with check (is_admin());

-- ----------------------------------------------------------------------------
-- SEED mínimo (opcional — ajuste os valores antes de rodar em produção)
-- ----------------------------------------------------------------------------
insert into configuracoes (chave, valor) values
  ('site.hero.titulo', '"A sua aprovação em Medicina começa aqui!"'),
  ('site.contato.whatsapp', '"5500000000000"'),
  ('site.contato.instagram', '"decolamed"')
on conflict (chave) do nothing;
