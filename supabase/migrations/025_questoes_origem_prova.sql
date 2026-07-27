-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 025: origem da questão (prova, ano, número, imagens)
--
-- Contexto: a importação das provas anteriores da FACAPE exige rastrear de
-- qual prova cada questão veio. A tabela `questoes` (migração 008) só tinha
-- `materia`, `assunto` e um `fonte` em texto livre — suficiente pra exibir um
-- selo "FACAPE 2024" ao aluno, mas não pra filtrar por ano, montar simulado de
-- uma prova inteira ou detectar reimportação duplicada.
--
-- Esta migração NÃO altera o comportamento existente: `fonte` continua sendo
-- preenchido e é o que a interface do aluno já lê. As colunas novas são
-- aditivas e opcionais (todas nullable), então questões cadastradas à mão pelo
-- admin seguem funcionando sem nenhum ajuste.
--
-- `fonte` é adicionado aqui com `if not exists` porque já existe no banco
-- remoto, criado fora do fluxo de migrations — mesmo débito de rastreabilidade
-- documentado na migração 019.
-- ============================================================================

alter table questoes add column if not exists fonte text;

-- Identificação estruturada da prova de origem -------------------------------
-- prova_codigo: chave estável e legível, ex.: '2026.1-ampla', '2025.2-peba'.
-- É ela (e não o texto livre de `fonte`) que garante a idempotência do import.
alter table questoes add column if not exists prova_codigo text;
alter table questoes add column if not exists prova_nome text;
alter table questoes add column if not exists ano integer;
alter table questoes add column if not exists semestre smallint check (semestre in (1, 2));
alter table questoes add column if not exists modalidade text
  check (modalidade in ('ampla', 'peba'));
-- Numero interno da questao na prova. NAO e exibido ao aluno nem compoe a
-- identificacao da questao: serve so para (a) amarrar questao e gabarito
-- durante a importacao e (b) sustentar o indice unico abaixo, que impede
-- duplicacao se a importacao rodar de novo. A identificacao visivel e a
-- prova de origem (`fonte` / `prova_nome`).
alter table questoes add column if not exists numero_questao smallint;

-- As questões 11 a 15 existem em duas versões na mesma prova (Língua
-- Estrangeira: Inglês OU Espanhol), com gabaritos diferentes. Sem esta coluna
-- as duas versões colidiriam no mesmo (prova, número).
alter table questoes add column if not exists idioma text
  check (idioma in ('ingles', 'espanhol'));

-- Questões anuladas pela banca: preservadas para estudo, mas marcadas para não
-- entrarem em simulados nem contarem estatística de acerto.
alter table questoes add column if not exists anulada boolean not null default false;

-- Elementos visuais da questão (gráficos, tabelas, mapas, charges, figuras).
-- Formato: [{ "url": "...", "legenda": "...", "ordem": 1 }]
alter table questoes add column if not exists imagens jsonb not null default '[]'::jsonb;

-- Impede que reexecutar a importação duplique questões. NULLS NOT DISTINCT faz
-- `idioma IS NULL` contar como um valor só — sem isso, o Postgres trataria cada
-- NULL como único e a restrição não pegaria as questões de 1 a 10 e 16 a 50.
create unique index if not exists uq_questoes_origem
  on questoes (prova_codigo, numero_questao, idioma)
  nulls not distinct
  where prova_codigo is not null;

create index if not exists idx_questoes_prova on questoes (prova_codigo);
create index if not exists idx_questoes_ano on questoes (ano);
create index if not exists idx_questoes_assunto on questoes (assunto);
