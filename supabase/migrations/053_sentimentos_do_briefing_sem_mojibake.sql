-- Chaves de matéria corrompidas na autoavaliação do briefing.
--
-- `aluno_briefing.sentimentos` é um objeto {matéria: sentimento}, e o Copiloto
-- lê o sentimento por `sentimentos[matéria]` (motor.ts, via chaveMateria).
-- Uma linha tinha as chaves gravadas em UTF-8 lido como Latin-1:
--
--   "FÃ­sica"  "QuÃ­mica"  "InglÃªs"  "HistÃ³ria"  "MatemÃ¡tica"
--
-- `chaveMateria` tira acento, mas o "­" dessas sequências é um hífen-suave
-- (U+00AD), que não é acento e não sai — então "FÃ­sica" nunca casava com
-- "Física" e a autoavaliação de 5 das 9 matérias era descartada em silêncio:
-- todas viravam "Atenção" no cálculo do GEN.
--
-- É resíduo de antes de as matérias virem do banco (lib/site/materias.ts): a
-- varredura das demais tabelas — questões, flashcards, matérias_peso,
-- conteúdos, trilha, missões — não achou nenhuma outra ocorrência, e nenhum
-- arquivo do código tem literal corrompido. Por isso é correção de dado, e não
-- de código: não existe regra nova para "consertar" texto na leitura.
--
-- A volta é exata: os bytes Latin-1 da chave relida como UTF-8 devolvem o
-- acento original. Só chaves com Ã/Â entram na conversão — nenhum nome de
-- matéria legítimo tem esses caracteres.

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
