-- Um vídeo de IA por (matéria, assunto).
--
-- `produzirMaterialSobDemanda` só busca vídeo quando `verificarCobertura`
-- responde que o assunto não tem aula. É de novo um "lê e depois escreve" sem
-- trava, e o Copiloto roda de vários pontos ao mesmo tempo (responder questão,
-- enviar simulado, abrir a tela) — a mesma corrida que triplicou as
-- recomendações na migração 050.
--
-- Medido neste banco, com os carimbos de tempo a milissegundos de distância:
--
--   Física · Termodinâmica · Gases Ideais...   2 linhas  23:35:05.720 / .724
--   Linguagens · Interpretação e Funções...    2 linhas  21:10:56.738 / .752
--   Linguagens · Morfossintaxe · Sintaxe...    3 linhas  21:11:07.022 / .594 / .937
--
-- O último caso guardou DUAS URLs diferentes para o mesmo assunto: cada
-- execução perguntou ao YouTube por conta própria. Uma chave única só pela URL
-- não pegaria esse caso — a regra que o código sempre quis é uma aula por
-- assunto, e é essa que o índice passa a garantir.
--
-- As duplicatas saem por `ativo = false`, não por delete: nenhuma está
-- referenciada hoje, mas desativar tira da biblioteca do aluno sem apagar
-- histórico, e é o mesmo estado que `verificarCobertura` já lê.

update public.conteudos_biblioteca c
   set ativo = false
 where c.ativo
   and c.gerado_por_ia
   and c.tipo in ('aula', 'video_externo')
   and exists (
     select 1 from public.conteudos_biblioteca outra
      where outra.ativo
        and outra.gerado_por_ia
        and outra.tipo in ('aula', 'video_externo')
        and outra.materia = c.materia
        and coalesce(outra.assunto, '') = coalesce(c.assunto, '')
        and (outra.created_at, outra.id) < (c.created_at, c.id)
   );

-- `coalesce(assunto, '')` porque dois NULL nunca colidem num índice único em
-- Postgres. Só vale para o que a IA produziu: o admin continua livre para
-- cadastrar quantas aulas quiser do mesmo assunto.
create unique index if not exists conteudo_ia_unico_por_assunto
  on public.conteudos_biblioteca (materia, coalesce(assunto, ''))
  where gerado_por_ia and ativo and tipo in ('aula', 'video_externo');
