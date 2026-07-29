-- Corrige os valores de `configuracoes` que ficaram com aspas a mais.
--
-- A tela /admin/configuracoes gravava `JSON.stringify(texto)` numa coluna
-- **jsonb**. Como o supabase-js já serializa o que recebe, cada "Salvar"
-- somava um par de aspas ao valor — e como o formulário é preenchido com
-- o que foi lido, o erro se acumulava. Em produção o WhatsApp do site
-- estava assim:
--
--   "\"557498141244\""      (duas camadas)
--
-- O código lia esse texto cru e montava wa.me/"557498141244", com aspas
-- dentro da URL: os botões de WhatsApp do aluno e do rodapé, o link do
-- Instagram e o link da Base de Temas não abriam.
--
-- A correção no código (lib/site/configuracoes.ts) já desembrulha na
-- leitura, então a plataforma funciona mesmo sem esta migração. Ela
-- existe para o dado voltar ao formato certo — senão o valor continua
-- torto no banco e reaparece em qualquer consulta ou integração futura
-- que leia a tabela direto.
--
-- Repete até não haver mais camadas: `valor #>> '{}'` extrai o texto do
-- jsonb, e ele só é reconvertido quando ainda for uma string JSON.
do $$
declare
  afetadas integer;
  voltas integer := 0;
begin
  loop
    update configuracoes
       set valor = (valor #>> '{}')::jsonb
     where jsonb_typeof(valor) = 'string'
       and left(valor #>> '{}', 1) = '"'
       and right(valor #>> '{}', 1) = '"'
       -- Só desembrulha o que realmente é uma string JSON aninhada; um
       -- texto legítimo entre aspas não sobreviveria ao cast e ficaria
       -- de fora por causa desta checagem.
       and (valor #>> '{}') ~ '^".*"$'
       and jsonb_typeof((valor #>> '{}')::jsonb) = 'string';

    get diagnostics afetadas = row_count;
    voltas := voltas + 1;
    exit when afetadas = 0 or voltas > 5;
  end loop;
end $$;

-- Resquício do antigo site de vendas: o texto do "hero" da home, que não
-- existe mais (a home pública foi substituída pelas páginas de inscrição).
-- Nenhum ponto do código lê esta chave.
delete from configuracoes where chave = 'site.hero.titulo';
