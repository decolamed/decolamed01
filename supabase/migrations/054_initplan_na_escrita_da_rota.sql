-- `auth.uid()` avaliado uma vez, e não linha a linha, na escrita da rota.
--
-- O projeto já tinha padronizado isto: a migração 031 percorreu as políticas
-- de RLS trocando `auth.uid()` por `(select auth.uid())`. A diferença não é de
-- resultado — as duas devolvem o mesmo uuid — é de plano. Fora do subselect, o
-- Postgres trata a chamada como volátil e a reexecuta A CADA LINHA examinada;
-- dentro dele vira um InitPlan, calculado uma vez por consulta.
--
-- `aluno_rota_dias` ficou com os dois padrões ao mesmo tempo, na mesma tabela:
-- a política de leitura nasceu certa na 041 (`aluno_id = (select auth.uid())`)
-- e a de escrita, criada no dia seguinte pela 042, nasceu com a chamada solta.
-- O linter do Supabase aponta só a segunda.
--
-- Onde isso pesa: a rota é regravada inteira quando o briefing muda — são N
-- dias apagados e N inseridos numa tacada (rota-persistencia.ts), e cada linha
-- passa pelo `with check`. É exatamente o caso que a 031 existiu para evitar.
--
-- A política é recriada com o mesmo escopo da 042 — `for all`, `to
-- authenticated`, mesmo predicado nos dois lados. Só muda a forma da chamada.

drop policy if exists aluno_rota_dias_write_own on public.aluno_rota_dias;
create policy aluno_rota_dias_write_own on public.aluno_rota_dias
  for all
  to authenticated
  using (aluno_id = (select auth.uid()))
  with check (aluno_id = (select auth.uid()));
