-- Uma recomendação PENDENTE por (aluno, matéria, assunto).
--
-- O motor já evitava duplicar: antes de inserir, procura uma recomendação
-- anterior para o mesmo par e desiste se ela estiver pendente. Mas isso é um
-- "lê e depois escreve" sem trava, e `rodarCopiloto` é disparado de vários
-- pontos ao mesmo tempo (responder questão, enviar simulado, abrir a tela).
--
-- Medido neste banco: três linhas "Urgente: Biologia", todas pendentes,
-- criadas no MESMO segundo (22:29:37) — três execuções simultâneas, cada uma
-- lendo "não há pendente" antes de qualquer uma gravar. Eram os três cartões
-- de prioridade repetidos que apareciam ao aluno depois de cada erro.
--
-- `coalesce(assunto, '')` porque em Postgres dois NULL não colidem num índice
-- único, e a recomendação de matéria inteira tem assunto nulo — justamente o
-- caso que duplicou.
delete from public.copiloto_recomendacoes r
 where r.status = 'pendente'
   and exists (
     select 1 from public.copiloto_recomendacoes outra
      where outra.status = 'pendente'
        and outra.aluno_id = r.aluno_id
        and outra.materia = r.materia
        and coalesce(outra.assunto, '') = coalesce(r.assunto, '')
        and (outra.gerado_em, outra.id) > (r.gerado_em, r.id)
   );

create unique index if not exists copiloto_recomendacao_pendente_unica
  on public.copiloto_recomendacoes (aluno_id, materia, coalesce(assunto, ''))
  where status = 'pendente';
