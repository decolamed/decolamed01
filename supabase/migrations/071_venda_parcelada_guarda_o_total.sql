-- ============================================================================
-- VENDA PARCELADA: UMA LINHA, O VALOR TOTAL
--
-- O problema: uma venda de R$ 453,69 parcelada em 3x aparecia em /admin/vendas
-- como R$ 151,23. O webhook grava `payment.value`, e num parcelamento o Asaas
-- devolve nesse campo o valor de UMA parcela — não o da compra. A comissão do
-- parceiro saía do mesmo número, então também vinha um terço do devido.
--
-- Duas colunas resolvem a origem do dado e duas resolvem o registro dela:
--
-- 1. `pre_cadastros.valor_total_centavos` e `.parcelas`
--    O checkout JÁ calcula os dois (api/matricula/route.ts) para mandar ao
--    Asaas, e depois os jogava fora. Guardá-los é o que permite à confirmação
--    saber o total sem depender do que o gateway devolve por parcela.
--
-- 2. `pagamentos.asaas_installment_id`
--    As 3 parcelas são 3 cobranças com ids diferentes e o MESMO
--    `externalReference`. Como a linha de venda é idempotente por
--    `asaas_payment_id`, cada parcela confirmada meses depois criaria uma
--    venda NOVA — e o painel passaria a contar a mesma compra três vezes.
--    O Asaas identifica o grupo de parcelas em `payment.installment`; é ele
--    que passa a ser a chave da venda parcelada.
--
-- 3. `pagamentos.parcelas` e `.valor_parcela_centavos`
--    Para a tela mostrar "3× de R$ 151,23" embaixo do total. Sem isso, trocar
--    o valor exibido pelo total apagaria a informação de como foi pago.
--
-- Nada aqui apaga ou reescreve dado existente. A correção da venda que já
-- estava gravada errada é feita à parte, no registro dela.
-- ============================================================================

alter table public.pre_cadastros
  add column if not exists valor_total_centavos integer,
  add column if not exists parcelas integer;

alter table public.pre_cadastros
  drop constraint if exists pre_cadastros_parcelas_check;
alter table public.pre_cadastros
  add constraint pre_cadastros_parcelas_check check (parcelas is null or parcelas >= 1);

alter table public.pagamentos
  add column if not exists asaas_installment_id text,
  add column if not exists parcelas integer not null default 1,
  add column if not exists valor_parcela_centavos integer;

alter table public.pagamentos
  drop constraint if exists pagamentos_parcelas_check;
alter table public.pagamentos
  add constraint pagamentos_parcelas_check check (parcelas >= 1);

-- Índice ÚNICO e não parcial de propósito: é o alvo do `on conflict` que
-- impede a segunda e a terceira parcela de virarem vendas novas. Em Postgres
-- nulos são distintos entre si num índice único, então as vendas à vista
-- (todas com esta coluna nula) continuam convivendo sem conflito nenhum.
create unique index if not exists pagamentos_asaas_installment_id_key
  on public.pagamentos (asaas_installment_id);

comment on column public.pagamentos.asaas_installment_id is
  'Id do GRUPO de parcelas no Asaas (payment.installment). Chave de idempotência da venda parcelada: as parcelas seguintes não criam linha nova.';
comment on column public.pagamentos.valor_centavos is
  'O total da COMPRA, não o da parcela. Numa venda em 3x de R$ 151,23 este campo vale 45369.';
