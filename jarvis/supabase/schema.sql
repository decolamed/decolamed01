-- ===========================================================================
-- JARVIS — esquema completo do banco
--
-- Rode este arquivo inteiro no SQL Editor do Supabase, uma única vez, num
-- projeto novo. Ele é idempotente o suficiente para ser re-executado, mas o
-- caminho testado é a instalação limpa.
--
-- Hierarquia dos dados (é a mesma que o aluno vê na tela):
--
--     tutorias                 "Tutoria 1 — Dor torácica"      (a pasta)
--       └─ situacoes_problema  "SP 1.1 — Homem de 58 anos..."  (a subpasta)
--            ├─ objetivos      os objetivos de aprendizagem
--            ├─ mensagens      a conversa com o Jarvis
--            └─ resumos        o material formatado que sobra do estudo
--
--     memorias                 o que o Jarvis sabe sobre o aluno (transversal)
--
-- REGRA DE OURO DE SEGURANÇA: toda tabela de conteúdo carrega `usuario_id` e
-- tem RLS ligada em cima dele. O `usuario_id` é redundante nas tabelas filhas
-- (daria para chegar nele por JOIN), e essa redundância é proposital: sem ela,
-- cada policy viraria um subselect na tabela pai, o que é mais lento e MUITO
-- mais fácil de escrever errado. O gatilho `trava_dono` no fim do arquivo
-- garante que a redundância nunca fica inconsistente.
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- perfis
-- ---------------------------------------------------------------------------
create table if not exists perfis (
  id uuid primary key references auth.users on delete cascade,
  nome text not null default '',
  email text not null,
  -- Qual motor de IA este usuário quer usar. A CHAVE de cada motor mora só em
  -- variável de ambiente do servidor — aqui fica apenas a preferência.
  motor_ia text not null default 'claude' check (motor_ia in ('claude', 'gemini')),
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- tutorias — a pasta de primeiro nível
-- ---------------------------------------------------------------------------
create table if not exists tutorias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users on delete cascade,
  -- O "1" de "Tutoria 1". É o que forma o código da SP (1.1, 1.2...).
  numero int not null check (numero > 0),
  titulo text not null check (length(btrim(titulo)) > 0),
  -- Ex.: "Módulo IV — Saúde da Mulher". Vazio é permitido; entra na chave
  -- única para que dois módulos possam ter, cada um, a sua "Tutoria 1".
  modulo text not null default '',
  arquivada boolean not null default false,
  criado_em timestamptz not null default now(),
  unique (usuario_id, modulo, numero)
);

create index if not exists tutorias_usuario_idx on tutorias (usuario_id, arquivada, numero);

-- ---------------------------------------------------------------------------
-- situacoes_problema — a subpasta ("SP 1.1")
-- ---------------------------------------------------------------------------
create table if not exists situacoes_problema (
  id uuid primary key default gen_random_uuid(),
  tutoria_id uuid not null references tutorias on delete cascade,
  usuario_id uuid not null references auth.users on delete cascade,
  -- O ".1" de "SP 1.1".
  ordem int not null check (ordem > 0),
  titulo text not null check (length(btrim(titulo)) > 0),
  -- O enunciado da situação-problema, colado pelo aluno. É o contexto mais
  -- importante que o Jarvis recebe: sem ele o assistente estuda no vácuo.
  enunciado text not null default '',
  encerrada boolean not null default false,
  criado_em timestamptz not null default now(),
  unique (tutoria_id, ordem)
);

create index if not exists sp_tutoria_idx on situacoes_problema (tutoria_id, ordem);
create index if not exists sp_usuario_idx on situacoes_problema (usuario_id);

-- ---------------------------------------------------------------------------
-- objetivos de aprendizagem
-- ---------------------------------------------------------------------------
create table if not exists objetivos (
  id uuid primary key default gen_random_uuid(),
  sp_id uuid not null references situacoes_problema on delete cascade,
  usuario_id uuid not null references auth.users on delete cascade,
  ordem int not null,
  texto text not null check (length(btrim(texto)) > 0),
  concluido boolean not null default false,
  criado_em timestamptz not null default now()
);

create index if not exists objetivos_sp_idx on objetivos (sp_id, ordem);
create index if not exists objetivos_usuario_idx on objetivos (usuario_id);

