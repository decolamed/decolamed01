-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 002: duração de acesso + cupons
-- Rode no SQL editor do Supabase DEPOIS do schema.sql inicial.
-- ============================================================================

-- Duração do acesso do plano (em meses). NULL = acesso ilimitado.
alter table planos add column if not exists duracao_meses integer;

-- Quando o acesso do aluno vence (calculado no momento da confirmação do
-- pagamento, a partir de planos.duracao_meses). NULL = acesso ilimitado.
alter table matriculas add column if not exists acesso_expira_em timestamptz;

-- Cupom aplicado no pré-cadastro (auditoria) e valor de desconto em centavos.
alter table pre_cadastros add column if not exists cupom_codigo text;
alter table pre_cadastros add column if not exists desconto_centavos integer not null default 0;
alter table matriculas add column if not exists cupom_codigo text;

-- ----------------------------------------------------------------------------
-- CUPONS
-- ----------------------------------------------------------------------------
create table if not exists cupons (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  tipo text not null check (tipo in ('percentual', 'fixo')),
  valor numeric not null check (valor > 0), -- percentual: 0-100 | fixo: reais
  valido_ate timestamptz,
  limite_usos integer, -- null = sem limite
  usos integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table cupons enable row level security;

-- Cupons nunca são lidos diretamente pelo público — a validação acontece
-- via API route com a service role key (evita expor a lista de códigos).
create policy "cupons_admin_all" on cupons for all using (is_admin()) with check (is_admin());
