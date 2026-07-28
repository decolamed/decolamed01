-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 034: remove cronograma_dias (semanal, substituído)
--
-- cronograma_dias era um cronograma fixo de 7 dias (dia_semana 0-6, repete
-- toda semana) usado como fallback quando o aluno não tinha Copiloto nem
-- trilha. trilha_dias (sequência linear, dia_numero relativo ao início do
-- aluno na plataforma) o substituiu por completo: mais flexível, editável
-- pelo admin sem limite de 7 dias, e já é a fonte usada em
-- /aluno/cronograma. Manter as duas ao mesmo tempo criava duas telas de
-- admin ("Cronograma & Missões" e "Trilha 40 Dias") gerenciando conceitos
-- que deveriam ser um só.
--
-- Sem FK apontando para cronograma_dias (verificado antes de aplicar) — sem
-- risco de quebrar outra tabela ao remover.
-- ============================================================================

drop table if exists public.cronograma_dias;
