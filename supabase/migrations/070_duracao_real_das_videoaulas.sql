-- ===========================================================================
-- QUAL DURAÇÃO DE AULA DÁ PARA ACREDITAR
--
-- `conteudos_biblioteca.duracao_minutos` já existia, mas não dá para usá-la
-- direto no cálculo do cronograma. Levantamento no banco de produção:
--
--   aula           253 linhas   duração 30 em TODAS (1 valor distinto)
--   video_externo   17 linhas   duração de 20 a 129 (13 valores distintos)
--
-- Ou seja: para 94% das aulas o número gravado é um placeholder de 30 min,
-- não a duração do vídeo. Usá-lo no lugar da média configurada apenas trocaria
-- um número fixo por outro número fixo — o cronograma continuaria colocando
-- uma aula de 5 min e uma de 60 min como se fossem a mesma coisa.
--
-- As 17 que têm duração real são justamente as importadas do YouTube, onde a
-- duração veio da API junto com `metadados_youtube`. Essa é a diferença que
-- importa, e ela precisa ficar explícita: inferir "tem metadados, logo a
-- duração é real" funcionaria hoje e quebraria no dia em que algo mais
-- escrever nessa coluna.
--
-- `duracao_confirmada` marca as linhas cuja duração veio da fonte e pode
-- entrar na conta. As demais continuam usando a média configurada, exatamente
-- como antes — nenhum cronograma existente muda por causa desta migração.
-- ===========================================================================

alter table public.conteudos_biblioteca
  add column if not exists duracao_confirmada boolean not null default false;

comment on column public.conteudos_biblioteca.duracao_confirmada is
  'A duração veio da fonte (YouTube) e pode ser usada no cálculo do cronograma. Falso = usar a média configurada.';

-- As importadas do YouTube já têm duração real: a API devolve a duração junto
-- com os metadados, e foi assim que elas chegaram aqui.
update public.conteudos_biblioteca
   set duracao_confirmada = true
 where metadados_youtube is not null
   and duracao_minutos > 0;
