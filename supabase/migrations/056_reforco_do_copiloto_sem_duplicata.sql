-- ============================================================================
-- 056 — O reforço do Copiloto deixa de duplicar
--
-- O aluno recebeu, no mesmo dia, duas missões idênticas: mesma data, mesma
-- matéria, mesmo tipo e o MESMO GEN no motivo. As duas linhas foram gravadas
-- por execuções do motor a 1,9 s de distância:
--
--   2026-08-14 03:13:17.614833+00  →  2026-08-15  Biologia  questoes  GEN=949.1
--   2026-08-14 03:13:19.513227+00  →  2026-08-15  Biologia  questoes  GEN=949.1
--
-- `rodarCopiloto` dispara de vários pontos (resposta de questão, abertura do
-- painel), e a guarda que existia — um Set em memória montado no início da
-- execução — é uma leitura anterior à escrita. Duas execuções concorrentes
-- leem "ainda não existe" antes de qualquer uma gravar.
--
-- A tabela só tinha a PK por `id` e um índice comum por (aluno_id, data):
-- nada impedia a segunda linha. Aqui entra a restrição de verdade. O motor
-- passa a gravar missão a missão e a tratar o código 23505 como "a outra
-- execução chegou primeiro", que é o resultado correto.
--
-- O índice é PARCIAL de propósito:
--   • só `origem = 'copiloto'` — missões do admin e do briefing inicial são
--     intencionais e podem repetir (duas leituras do mesmo livro, por
--     exemplo);
--   • só `concluida = false` — depois de concluída, a mesma matéria pode
--     voltar a ser reforçada no futuro; a unicidade vale para o que está
--     pendente, não para o histórico.
--
-- `coalesce(materia, '')` porque em SQL dois NULLs não colidem: sem isso,
-- missões de reforço sem matéria escapariam da restrição.
-- ============================================================================

-- Limpeza das duplicatas já gravadas, preservando a mais antiga de cada
-- grupo (a que o aluno provavelmente já viu no cronograma).
delete from public.aluno_missoes a
using public.aluno_missoes b
where a.origem = 'copiloto'
  and b.origem = 'copiloto'
  and a.concluida = false
  and b.concluida = false
  and a.aluno_id = b.aluno_id
  and a.data = b.data
  and coalesce(a.materia, '') = coalesce(b.materia, '')
  and a.tipo = b.tipo
  and a.created_at > b.created_at;

create unique index if not exists aluno_missoes_reforco_unico
  on public.aluno_missoes (aluno_id, data, coalesce(materia, ''), tipo)
  where origem = 'copiloto' and concluida = false;

comment on index public.aluno_missoes_reforco_unico is
  'Impede que duas execuções concorrentes do motor criem o mesmo reforço. O motor trata 23505 como "a outra execução chegou primeiro".';
