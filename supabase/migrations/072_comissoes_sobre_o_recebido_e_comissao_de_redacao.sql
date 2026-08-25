-- ============================================================================
-- O DINHEIRO QUE ENTROU, E O QUE SAI DELE
--
-- Duas perguntas que o financeiro precisava responder e não conseguia:
-- "quanto eu recebi líquido neste mês?" e "quanto preciso pagar para cada
-- professor e parceiro neste mês?".
--
-- 1. O QUE ENTROU DE VERDADE
--    `pagamentos.valor_centavos` é o que o ALUNO pagou. Não é o que caiu na
--    conta: o Asaas retém a taxa dele e credita `netValue` — numa venda de
--    R$ 453,69 em 3x, R$ 428,97. A coluna `valor_recebido_centavos` guarda
--    esse número, e é ele que passa a ser a base de tudo que vem depois.
--
--    Vendas manuais e cortesias não passam por gateway e não têm taxa: para
--    elas o recebido é o próprio valor, e é isso que o `coalesce` faz.
--
-- 2. A COMISSÃO SAI DO RECEBIDO, NÃO DO BRUTO
--    O percentual do cupom incidia sobre o valor da venda, incluindo a taxa
--    que a plataforma nunca chegou a ver. Passa a incidir sobre o recebido.
--
-- 3. COMISSÃO DE REDAÇÃO
--    Um valor FIXO por venda, devido à professora responsável pelas redações
--    daquele plano — R$ 80,00, por exemplo. Não é percentual e não depende do
--    preço: é o custo da correção que aquela venda passou a gerar.
--
--    Por isso ela mora no PLANO (quanto, e para quem), e é copiada para a
--    venda no momento em que ela acontece. Copiada, não referenciada: mudar a
--    comissão do plano amanhã não pode reescrever o que já era devido pelas
--    vendas de ontem.
--
-- 4. UMA VENDA, DUAS COMISSÕES
--    `comissoes_parceiro` tinha `unique (pagamento_id)` — uma comissão por
--    venda, e ponto. Uma venda com cupom de parceiro E comissão de redação
--    precisa das duas linhas, então a unicidade passa a ser por
--    (pagamento_id, tipo).
--
--    E `parceiro_id` deixa de se chamar assim: a coluna agora guarda o
--    BENEFICIÁRIO, que é um parceiro numa comissão de cupom e uma professora
--    numa de redação. Um razão financeiro em que a coluna mente sobre o que
--    guarda é o tipo de coisa que produz o próximo bug.
-- ============================================================================

-- ---- 1. O plano define a comissão de redação -------------------------------

alter table public.planos
  add column if not exists comissao_redacao_centavos integer not null default 0,
  add column if not exists professor_id uuid references public.profiles(id) on delete set null;

alter table public.planos
  drop constraint if exists planos_comissao_redacao_check;
alter table public.planos
  add constraint planos_comissao_redacao_check check (comissao_redacao_centavos >= 0);

comment on column public.planos.comissao_redacao_centavos is
  'Valor FIXO devido a professora responsavel a cada venda deste plano, em centavos. 0 = o plano nao gera comissao de redacao.';
comment on column public.planos.professor_id is
  'Quem recebe a comissao de redacao deste plano. Sem professor definido, nenhuma comissao e gerada por mais que o valor esteja preenchido.';

-- ---- 2. A venda registra o que entrou e o que é devido ---------------------

alter table public.pagamentos
  add column if not exists valor_recebido_centavos integer,
  add column if not exists comissao_redacao_centavos integer not null default 0,
  add column if not exists professor_id uuid references public.profiles(id) on delete set null;

alter table public.pagamentos
  drop constraint if exists pagamentos_comissao_redacao_check;
alter table public.pagamentos
  add constraint pagamentos_comissao_redacao_check check (comissao_redacao_centavos >= 0);

create index if not exists idx_pagamentos_professor on public.pagamentos (professor_id);

comment on column public.pagamentos.valor_recebido_centavos is
  'O que o gateway CREDITOU (netValue do Asaas), ja sem a taxa dele. Nulo nas vendas manuais e nas anteriores a esta coluna: nesses casos vale o proprio valor_centavos.';
