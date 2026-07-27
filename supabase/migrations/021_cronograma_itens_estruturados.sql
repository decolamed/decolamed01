-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 021: itens estruturados no cronograma fixo
--
-- cronograma_dias.atividades era só um array de texto livre — o admin
-- digitava "Aula · Citologia · 35 min" à mão, sem nenhum vínculo real com
-- aulas/questões/simulados/flashcards/links cadastrados, e o aluno via só
-- texto inerte (nada abria de verdade). Esta coluna nova guarda referências
-- reais a conteúdo (tipo + id + matéria), permitindo que o app do aluno
-- abra o conteúdo de verdade ao tocar em cada item do dia. `atividades`
-- continua existindo (as páginas antigas que só leem texto continuam
-- funcionando) mas /admin/cronograma agora escreve nas duas colunas.
-- ============================================================================

alter table cronograma_dias add column if not exists itens jsonb not null default '[]'::jsonb;
