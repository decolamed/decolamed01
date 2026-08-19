-- Aplicada no projeto remoto em 19/08/2026 (parcelamento_no_cartao_por_plano).
--
-- PARCELAMENTO NO CARTÃO, CONFIGURADO POR PLANO
--
-- Cada plano decide se aceita parcelar no cartão, em até quantas vezes, e se
-- o parcelamento tem juros. Pix e boleto não são afetados: eles não têm
-- parcela, e o valor deles continua sendo o preço do plano.
--
-- As quatro colunas nascem com o comportamento de HOJE, para nenhum plano
-- existente mudar sozinho: parcelamento desligado.

alter table public.planos
  add column if not exists parcelamento_ativo   boolean not null default false,
  add column if not exists parcelas_maximas     integer not null default 1,
  add column if not exists juros_ativo          boolean not null default false,
  add column if not exists juros_percentual     numeric(6,3) not null default 0;

comment on column public.planos.parcelamento_ativo is
  'Se o cartão pode ser parcelado neste plano. Não afeta Pix nem boleto.';
comment on column public.planos.parcelas_maximas is
  'Teto de parcelas no cartão. 1 = à vista.';
comment on column public.planos.juros_ativo is
  'Se o parcelamento tem juros. Desligado, juros_percentual é ignorado.';
comment on column public.planos.juros_percentual is
  'Juros ao mês, em porcentagem (ex.: 2.5 = 2,5% a.m.). Só vale com juros_ativo.';

-- As regras que impedem configuração impossível. O formulário do painel também
-- valida, mas validação de formulário protege contra engano — não contra um
-- update feito por outro caminho. Verificadas contra o banco: as cinco
-- rejeitam.

alter table public.planos drop constraint if exists planos_parcelas_maximas_validas;
alter table public.planos add constraint planos_parcelas_maximas_validas
  check (parcelas_maximas >= 1 and parcelas_maximas <= 24);

alter table public.planos drop constraint if exists planos_juros_percentual_valido;
alter table public.planos add constraint planos_juros_percentual_valido
  check (juros_percentual >= 0 and juros_percentual <= 100);

alter table public.planos drop constraint if exists planos_juros_exige_percentual;
alter table public.planos add constraint planos_juros_exige_percentual
  check (not juros_ativo or juros_percentual > 0);

alter table public.planos drop constraint if exists planos_parcelamento_coerente;
alter table public.planos add constraint planos_parcelamento_coerente
  check (parcelamento_ativo or parcelas_maximas = 1);
