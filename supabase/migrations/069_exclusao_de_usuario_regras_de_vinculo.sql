-- ===========================================================================
-- O QUE ACONTECE COM CADA DADO QUANDO UM USUÁRIO É EXCLUÍDO
--
-- O painel passa a permitir exclusão permanente. Antes de existir esse botão,
-- as chaves estrangeiras precisam dizer o que fazer com cada registro ligado
-- à pessoa — senão a exclusão ou é recusada pelo banco, ou leva junto coisa
-- que não podia sumir.
--
-- O levantamento completo (48 chaves apontando para `profiles` ou
-- `auth.users`) mostrou três grupos:
--
-- 1. CASCADE — já estava certo, nada a fazer aqui.
--    O que é do aluno e só faz sentido com ele: respostas, revisões de
--    flashcard, tentativas de simulado e de atividade, progresso, missões,
--    rota e ajustes da rota, sessões de questões, briefing, check-ins,
--    eventos, recomendações e produções do Copiloto, notificações,
--    permissões, créditos de redação. Sai tudo junto, como deve.
--
-- 2. SET NULL — já estava certo, nada a fazer aqui.
--    `matriculas.aluno_id` e o `historico_admin`. A matrícula sobrevive sem o
--    aluno, e é ela que segura o pagamento: apagar a matrícula apagaria a
--    venda do faturamento. O histórico administrativo é auditoria — some o
--    vínculo, fica o registro.
--
-- 3. NO ACTION — o problema, e o objeto desta migração.
--    Quatorze colunas de autoria (`criado_por`, `registrado_por`,
--    `ocultado_por`) e duas de parceria. Com NO ACTION, o Postgres RECUSA a
--    exclusão: bastava o administrador ter cadastrado uma questão, um banner
--    ou um simulado alguma vez para ficar impossível excluí-lo, com erro de
--    violação de chave estrangeira.
--
--    A regra certa é SET NULL, não CASCADE: a questão, o simulado e o banner
--    pertencem à plataforma, não a quem os digitou. Apagar o conteúdo do
--    acervo porque o autor saiu da equipe destruiria o produto. Some a
--    autoria, fica o conteúdo.
--
-- Todas as colunas envolvidas já aceitam nulo, com uma exceção tratada no
-- fim do arquivo.
-- ===========================================================================

-- ---------------------------------------------------------------- autoria --
alter table public.atividades
  drop constraint atividades_criado_por_fkey,
  add  constraint atividades_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

alter table public.banners
  drop constraint banners_criado_por_fkey,
  add  constraint banners_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

alter table public.conteudos_biblioteca
  drop constraint conteudos_biblioteca_criado_por_fkey,
  add  constraint conteudos_biblioteca_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

alter table public.estudos_botoes
  drop constraint estudos_botoes_criado_por_fkey,
  add  constraint estudos_botoes_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

alter table public.flashcards
  drop constraint flashcards_criado_por_fkey,
  add  constraint flashcards_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

alter table public.links_externos
  drop constraint links_externos_criado_por_fkey,
  add  constraint links_externos_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

alter table public.questoes
  drop constraint questoes_criado_por_fkey,
  add  constraint questoes_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

alter table public.simulados
  drop constraint simulados_criado_por_fkey,
  add  constraint simulados_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

alter table public.profiles
  drop constraint profiles_criado_por_fkey,
  add  constraint profiles_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

-- ------------------------------------------------- autoria em financeiro --
-- A linha em si é registro financeiro e não pode sumir; só a autoria sai.
alter table public.matriculas
  drop constraint matriculas_criado_por_fkey,
  add  constraint matriculas_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

alter table public.pagamentos
  drop constraint pagamentos_criado_por_fkey,
  add  constraint pagamentos_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

-- ---------------------------------------------------- autoria em redação --
alter table public.redacoes_creditos_ajustes
  drop constraint redacoes_creditos_ajustes_criado_por_fkey,
  add  constraint redacoes_creditos_ajustes_criado_por_fkey
       foreign key (criado_por) references public.profiles(id) on delete set null;

alter table public.redacoes_creditos_consumidos
  drop constraint redacoes_creditos_consumidos_registrado_por_fkey,
  add  constraint redacoes_creditos_consumidos_registrado_por_fkey
       foreign key (registrado_por) references public.profiles(id) on delete set null;

alter table public.redacoes_professor_ocultos
  drop constraint redacoes_professor_ocultos_ocultado_por_fkey,
  add  constraint redacoes_professor_ocultos_ocultado_por_fkey
       foreign key (ocultado_por) references public.profiles(id) on delete set null;

-- --------------------------------------------------------------- parceria --
-- O cupom continua valendo para quem já o usou, e a venda continua no
-- faturamento; o que se perde é a atribuição ao parceiro.
alter table public.cupons
  drop constraint cupons_parceiro_id_fkey,
  add  constraint cupons_parceiro_id_fkey
       foreign key (parceiro_id) references public.profiles(id) on delete set null;

alter table public.pagamentos
  drop constraint pagamentos_parceiro_id_fkey,
  add  constraint pagamentos_parceiro_id_fkey
       foreign key (parceiro_id) references public.profiles(id) on delete set null;

-- ------------------------------------------------ comissões de parceiro --
-- Esta era CASCADE: excluir um parceiro apagava o histórico de comissões
-- dele. Comissão é dinheiro devido ou já pago — apagar o registro faz o
-- valor sumir da contabilidade sem deixar rastro. A coluna era NOT NULL, o
-- que impedia SET NULL, então ela passa a aceitar nulo.
--
-- A tela de comissões (/admin/vendas) já renderiza `parceiro?.nome ?? "—"`,
-- então uma comissão sem parceiro aparece sem quebrar nada, e o vínculo com
-- o pagamento — que carrega nome e e-mail do comprador — continua de pé.
alter table public.comissoes_parceiro
  alter column parceiro_id drop not null;

alter table public.comissoes_parceiro
  drop constraint comissoes_parceiro_parceiro_id_fkey,
  add  constraint comissoes_parceiro_parceiro_id_fkey
       foreign key (parceiro_id) references public.profiles(id) on delete set null;
