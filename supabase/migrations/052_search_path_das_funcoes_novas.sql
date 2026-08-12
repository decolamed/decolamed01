-- search_path fixo nas três funções criadas nesta linha de trabalho.
--
-- O projeto já tinha endurecido isto (migrações 024 e 030): toda função do
-- schema public roda com `search_path = public, pg_temp`, para que um schema
-- criado por outro papel não consiga sequestrar um nome de tabela ou de função
-- dentro do corpo dela. As três funções abaixo nasceram depois e ficaram de
-- fora — o linter do Supabase aponta as três como "role mutable search_path".
--
-- `public` (e não '') porque `latex_para_texto` chama `translate_marcado` sem
-- qualificar o schema, e `aluno_rota_uma_assinatura` lê `public.aluno_rota_dias`.

alter function public.latex_para_texto(text) set search_path = public, pg_temp;
alter function public.translate_marcado(text, text, text, text) set search_path = public, pg_temp;
alter function public.aluno_rota_uma_assinatura() set search_path = public, pg_temp;
