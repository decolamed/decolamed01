-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 005: gestão manual de alunos, parceiros/afiliados e
-- dashboard de vendas.
-- Rode no SQL editor do Supabase DEPOIS da migração 004 (que precisa estar
-- commitada antes, pois usa o novo valor 'parceiro' do enum user_role).
--
-- Reaproveita ao máximo o schema existente:
--   - profiles continua sendo a tabela única de usuários (aluno/admin/parceiro)
--   - matriculas continua sendo a matrícula do aluno num plano
--   - pagamentos continua sendo o registro de "venda" (1 linha por cobrança),
--     agora também usado para vendas manuais e cortesias, não só Asaas
--   - cupons ganha vínculo com parceiro + percentual de comissão
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES: status de ativação + rastreio de criação manual
-- ----------------------------------------------------------------------------
alter table profiles add column if not exists ativo boolean not null default true;
alter table profiles add column if not exists criado_manualmente boolean not null default false;
alter table profiles add column if not exists criado_por uuid references profiles(id);

-- ----------------------------------------------------------------------------
-- CUPONS: vínculo com parceiro + comissão configurável
-- ----------------------------------------------------------------------------
alter table cupons add column if not exists parceiro_id uuid references profiles(id);
alter table cupons add column if not exists percentual_comissao numeric not null default 0
  check (percentual_comissao >= 0 and percentual_comissao <= 100);

comment on column cupons.parceiro_id is
  'Quando preenchido, este cupom é o cupom de afiliado do parceiro — vendas com ele geram comissão.';

-- ----------------------------------------------------------------------------
-- MATRICULAS: origem do pagamento + auditoria de criação manual
-- ----------------------------------------------------------------------------
alter table matriculas add column if not exists origem_pagamento text not null default 'asaas'
  check (origem_pagamento in ('asaas', 'manual', 'cortesia'));
alter table matriculas add column if not exists criado_por uuid references profiles(id);
alter table matriculas add column if not exists observacao text;

-- ----------------------------------------------------------------------------
-- PAGAMENTOS: passa a representar qualquer "venda" (Asaas, manual ou
-- cortesia), não só cobranças do Asaas. Por isso asaas_payment_id deixa de
-- ser obrigatório. Campos de comprador/plano são denormalizados de propósito
-- (mesmo padrão já usado em pre_cadastros/matriculas com cupom_codigo): isso
-- permite que a policy de RLS do parceiro filtre só pela própria linha de
-- pagamentos, sem precisar herdar acesso à tabela profiles de outros alunos.
-- ----------------------------------------------------------------------------
alter table pagamentos alter column asaas_payment_id drop not null;

alter table pagamentos add column if not exists origem_pagamento text not null default 'asaas'
  check (origem_pagamento in ('asaas', 'manual', 'cortesia'));
alter table pagamentos add column if not exists parceiro_id uuid references profiles(id);
alter table pagamentos add column if not exists cupom_codigo text;
alter table pagamentos add column if not exists comissao_centavos integer not null default 0;
alter table pagamentos add column if not exists valor_liquido_centavos integer;
alter table pagamentos add column if not exists criado_por uuid references profiles(id);
alter table pagamentos add column if not exists comprador_nome text;
alter table pagamentos add column if not exists comprador_email text;
alter table pagamentos add column if not exists plano_nome text;
alter table pagamentos add column if not exists plano_id uuid references planos(id);

-- valor_liquido_centavos = valor - comissão, calculado automaticamente quando
-- não informado explicitamente (ex.: estorno, ajuste manual do admin).
create or replace function set_valor_liquido_pagamento()
returns trigger as $$
begin
  if new.valor_liquido_centavos is null then
    new.valor_liquido_centavos := greatest(0, new.valor_centavos - coalesce(new.comissao_centavos, 0));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pagamentos_valor_liquido on pagamentos;
create trigger trg_pagamentos_valor_liquido
  before insert or update on pagamentos
  for each row execute function set_valor_liquido_pagamento();

