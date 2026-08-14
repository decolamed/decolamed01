-- ============================================================================
-- 057 — Remove o reforço EXCEDENTE que a lógica antiga acumulou
--
-- A migração 056 tirou as duplicatas exatas (mesma data, mesma matéria, mesmo
-- tipo). Sobrou o outro sintoma do mesmo defeito: oito missões
-- "Questões · Biologia — Copiloto · 40 min", uma por dia, em dias
-- consecutivos. Não são duplicatas — cada uma tem a sua data — mas são o
-- mesmo reforço repetido, criado quando:
--
--   • o ciclo do modo cirúrgico só continha "questoes", então nenhum outro
--     formato podia sair; e
--   • não havia teto por matéria, então a matéria de GEN mais alto levava
--     quase todas as vagas da janela até a prova.
--
-- As duas causas estão corrigidas em lib/copiloto/reforco.ts (o formato sai
-- do erro) e no motor (MAX_REFORCOS_PENDENTES_POR_MATERIA). Aqui fica só a
-- limpeza do que já foi gravado.
--
-- Preserva as PRIMEIRAS de cada matéria — as mais próximas de hoje, que o
-- aluno já viu no cronograma — e remove o excedente. Nada de missão do admin,
-- do briefing inicial ou já concluída é tocado; o histórico fica intacto.
-- ============================================================================

with ordenadas as (
  select
    id,
    row_number() over (
      partition by aluno_id, coalesce(materia, '')
      order by data, created_at
    ) as posicao
  from public.aluno_missoes
  where origem = 'copiloto'
    and concluida = false
)
delete from public.aluno_missoes
where id in (select id from ordenadas where posicao > 3);
