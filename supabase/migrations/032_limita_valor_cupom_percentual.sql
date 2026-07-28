-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 032: limita valor de cupom percentual a 100
--
-- cupons.valor só tinha "> 0" — um cupom tipo=percentual com valor=500
-- passava direto pro banco. O checkout já trava o preço final em 0 no
-- mínimo (nunca fica negativo), mas um cupom assim ainda liberaria o
-- plano de graça sem ninguém perceber o erro de digitação. tipo=fixo não
-- tem esse teto (é em reais, pode ser qualquer valor positivo).
-- ============================================================================

alter table cupons add constraint cupons_valor_percentual_check
  check (tipo <> 'percentual' or valor <= 100);