comment on column public.pagamentos.valor_liquido_centavos is
  'O que sobra para a plataforma: recebido menos as duas comissoes.';

-- ---- 3. O razão de comissões aceita os dois tipos --------------------------

-- A coluna guarda um parceiro OU uma professora; o nome antigo passou a
-- mentir. O Postgres reescreve sozinho a policy que a usa.
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'comissoes_parceiro' and column_name = 'parceiro_id'
  ) then
    alter table public.comissoes_parceiro rename column parceiro_id to beneficiario_id;
  end if;
end $$;

alter table public.comissoes_parceiro
  add column if not exists tipo text not null default 'cupom';

alter table public.comissoes_parceiro
  drop constraint if exists comissoes_parceiro_tipo_check;
alter table public.comissoes_parceiro
  add constraint comissoes_parceiro_tipo_check check (tipo in ('cupom', 'redacao'));

-- Uma venda com cupom de parceiro E comissão de redação precisa das duas
-- linhas. Enquanto a unicidade foi só por pagamento, a segunda comissão
-- sobrescreveria a primeira em silêncio.
alter table public.comissoes_parceiro
  drop constraint if exists comissoes_parceiro_pagamento_id_key;
create unique index if not exists comissoes_pagamento_tipo_key
  on public.comissoes_parceiro (pagamento_id, tipo);

create index if not exists idx_comissoes_beneficiario on public.comissoes_parceiro (beneficiario_id);
create index if not exists idx_comissoes_status on public.comissoes_parceiro (status);

comment on table public.comissoes_parceiro is
  'Razao de comissoes devidas por venda. tipo=cupom: percentual ao parceiro do cupom. tipo=redacao: valor fixo a professora do plano.';
comment on column public.comissoes_parceiro.beneficiario_id is
  'Quem recebe: o parceiro (cupom) ou a professora (redacao).';

-- ---- 4. O líquido é o recebido menos os repasses --------------------------

create or replace function set_valor_liquido_pagamento()
returns trigger as $$
begin
  if new.valor_liquido_centavos is null then
    -- `coalesce` no recebido: venda manual, cortesia e toda venda anterior a
    -- esta migração não têm o número do gateway, e para elas o recebido é o
    -- próprio valor da venda.
    new.valor_liquido_centavos := greatest(0,
      coalesce(new.valor_recebido_centavos, new.valor_centavos)
        - coalesce(new.comissao_centavos, 0)
        - coalesce(new.comissao_redacao_centavos, 0));
  end if;
  return new;
end;
$$ language plpgsql;

-- ---- 5. O razão passa a gerar as duas comissões ---------------------------

create or replace function sync_comissao_parceiro()
returns trigger as $$
begin
  if new.status in ('confirmado', 'recebido') then
    -- Comissão de cupom, para o parceiro afiliado.
    if new.parceiro_id is not null and new.comissao_centavos > 0 then
      insert into comissoes_parceiro (beneficiario_id, pagamento_id, valor_centavos, status, tipo)
      values (new.parceiro_id, new.id, new.comissao_centavos, 'pendente', 'cupom')
      on conflict (pagamento_id, tipo) do update
        -- `status` de propósito fora do update: uma comissão já marcada como
        -- PAGA não pode voltar para pendente porque o pagamento foi regravado.
        set valor_centavos  = excluded.valor_centavos,
            beneficiario_id = excluded.beneficiario_id;
    end if;

    -- Comissão de redação, para a professora do plano.
    if new.professor_id is not null and new.comissao_redacao_centavos > 0 then
      insert into comissoes_parceiro (beneficiario_id, pagamento_id, valor_centavos, status, tipo)
      values (new.professor_id, new.id, new.comissao_redacao_centavos, 'pendente', 'redacao')
      on conflict (pagamento_id, tipo) do update
        set valor_centavos  = excluded.valor_centavos,
            beneficiario_id = excluded.beneficiario_id;
    end if;
  elsif new.status in ('estornado', 'falhou') then
    -- Venda desfeita cancela TODAS as comissões dela, dos dois tipos.
    update comissoes_parceiro set status = 'cancelada' where pagamento_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
