-- ===========================================================================
-- CUPOM QUE VALE SÓ EM ALGUNS PLANOS
--
-- Até aqui todo cupom valia em qualquer plano. O admin passa a poder
-- restringir — "LANÇAMENTO só no VOO GUIADO".
--
-- A coluna nasce NULA, e nulo significa "todos os planos". É o que mantém
-- intacto o comportamento de todos os cupons já cadastrados: nenhum deles
-- precisa ser tocado para continuar funcionando como antes.
--
-- Array de uuid em vez de tabela de ligação: a lista é curta (são poucos
-- planos), sempre lida junto com o cupom, e nunca consultada ao contrário
-- ("quais cupons valem no plano X"). Uma tabela de ligação aqui só somaria
-- um join a cada validação de cupom, que roda no caminho da compra.
--
-- Sem chave estrangeira por elemento — o Postgres não oferece isso para
-- arrays. O nome de um plano apagado aparece como "Plano removido" na
-- listagem do painel (ver lib/cupons/planos-aplicaveis.ts), e um cupom que
-- aponte só para planos inexistentes simplesmente não vale em lugar nenhum,
-- que é o comportamento seguro.
-- ===========================================================================

alter table public.cupons
  add column if not exists planos_aplicaveis uuid[];

comment on column public.cupons.planos_aplicaveis is
  'Planos em que o cupom vale. NULO ou vazio = todos os planos.';
