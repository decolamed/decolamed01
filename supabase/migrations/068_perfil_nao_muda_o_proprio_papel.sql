-- ===========================================================================
-- CRÍTICO — QUALQUER ALUNO LOGADO CONSEGUIA VIRAR ADMINISTRADOR
--
-- A política `profiles_update_own_or_admin` permite que a pessoa edite a
-- própria linha:
--
--   USING      ((auth.uid() = id) OR is_admin())
--   WITH CHECK ((auth.uid() = id) OR is_admin())
--
-- A regra prende a LINHA ao dono, mas não diz nada sobre as COLUNAS. E a
-- linha do próprio usuário contém `role`. Então isto era suficiente, com a
-- chave anônima que vai no pacote do navegador:
--
--   PATCH /rest/v1/profiles?id=eq.<meu_id>   {"role":"admin"}
--
-- Verificado no banco de produção, em transação desfeita: um aluno comum
-- (is_admin() = false) executou o UPDATE, `is_admin()` passou a devolver
-- true na mesma transação e, em seguida, o mesmo usuário leu os pagamentos
-- de todo mundo, leu todos os perfis e reescreveu o preço dos 4 planos.
--
-- A correção não mexe na política — mexer nela quebraria o admin. Um gatilho
-- congela as colunas de privilégio para quem chega como `authenticated` e
-- não é admin. Tudo que o painel faz continua funcionando porque o painel
-- escreve pelo servidor, com a service role (nenhuma escrita em `profiles`
-- parte do navegador hoje). Nome, e-mail, telefone e CPF seguem editáveis.
-- ===========================================================================

create or replace function public.congelar_privilegios_do_perfil()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  papel text;
begin
  -- Quem está agindo, segundo o próprio token da requisição.
  --
  -- NÃO dá para usar `current_user` aqui: dentro de uma função SECURITY
  -- DEFINER ele devolve o DONO da função (postgres), não quem chamou — a
  -- primeira versão deste gatilho caía nesse engano e liberava tudo. O papel
  -- do JWT é a informação verdadeira: 'authenticated' para uma pessoa
  -- logada, 'anon' para visitante, 'service_role' para o servidor. Ausente
  -- significa SQL direto (migração, job), que também é interno.
  papel := nullif(current_setting('request.jwt.claims', true), '')::json ->> 'role';

  if papel is null or papel = 'service_role' then
    return new;
  end if;

  -- Um admin de verdade pode promover e rebaixar. A consulta é direta e não
  -- usa is_admin() de propósito: esta função é SECURITY DEFINER e enxerga a
  -- tabela sem RLS, então o resultado não depende de política nenhuma.
  if exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Não é permitido alterar o papel do usuário.'
      using errcode = 'insufficient_privilege';
  end if;

  -- `ativo` desliga o acesso de quem foi bloqueado: sem congelar, a pessoa
  -- bloqueada se reativa sozinha.
  if new.ativo is distinct from old.ativo then
    raise exception 'Não é permitido alterar o status do usuário.'
      using errcode = 'insufficient_privilege';
  end if;

  -- Vínculos administrativos: quem criou a conta, se foi criada à mão e a
  -- qual plano ela está associada.
  if new.plano_id is distinct from old.plano_id
     or new.criado_por is distinct from old.criado_por
     or new.criado_manualmente is distinct from old.criado_manualmente then
    raise exception 'Não é permitido alterar os vínculos administrativos do perfil.'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_congelar_privilegios_do_perfil on public.profiles;

create trigger trg_congelar_privilegios_do_perfil
  before update on public.profiles
  for each row
  execute function public.congelar_privilegios_do_perfil();