-- ---------------------------------------------------------------------------
-- mensagens — a conversa. Uma thread por situação-problema.
-- ---------------------------------------------------------------------------
create table if not exists mensagens (
  id uuid primary key default gen_random_uuid(),
  sp_id uuid not null references situacoes_problema on delete cascade,
  usuario_id uuid not null references auth.users on delete cascade,
  papel text not null check (papel in ('usuario', 'jarvis')),
  conteudo text not null,
  -- Rastro do que o Jarvis FEZ nesse turno (buscas no PubMed, artigos lidos,
  -- resumo salvo). É o que permite mostrar "ele pesquisou X e leu Y" na tela
  -- em vez de pedir que o aluno confie na palavra do modelo.
  acoes jsonb not null default '[]'::jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists mensagens_sp_idx on mensagens (sp_id, criado_em);
create index if not exists mensagens_usuario_idx on mensagens (usuario_id);

-- ---------------------------------------------------------------------------
-- resumos — o produto final do estudo
-- ---------------------------------------------------------------------------
create table if not exists resumos (
  id uuid primary key default gen_random_uuid(),
  sp_id uuid not null references situacoes_problema on delete cascade,
  usuario_id uuid not null references auth.users on delete cascade,
  titulo text not null check (length(btrim(titulo)) > 0),
  -- Markdown estendido — ver src/lib/resumo/renderizar.ts para a gramática.
  corpo text not null,
  -- [{pmid, titulo, autores, revista, ano, doi}] — o que sustenta o texto.
  referencias jsonb not null default '[]'::jsonb,
  motor text not null default 'claude',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists resumos_sp_idx on resumos (sp_id, criado_em desc);
create index if not exists resumos_usuario_idx on resumos (usuario_id, criado_em desc);

-- ---------------------------------------------------------------------------
-- memorias — o que o Jarvis lembra do aluno entre uma conversa e outra
-- ---------------------------------------------------------------------------
create table if not exists memorias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users on delete cascade,
  fato text not null check (length(btrim(fato)) > 0),
  origem_sp_id uuid references situacoes_problema on delete set null,
  criado_em timestamptz not null default now(),
  -- Sem isto o assistente re-salva o mesmo fato a cada conversa e a memória
  -- vira um monte de repetição que só gasta contexto.
  unique (usuario_id, fato)
);

create index if not exists memorias_usuario_idx on memorias (usuario_id, criado_em desc);

-- ===========================================================================
-- Gatilhos
-- ===========================================================================

-- Cria o perfil assim que o usuário se cadastra. Sem isto, o primeiro acesso
-- de todo mundo cai numa tela sem perfil.
create or replace function criar_perfil_do_usuario()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into perfis (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function criar_perfil_do_usuario();

-- `atualizado_em` que realmente acompanha a edição.
create or replace function tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists resumos_atualizado_em on resumos;
create trigger resumos_atualizado_em
  before update on resumos
  for each row execute function tocar_atualizado_em();

-- Mantém honesto o `usuario_id` redundante das tabelas filhas: ele é sempre
-- copiado do pai, nunca aceito do cliente. Sem este gatilho, alguém poderia
-- inserir uma SP na tutoria de outra pessoa marcando `usuario_id` como o seu
-- próprio — a policy de INSERT aprovaria (o usuario_id bate com auth.uid()) e
-- a linha apareceria na pasta da vítima.
create or replace function herdar_dono_da_tutoria()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  select usuario_id into new.usuario_id from tutorias where id = new.tutoria_id;
  if new.usuario_id is null then
    raise exception 'tutoria % não existe', new.tutoria_id;
  end if;
  return new;
end;
$$;

create or replace function herdar_dono_da_sp()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  select usuario_id into new.usuario_id from situacoes_problema where id = new.sp_id;
  if new.usuario_id is null then
    raise exception 'situação-problema % não existe', new.sp_id;
  end if;
  return new;
end;
$$;

drop trigger if exists sp_herda_dono on situacoes_problema;
create trigger sp_herda_dono
  before insert or update of tutoria_id on situacoes_problema
  for each row execute function herdar_dono_da_tutoria();

drop trigger if exists objetivos_herda_dono on objetivos;
create trigger objetivos_herda_dono
  before insert or update of sp_id on objetivos
  for each row execute function herdar_dono_da_sp();

drop trigger if exists mensagens_herda_dono on mensagens;
create trigger mensagens_herda_dono
  before insert or update of sp_id on mensagens
  for each row execute function herdar_dono_da_sp();

drop trigger if exists resumos_herda_dono on resumos;
create trigger resumos_herda_dono
  before insert or update of sp_id on resumos
  for each row execute function herdar_dono_da_sp();

-- ===========================================================================
-- RLS — cada usuário só enxerga o que é dele. Sem exceção e sem policy pública.
-- ===========================================================================

alter table perfis              enable row level security;
alter table tutorias            enable row level security;
alter table situacoes_problema  enable row level security;
alter table objetivos           enable row level security;
alter table mensagens           enable row level security;
alter table resumos             enable row level security;
alter table memorias            enable row level security;

drop policy if exists perfis_proprio on perfis;
create policy perfis_proprio on perfis
  for select using (id = (select auth.uid()));

drop policy if exists perfis_edita_proprio on perfis;
create policy perfis_edita_proprio on perfis
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

do $$
declare
  t text;
begin
  foreach t in array array['tutorias', 'situacoes_problema', 'objetivos', 'mensagens', 'resumos', 'memorias']
  loop
    execute format('drop policy if exists %I_do_dono on %I', t, t);
    execute format(
      'create policy %I_do_dono on %I for all
         using (usuario_id = (select auth.uid()))
         with check (usuario_id = (select auth.uid()))',
      t, t
    );
  end loop;
end;
$$;

-- Revoga o acesso genérico e devolve só o necessário: RLS filtra LINHAS, mas
-- não substitui GRANT. Sem isto, um papel com GRANT amplo em `public` acaba
-- enxergando tabela que não devia.
revoke all on all tables in schema public from anon, authenticated;

grant select, insert, update, delete on
  tutorias, situacoes_problema, objetivos, mensagens, resumos, memorias
  to authenticated;

-- `perfis` é o único caso com GRANT por COLUNA. O usuário lê o próprio perfil
-- inteiro, mas só pode escrever em `nome` e `motor_ia` — nunca em `id` nem em
-- `email`, que são a identidade dele. O Postgres recusa esse UPDATE antes de
-- qualquer regra nossa rodar, o que é bem mais difícil de furar do que um
-- gatilho que alguém pode esquecer de manter.
grant select on perfis to authenticated;
grant update (nome, motor_ia) on perfis to authenticated;
