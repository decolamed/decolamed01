-- O relato de erro passou a ser feito pelo WhatsApp geral da plataforma. A
-- fila interna (`relatos_erro` + /admin/relatos) não tem mais quem a
-- alimente nem quem a leia — mantê-la seria acumular registros que ninguém
-- veria, que é pior do que não ter o canal.
--
-- Conferido antes de remover: nenhuma view, função ou chave estrangeira de
-- outra tabela depende dela, e as 9 linhas existentes eram todas testes.
drop table if exists public.relatos_erro;
