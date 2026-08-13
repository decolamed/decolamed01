-- Missão de aula SEM `ref_id` não abre nada: o app procura o conteúdo pelo id
-- e cai em "Esta aula não está mais disponível". O código que criava missões
-- assim já foi corrigido, mas as linhas antigas continuaram no banco — dado
-- órfão sobrevivendo à correção do código.
--
-- 1) Remove as pendentes (só as do Copiloto e não concluídas: histórico do
--    aluno e o que o admin agendou à mão não são tocados).
delete from public.aluno_missoes
 where tipo = 'aula'
   and ref_id is null
   and origem = 'copiloto'
   and concluida = false;

-- 2) Fecha a porta: o gatilho passa a recusar a criação de missão de aula sem
--    vínculo, para a classe inteira não voltar por outro caminho.
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

  -- Nada de missão no dia da prova nem depois dele.
  if dia_prova is not null and new.data >= dia_prova then
    return null;
  end if;

  -- Missão de aula precisa apontar para uma aula que existe.
  if new.tipo = 'aula' then
    if new.ref_id is null then return null; end if;
    if not exists (
      select 1 from public.conteudos_biblioteca c
       where c.id = new.ref_id and c.ativo
    ) then
      return null;
    end if;
    return new;
  end if;

  -- Missão de estudo precisa ter conteúdo da matéria para abrir.
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
