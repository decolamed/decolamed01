-- ============================================================================
-- 060 — Os quatro resumos de livro passam a ter endereço configurável
--
-- O cronograma tem quatro itens obrigatórios de leitura ("Leitura do resumo
-- do Livro 1" … "Livro 4"). Os quatro estavam gravados assim em trilha_dias:
--
--   {"tipo":"leitura","titulo":"Leitura do resumo do Livro 1","url":null,
--    "ref_id":null}
--
-- Nenhum deles tinha endereço, nenhum tinha conteúdo correspondente em
-- conteudos_biblioteca, e a tela do aluno ignorava "leitura" de propósito.
-- O aluno via o item e não tinha para onde ir.
--
-- Esta migração cria as quatro chaves em `configuracoes`, que passam a ser a
-- FONTE OFICIAL do endereço. Quem exibe um resumo não guarda link nenhum:
-- resolve por aqui, via lib/site/resumos-livros.ts. Trocar o link em
-- /admin/configuracoes muda o destino em todos os cronogramas ao mesmo tempo
-- — template, rota do Voo Guiado, plano Decolando — sem republicar nada.
--
-- As chaves nascem com string vazia, não com um endereço inventado: enquanto
-- o admin não preencher, o item avisa que o link ainda não foi cadastrado, em
-- vez de abrir uma página errada.
--
-- `on conflict do nothing` para a migração poder rodar de novo sem apagar o
-- que o administrador já tiver salvo.
-- ============================================================================

insert into configuracoes (chave, valor)
values
  ('livros.resumo_1_url', '""'::jsonb),
  ('livros.resumo_2_url', '""'::jsonb),
  ('livros.resumo_3_url', '""'::jsonb),
  ('livros.resumo_4_url', '""'::jsonb)
on conflict (chave) do nothing;
