-- Repara de novo as chaves de matéria do briefing.
--
-- A 053 já tinha consertado o único registro corrompido. Depois dela, um
-- briefing NOVO entrou com o mesmo defeito — prova de que a causa continuava
-- viva no produtor, e não era resíduo antigo:
--
--   "FÃ­sica": "Turbulência"   ← chave corrompida, resposta intacta
--
-- Esse registro é a demonstração do prejuízo: o aluno marcou TURBULÊNCIA em
-- Física, a matéria que ele mais precisa, e o Copiloto lia "Atenção" porque
-- "FÃ­sica" não casa com "Física".
--
-- A causa foi corrigida no código desta vez (lib/site/sentimentos.ts): a
-- matéria deixou de viajar no NOME do campo do FormData. Esta migração
-- conserta o que já estava gravado.
--
-- O reparo RECUPERA, não inventa: só a chave é redecodificada — os bytes
-- latin-1 do nome relidos como UTF-8 devolvem exatamente o acento original —
-- e a resposta do aluno é copiada como está. Nenhum sentimento é adivinhado,
-- e matéria alguma ganha valor que o aluno não tenha dado.

update public.aluno_briefing b
   set sentimentos = (
     select jsonb_object_agg(
              case when k ~ '[ÃÂ]' then convert_from(convert_to(k, 'LATIN1'), 'UTF8') else k end,
              b.sentimentos -> k
            )
       from jsonb_object_keys(b.sentimentos) k
   )
 where b.sentimentos is not null
   and b.sentimentos::text ~ '[ÃÂ]';
