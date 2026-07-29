-- Índices nas chaves estrangeiras que ainda não tinham cobertura (36 casos
-- apontados pelo linter de performance do Supabase).
--
-- Vale por dois motivos, mesmo com o banco pequeno hoje:
--
--  1. Consultas do dia a dia. matriculas.aluno_id, notificacoes.usuario_id,
--     flashcard_revisoes.flashcard_id, simulado_questoes.questao_id e
--     companhia são filtradas em quase toda tela do aluno. Sem índice, cada
--     leitura é uma varredura completa da tabela — hoje custa pouco porque
--     são centenas de linhas, mas cresce junto com a base de alunos.
--
--  2. Exclusões em cascata. Apagar um `profiles` ou um `plano` obriga o
--     Postgres a procurar as linhas filhas em cada tabela que referencia a
--     linha apagada. Sem índice na coluna da FK isso é uma varredura por
--     tabela — inclusive nas colunas de auditoria `criado_por`, que quase
--     nunca aparecem num WHERE mas participam de toda remoção de usuário.
--
-- Tudo aqui é aditivo: nenhum índice muda resultado de consulta, só o plano
-- de execução. As tabelas são pequenas, então a criação é instantânea.

create index if not exists idx_atividade_questoes_atividade_id on public.atividade_questoes (atividade_id);
create index if not exists idx_atividade_questoes_questao_id on public.atividade_questoes (questao_id);
create index if not exists idx_atividade_tentativas_aluno_id on public.atividade_tentativas (aluno_id);
create index if not exists idx_atividade_tentativas_atividade_id on public.atividade_tentativas (atividade_id);
create index if not exists idx_atividades_criado_por on public.atividades (criado_por);
create index if not exists idx_banners_criado_por on public.banners (criado_por);
create index if not exists idx_conteudos_biblioteca_criado_por on public.conteudos_biblioteca (criado_por);
create index if not exists idx_copiloto_producoes_ia_aluno_id on public.copiloto_producoes_ia (aluno_id);
create index if not exists idx_copiloto_producoes_ia_video_conteudo_id on public.copiloto_producoes_ia (video_conteudo_id);
create index if not exists idx_estudos_botoes_criado_por on public.estudos_botoes (criado_por);
create index if not exists idx_flashcard_revisoes_flashcard_id on public.flashcard_revisoes (flashcard_id);
create index if not exists idx_flashcards_criado_por on public.flashcards (criado_por);
create index if not exists idx_historico_admin_admin_id on public.historico_admin (admin_id);
create index if not exists idx_links_externos_criado_por on public.links_externos (criado_por);
create index if not exists idx_matriculas_aluno_id on public.matriculas (aluno_id);
create index if not exists idx_matriculas_criado_por on public.matriculas (criado_por);
create index if not exists idx_matriculas_plano_id on public.matriculas (plano_id);
create index if not exists idx_matriculas_pre_cadastro_id on public.matriculas (pre_cadastro_id);
create index if not exists idx_notificacoes_usuario_id on public.notificacoes (usuario_id);
create index if not exists idx_pagamentos_criado_por on public.pagamentos (criado_por);
create index if not exists idx_pagamentos_matricula_id on public.pagamentos (matricula_id);
create index if not exists idx_pagamentos_pre_cadastro_id on public.pagamentos (pre_cadastro_id);
create index if not exists idx_pre_cadastros_plano_id on public.pre_cadastros (plano_id);
create index if not exists idx_profiles_criado_por on public.profiles (criado_por);
create index if not exists idx_profiles_plano_id on public.profiles (plano_id);
create index if not exists idx_questoes_criado_por on public.questoes (criado_por);
create index if not exists idx_redacoes_creditos_ajustes_aluno_id on public.redacoes_creditos_ajustes (aluno_id);
create index if not exists idx_redacoes_creditos_ajustes_criado_por on public.redacoes_creditos_ajustes (criado_por);
create index if not exists idx_redacoes_creditos_consumidos_registrado_por on public.redacoes_creditos_consumidos (registrado_por);
create index if not exists idx_redacoes_professor_ocultos_ocultado_por on public.redacoes_professor_ocultos (ocultado_por);
create index if not exists idx_relatos_erro_aluno_id on public.relatos_erro (aluno_id);
create index if not exists idx_relatos_erro_questao_id on public.relatos_erro (questao_id);
create index if not exists idx_relatos_erro_respondido_por on public.relatos_erro (respondido_por);
create index if not exists idx_simulado_questoes_questao_id on public.simulado_questoes (questao_id);
create index if not exists idx_simulados_criado_por on public.simulados (criado_por);
create index if not exists idx_usuario_permissoes_permissao_id on public.usuario_permissoes (permissao_id);
