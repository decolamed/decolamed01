-- Última linha de defesa do limite: nenhuma missão no dia da prova nem
-- DEPOIS dele. O bloqueio do dia da prova já existia; missões posteriores
-- eram limpas só na recalibragem do briefing, então uma execução do Copiloto
-- entre duas recalibragens podia agendar estudo para depois do vestibular.
--
-- (Substituída em seguida pela 046, que acrescenta a checagem das aulas.)
create or replace function public.missao_exige_conteudo()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  mat text := public.materia_canonica(new.materia);
  n_questoes   integer := 0;
  n_flashcards integer := 0;
  dia_prova date;
begin
  select (data_prova)::date into dia_prova
    from public.aluno_briefing
   where aluno_id = new.aluno_id;

  if dia_prova is not null and new.data >= dia_prova then
    return null;
  end if;

  if mat is null or new.tipo not in ('questoes', 'flashcards', 'revisao') then
    return new;
  end if;

  select count(*) into n_questoes
    from public.questoes
   where ativo and public.materia_canonica(materia) = mat;

  select count(*) into n_flashcards
    from public.flashcards
   where ativo and public.materia_canonica(materia) = mat;

  if new.tipo = 'questoes'   and n_questoes   = 0 then return null; end if;
  if new.tipo = 'flashcards' and n_flashcards = 0 then return null; end if;
  if new.tipo = 'revisao' and n_questoes = 0 and n_flashcards = 0 then return null; end if;

  return new;
end;
$function$;
