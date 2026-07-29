-- Endurecimento apontado pelo linter de segurança do Supabase.
--
-- 1) ranking_geral
--    A view é SECURITY DEFINER de propósito: um ranking precisa enxergar
--    todos os alunos, o que a RLS de `profiles`/`respostas_aluno` impede.
--    O SELECT já estava revogado de `anon` (só quem está logado vê o
--    ranking) e a view só expõe id, nome e XP — nada de e-mail, telefone
--    ou matrícula. O que sobrava eram os privilégios de escrita herdados
--    do GRANT padrão do Supabase. Nada escreve numa view agregada (o
--    Postgres recusaria de qualquer forma), então revogar só remove
--    superfície e ruído do relatório.
revoke insert, update, delete, truncate, references, trigger
  on public.ranking_geral from anon, authenticated;

-- 2) estudos_botoes
--    A política de leitura valia para `public`, o que inclui `anon`:
--    os botões personalizados da aba Estudos (título, ícone e URL
--    cadastrados pelo admin) ficavam legíveis sem login. Não é dado
--    sensível, mas também não há motivo para expô-los — quem os consome
--    é o app do aluno, sempre autenticado.
drop policy if exists estudos_botoes_select_ativos on public.estudos_botoes;
create policy estudos_botoes_select_ativos on public.estudos_botoes
  for select to authenticated
  using (ativo = true or is_admin());
