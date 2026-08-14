-- ============================================================================
-- 058 — Questões que dependiam do texto de OUTRA questão
--
-- Na prova impressa, a questão 15 podia dizer "(Referente ao texto da Questão
-- 14)": as duas estavam na mesma página. Na plataforma cada questão aparece
-- isolada — no Banco de Questões, numa atividade de 5 questões, num simulado.
-- Sem o texto-base, o aluno erra por defeito de cadastro, não por não saber.
--
-- A varredura do acervo (396 questões ativas) encontrou 7 nessa situação.
-- Para TODAS elas a questão-fonte existe no banco, na mesma prova, com o
-- texto-base íntegro. Este script incorpora esse texto — o material original,
-- já cadastrado. Nada é inventado, escrito ou completado por fora.
--
-- Como o texto-base é extraído: toda questão-fonte tem a forma
--
--     <texto de apoio>\n\n<comando da questão>
--
-- e o texto-base é tudo o que vem antes do ÚLTIMO parágrafo em branco. A
-- extração é feita pelo próprio SQL a partir da linha real, sem transcrição
-- manual — transcrever à mão sete textos longos seria a forma mais provável
-- de introduzir um erro.
--
-- Os marcadores "(Vide texto da questão 11.)", "(Não possui texto-base.)" e
-- "(Referente ao texto da Questão 14)" saem do enunciado: depois da
-- incorporação eles passariam a ser falsos.
--
-- As questões-fonte não são alteradas.
-- ============================================================================

-- Registro de auditoria: o admin precisa poder ver o que foi mexido e por quê.
create table if not exists public.questoes_contexto_incorporado (
  id uuid primary key default gen_random_uuid(),
  questao_id uuid not null references public.questoes(id) on delete cascade,
  questao_fonte_id uuid references public.questoes(id) on delete set null,
  enunciado_antes text not null,
  motivo text not null,
  created_at timestamptz not null default now()
);

comment on table public.questoes_contexto_incorporado is
  'Auditoria da migração 058: questões que citavam o texto de outra questão e receberam esse texto incorporado. Guarda o enunciado anterior para conferência.';

alter table public.questoes_contexto_incorporado enable row level security;

drop policy if exists "questoes_contexto_admin" on public.questoes_contexto_incorporado;
create policy "questoes_contexto_admin" on public.questoes_contexto_incorporado
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- A incorporação, num único comando: grava a auditoria e reescreve o
-- enunciado a partir da MESMA fonte de dados.
-- ----------------------------------------------------------------------------
with alvos(dep_id, numero_fonte) as (
  values
    -- dependente                                  , questão-fonte na mesma prova
    ('86a66519-b86b-455d-9661-deeba09c7106'::uuid, 14::smallint),  -- Inglês 2024.1 ampla Q15
    ('19a44242-81a2-4ff8-93e8-dcd267e623c9'::uuid, 14::smallint),  -- Inglês 2024.1 peba  Q15
    ('81d80816-d0ee-4488-8c66-5d20ccb7d08c'::uuid, 13::smallint),  -- Inglês 2025.1 peba  Q14
    ('908624a4-9732-4b44-98f1-aa50d3feb402'::uuid, 11::smallint),  -- Inglês 2026.2 ampla Q12
    ('7bacd2e6-290a-4a06-a43a-feca33f7d0ce'::uuid, 11::smallint),  -- Espanhol 2025.1 peba Q12
    ('460e0df5-28d1-44b5-86c1-a5929f9957e0'::uuid, 11::smallint),  -- Espanhol 2025.1 peba Q13
    ('cf323b9f-a335-4212-927d-b19ee4db46ff'::uuid, 31::smallint)   -- Biologia 2025.1 peba Q32
),
calculado as (
  select
    d.id as dependente_id,
    f.id as fonte_id,
    d.enunciado as enunciado_antes,
    -- Texto-base da fonte: tudo antes do ÚLTIMO parágrafo em branco, que é
    -- onde começa o comando próprio daquela questão.
    left(
      f.enunciado,
      length(f.enunciado) - strpos(reverse(f.enunciado), reverse(E'\n\n')) - 1
    ) as texto_base,
    -- Comando da questão dependente, sem o marcador de referência.
    btrim(
      regexp_replace(
        d.enunciado,
        '\(\s*(vide\s+texto\s+d[ae]\s+quest[^)]*|n[ãa]o\s+possui\s+texto[- ]base\.?|referente\s+ao\s+texto\s+d[ae]\s+quest[^)]*|texto\s+d[ae]\s+quest[^)]*|o\s+texto\s+base\s+[ée]\s+o\s+mesmo\s+d[ae]\s+quest[^)]*)\s*\)\.?',
        '',
        'gi'
      )
    ) as comando
  from alvos a
  join public.questoes d on d.id = a.dep_id
  join public.questoes f
    on f.prova_nome    is not distinct from d.prova_nome
   and f.ano           is not distinct from d.ano
   and f.semestre      is not distinct from d.semestre
   and f.modalidade    is not distinct from d.modalidade
   and f.materia       = d.materia
   and f.numero_questao = a.numero_fonte
   and f.id <> d.id
),
-- Fonte sem texto-base separável não é usada: melhor não mexer do que
-- montar um enunciado truncado.
validos as (
  select * from calculado where length(btrim(texto_base)) > 40 and length(btrim(comando)) > 10
),
auditoria as (
  insert into public.questoes_contexto_incorporado
    (questao_id, questao_fonte_id, enunciado_antes, motivo)
  select
    dependente_id, fonte_id, enunciado_antes,
    'Enunciado citava o texto de outra questão da mesma prova; o texto-base foi incorporado a partir da questão-fonte.'
  from validos
  returning questao_id
)
update public.questoes q
set enunciado = v.texto_base || E'\n\n' || v.comando,
    updated_at = now()
from validos v
where q.id = v.dependente_id;

-- Quando o comando da questão dependente já começava com linha em branco, a
-- junção produzia três quebras seguidas. Cosmético, mas o aluno vê.
update public.questoes
set enunciado = regexp_replace(enunciado, E'\n{3,}', E'\n\n', 'g'), updated_at = now()
where id in (select questao_id from public.questoes_contexto_incorporado)
  and enunciado ~ E'\n{3,}';

-- ----------------------------------------------------------------------------
-- Rede de segurança
--
-- Se alguma das sete não pôde ser recuperada (fonte ausente ou sem texto-base
-- separável), ela NÃO fica disponível para o aluno. Preferir o acervo menor a
-- servir uma questão impossível de responder — e a linha continua no banco,
-- inteira, para o administrador auditar.
-- ----------------------------------------------------------------------------
update public.questoes
set ativo = false, updated_at = now()
where id in (
  '86a66519-b86b-455d-9661-deeba09c7106',
  '19a44242-81a2-4ff8-93e8-dcd267e623c9',
  '81d80816-d0ee-4488-8c66-5d20ccb7d08c',
  '908624a4-9732-4b44-98f1-aa50d3feb402',
  '7bacd2e6-290a-4a06-a43a-feca33f7d0ce',
  '460e0df5-28d1-44b5-86c1-a5929f9957e0',
  'cf323b9f-a335-4212-927d-b19ee4db46ff'
)
and id not in (select questao_id from public.questoes_contexto_incorporado);
