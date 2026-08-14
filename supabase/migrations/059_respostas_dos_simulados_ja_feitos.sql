-- ============================================================================
-- 059 — Questões de simulado passam a contar como feitas, inclusive no passado
--
-- `submeterSimulado` gravava a tentativa (`simulado_tentativas`) mas nunca
-- gravava `respostas_aluno`. Como é essa tabela que responde "o aluno já fez
-- esta questão?", tudo que ele respondia num simulado continuava inédito para
-- o resto da plataforma:
--
--   • a questão voltava no Banco de Questões e na atividade de 5 questões
--     como se ele nunca a tivesse visto (lib/site/continuidade.ts lê
--     `respostas_aluno.questao_id`);
--   • o desempenho POR ASSUNTO não a enxergava — o agregado da tentativa só
--     guarda matéria, então o Raio-X não sabia QUAL conteúdo foi errado;
--   • o Copiloto só conseguia mirar a matéria inteira, nunca o assunto.
--
-- O código já foi corrigido. Aqui ficam as tentativas ANTERIORES à correção:
-- sem este preenchimento, quem já fez simulado continuaria recebendo aquelas
-- questões como novas.
--
-- A conversão é fiel ao que está gravado: `simulado_tentativas.respostas` é
-- um mapa {questao_id: alternativa}, e o acerto é recalculado comparando com
-- `questoes.resposta_correta` — a mesma comparação que o servidor faz na
-- correção. Nada é inferido ou arredondado.
--
-- `created_at` recebe o instante em que a tentativa foi finalizada, não
-- `now()`: a resposta aconteceu naquele dia, e a evolução semanal do aluno
-- ficaria errada se todas fossem datadas de hoje.
--
-- Idempotente: roda de novo sem duplicar, porque a guarda procura uma linha
-- com o mesmo aluno, a mesma questão e o mesmo instante.
-- ============================================================================

insert into public.respostas_aluno (aluno_id, questao_id, alternativa_escolhida, correta, created_at)
select
  t.aluno_id,
  q.id,
  r.value #>> '{}'                         as alternativa_escolhida,
  (r.value #>> '{}') = q.resposta_correta  as correta,
  coalesce(t.finalizado_em, t.created_at)  as created_at
from public.simulado_tentativas t
cross join lateral jsonb_each(
  case when jsonb_typeof(t.respostas::jsonb) = 'object' then t.respostas::jsonb else '{}'::jsonb end
) as r(key, value)
join public.questoes q on q.id = r.key::uuid
where t.finalizado_em is not null
  -- Questão deixada em branco não é resposta.
  and coalesce(btrim(r.value #>> '{}'), '') <> ''
  and not exists (
    select 1
    from public.respostas_aluno ra
    where ra.aluno_id = t.aluno_id
      and ra.questao_id = q.id
      and ra.created_at = coalesce(t.finalizado_em, t.created_at)
  );