-- ----------------------------------------------------------------------------
-- COMISSOES_PARCEIRO
-- Ledger de comissões geradas por venda, separado de pagamentos para já
-- deixar pronta a futura tela de "pagar comissão ao parceiro" (marcar como
-- paga, registrar data/comprovante) sem precisar migrar schema de novo.
-- ----------------------------------------------------------------------------
create table if not exists comissoes_parceiro (
  id uuid primary key default gen_random_uuid(),
  parceiro_id uuid not null references profiles(id) on delete cascade,
  pagamento_id uuid not null references pagamentos(id) on delete cascade,
  valor_centavos integer not null,
  status text not null default 'pendente' check (status in ('pendente', 'paga', 'cancelada')),
  data_pagamento timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pagamento_id)
);

create trigger trg_comissoes_parceiro_updated_at before update on comissoes_parceiro
  for each row execute function set_updated_at();

-- Gera/atualiza automaticamente a linha de comissão sempre que um pagamento
-- com parceiro_id + comissao_centavos > 0 for gravado como confirmado/recebido.
create or replace function sync_comissao_parceiro()
returns trigger as $$
begin
  if new.parceiro_id is not null and new.comissao_centavos > 0
     and new.status in ('confirmado', 'recebido') then
    insert into comissoes_parceiro (parceiro_id, pagamento_id, valor_centavos, status)
    values (new.parceiro_id, new.id, new.comissao_centavos, 'pendente')
    on conflict (pagamento_id) do update
      set valor_centavos = excluded.valor_centavos,
          parceiro_id = excluded.parceiro_id;
  elsif new.status in ('estornado', 'falhou') then
    update comissoes_parceiro set status = 'cancelada' where pagamento_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_sync_comissao_parceiro on pagamentos;
create trigger trg_sync_comissao_parceiro
  after insert or update on pagamentos
  for each row execute function sync_comissao_parceiro();

-- ----------------------------------------------------------------------------
-- HISTORICO_ADMIN
-- Trilha de auditoria das ações administrativas sobre usuários/matrículas
-- (criação manual, reenvio de e-mail, ativar/desativar, promover/rebaixar
-- admin, etc.). Requisito explícito: "registrar no histórico que foi criado
-- manualmente pelo administrador".
-- ----------------------------------------------------------------------------
create table if not exists historico_admin (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  usuario_alvo_id uuid references profiles(id) on delete set null,
  admin_id uuid references profiles(id) on delete set null,
  detalhes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_historico_admin_usuario_alvo on historico_admin(usuario_alvo_id);
create index if not exists idx_pagamentos_parceiro on pagamentos(parceiro_id);
create index if not exists idx_pagamentos_cupom on pagamentos(cupom_codigo);
create index if not exists idx_pagamentos_status on pagamentos(status);
create index if not exists idx_pagamentos_plano on pagamentos(plano_id);
create index if not exists idx_cupons_parceiro on cupons(parceiro_id);
create index if not exists idx_comissoes_parceiro_parceiro on comissoes_parceiro(parceiro_id);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table comissoes_parceiro enable row level security;
alter table historico_admin enable row level security;

-- helper: verifica se o usuário logado é parceiro
create or replace function is_parceiro()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'parceiro'
  );
$$ language sql stable security definer;

-- cupons: parceiro pode ler (não editar) apenas o(s) próprio(s) cupom(ns) —
-- necessário para o dashboard mostrar o código/percentual de comissão dele.
create policy "cupons_select_own_parceiro" on cupons for select
  using (parceiro_id = auth.uid());

-- pagamentos: parceiro vê apenas as vendas que geraram comissão para ele.
-- Nunca vê vendas de outros parceiros nem vendas sem cupom de afiliado.
create policy "pagamentos_select_own_parceiro" on pagamentos for select
  using (parceiro_id = auth.uid());

-- comissoes_parceiro: admin gerencia tudo; parceiro só lê as próprias.
create policy "comissoes_parceiro_admin_all" on comissoes_parceiro for all
  using (is_admin()) with check (is_admin());
create policy "comissoes_parceiro_select_own" on comissoes_parceiro for select
  using (parceiro_id = auth.uid());

-- historico_admin: dado sensível de auditoria — apenas admin.
create policy "historico_admin_admin_all" on historico_admin for all
  using (is_admin()) with check (is_admin());
