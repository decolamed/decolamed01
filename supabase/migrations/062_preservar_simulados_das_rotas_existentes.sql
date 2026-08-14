-- ============================================================================
-- 062 — Quem já tem rota não perde o simulado que já recebeu
--
-- A migração 061 criou a escolha do admin e a tabela de vínculo, mas as duas
-- nascem vazias. Sem esta migração, no instante do deploy:
--
--   • nenhum aluno tem vínculo   → a rota consulta a configuração;
--   • a configuração está vazia  → as duas posições ficam sem simulado;
--   • resultado: quem estava com "Simulado 1 · Novo simula teste" no dia 3
--     passaria a ver um dia de simulado sem prova nenhuma.
--
-- Ou seja: exatamente a "troca inesperada de conteúdo" que a mudança existe
-- para evitar. Esta migração fecha essa janela, em duas partes.
--
-- ─── 1. A configuração começa valendo o que a plataforma já usava ────────
--
-- A regra antiga era "o simulado utilizável mais antigo". A posição 1 passa a
-- vir cadastrada com exatamente esse simulado, para que os cronogramas
-- gerados logo depois do deploy continuem entregando o que entregavam.
--
-- A posição 2 fica VAZIA de propósito. A regra antiga não tinha um segundo
-- simulado — ela repetia o primeiro, e é justamente essa duplicação silenciosa
-- que estamos removendo. Preenchê-la aqui seria recriar o defeito no banco.
-- Quem escolhe o segundo é o administrador, em Configurações.
--
-- Só grava se a chave estiver vazia: se o admin já tiver escolhido, a escolha
-- dele manda.
--
-- ─── 2. O que cada aluno já recebeu vira vínculo ─────────────────────────
--
-- Os dias de simulado já gravados em `aluno_rota_dias` são a evidência do que
-- o aluno recebeu. Viram vínculo, na ordem em que aparecem na rota dele.
--
-- Com uma exceção: quando a posição 2 tem o MESMO simulado da posição 1 (o
-- efeito do antigo `?? simulados[0]`) e o aluno ainda não o realizou, ela não
-- é fixada. Fixá-la seria carimbar a duplicação para sempre; deixando-a livre,
-- ela recebe o segundo simulado assim que o admin escolher um.
--
-- Se o aluno JÁ REALIZOU, o vínculo é gravado mesmo sendo repetido: ele fez
-- aquela prova, e o cronograma dele tem de continuar dizendo a verdade.
-- `simulado_tentativas` não é lido para outra coisa e não é alterado.
-- ============================================================================

-- ---------------------------------------------------------------- parte 1
update public.configuracoes c
set valor = to_jsonb(escolhido.id::text)
from (
  select s.id
  from public.simulados s
  where s.ativo
    and (
      exists (select 1 from public.simulado_questoes q where q.simulado_id = s.id)
      or (s.redacao is not null and s.redacao <> 'null'::jsonb)
    )
  order by s.created_at, s.id
  limit 1
) as escolhido
where c.chave = 'voo_guiado.simulado_1_id'
  and coalesce(c.valor #>> '{}', '') = '';

-- ---------------------------------------------------------------- parte 2
with dias_de_simulado as (
  select
    d.aluno_id,
    row_number() over (partition by d.aluno_id order by d.route_day) as ordem,
    (d.itens -> 0 ->> 'ref_id')::uuid as simulado_id
  from public.aluno_rota_dias d
  where d.tipo = 'simulado'
    and d.itens -> 0 ->> 'ref_id' is not null
),
primeiro as (
  select aluno_id, simulado_id from dias_de_simulado where ordem = 1
)
insert into public.aluno_simulados_rota (aluno_id, ordem, simulado_id)
select d.aluno_id, d.ordem::smallint, d.simulado_id
from dias_de_simulado d
left join primeiro p on p.aluno_id = d.aluno_id
where d.ordem in (1, 2)
  and (
    d.ordem = 1
    -- posição 2 com simulado diferente da 1: vínculo legítimo, fixa.
    or p.simulado_id is distinct from d.simulado_id
    -- posição 2 repetida, mas já realizada: histórico, fixa mesmo assim.
    or exists (
      select 1 from public.simulado_tentativas t
      where t.aluno_id = d.aluno_id and t.simulado_id = d.simulado_id
    )
  )
on conflict (aluno_id, ordem) do nothing;
