-- "Verificar se existem múltiplas rotas ativas para o mesmo aluno". A
-- aplicação apaga a rota anterior antes de gravar a nova, mas isso é uma
-- promessa do código — se uma gravação parcial ou um caminho novo escapar,
-- duas rotas passam a conviver e o aluno vê datas de duas gerações
-- misturadas. Aqui a garantia passa a ser do banco.
--
-- Cada rota tem uma assinatura (início | prova | dias da semana | min/dia).
-- Duas assinaturas para o mesmo aluno = duas rotas. Isso é recusado.
create or replace function public.aluno_rota_uma_assinatura()
 returns trigger
 language plpgsql
 as $function$
begin
  if exists (
    select 1 from public.aluno_rota_dias
     where aluno_id = new.aluno_id
       and assinatura <> new.assinatura
  ) then
    raise exception
      'Rota anterior ainda presente para o aluno %. Apague a rota antiga antes de gravar a nova.', new.aluno_id
      using errcode = 'integrity_constraint_violation';
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_aluno_rota_uma_assinatura on public.aluno_rota_dias;
create trigger trg_aluno_rota_uma_assinatura
  before insert or update on public.aluno_rota_dias
  for each row execute function public.aluno_rota_uma_assinatura();
