-- ============================================================================
-- A ROTA DO ALUNO É TROCADA DE UMA VEZ, OU NÃO É TROCADA
--
-- Uma aluna do Voo Guiado ficou com o cronograma vazio na ficha dela: o app
-- dela funcionava (a rota é remontada em memória a cada carregamento), mas a
-- cópia gravada — a que o mentor lê e edita em /admin/usuarios/<id> — não
-- existia.
--
-- A gravação era feita em dois passos separados:
--
--     1. apaga a rota do aluno
--     2. grava a rota nova
--
-- Sem transação entre eles. Qualquer falha no passo 2 deixava o aluno com
-- ZERO — pior do que estava antes de tentar. E o caminho do mentor piorava a
-- conta: `regerarRotaDoAluno` apagava a rota ANTES de chamar a gravação, que
-- só então validava a rota nova e podia recusá-la. Recusar já não tinha volta:
-- não havia mais rota anterior para preservar.
--
-- Esta função faz os dois passos numa transação só. Se a inserção falhar por
-- qualquer motivo, o `delete` volta atrás junto e o aluno continua com o
-- cronograma que tinha — que era a promessa escrita no código e que o código
-- não cumpria.
--
-- SECURITY INVOKER de propósito: a função roda com a permissão de quem chama,
-- então as policies de `aluno_rota_dias` continuam valendo. O aluno segue
-- podendo gravar só a rota dele; nada aqui abre caminho para escrever na de
-- outro.
-- ============================================================================

create or replace function public.sincronizar_rota_do_aluno(p_aluno_id uuid, p_linhas jsonb)
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  gravadas integer;
begin
  delete from public.aluno_rota_dias where aluno_id = p_aluno_id;

  insert into public.aluno_rota_dias
    (aluno_id, route_day, scheduled_date, template_days, tipo, titulo, itens, minutos, assinatura)
  select
    p_aluno_id,
    (l->>'route_day')::integer,
    (l->>'scheduled_date')::date,
    -- `template_days` é integer[] na tabela e chega como array JSON.
    coalesce(
      (select array_agg(v::integer order by ordinalidade)
         from jsonb_array_elements_text(coalesce(l->'template_days', '[]'::jsonb))
              with ordinality as t(v, ordinalidade)),
      '{}'::integer[]
    ),
    l->>'tipo',
    l->>'titulo',
    coalesce(l->'itens', '[]'::jsonb),
    coalesce((l->>'minutos')::integer, 0),
    l->>'assinatura'
  from jsonb_array_elements(p_linhas) as l;

  get diagnostics gravadas = row_count;
  return gravadas;
end;
$$;

comment on function public.sincronizar_rota_do_aluno(uuid, jsonb) is
  'Troca a rota do aluno numa transacao so: ou a nova entra inteira, ou a antiga permanece. Nunca deixa o aluno com zero dias.';

grant execute on function public.sincronizar_rota_do_aluno(uuid, jsonb) to authenticated, service_role;
