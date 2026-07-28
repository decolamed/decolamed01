-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 033: constraints básicas em planos
--
-- planos não tinha nenhum check constraint — um preço negativo digitado
-- errado no admin (ex.: "-99") ia direto pro banco e apareceria assim na
-- página pública de inscrição, além de poder confundir o Asaas no checkout.
-- ============================================================================

alter table planos add constraint planos_preco_nao_negativo check (preco_centavos >= 0);
alter table planos add constraint planos_duracao_positiva check (duracao_meses is null or duracao_meses > 0);
alter table planos add constraint planos_creditos_nao_negativo check (creditos_redacao >= 0);
alter table planos add constraint planos_ordem_nao_negativa check (ordem >= 0);
