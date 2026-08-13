-- Botão da Tela de Estudo destinado a um curso específico.
--
-- `planos` já é a tabela de cursos, e `profiles.plano_id` já é o vínculo do
-- aluno com o dele — é o que `alunoTemCopiloto()` usa para decidir acesso ao
-- Copiloto. Reaproveitar essa mesma chave, em vez de comparar nome de plano
-- em texto: a plataforma já teve o defeito de decidir plano por
-- `nome.includes("guiado")`, que quebra no dia em que o admin renomeia.
--
-- NULL = todos os cursos. É o padrão certo por dois motivos: é o
-- comportamento que os botões já cadastrados têm hoje (nenhum deles some), e
-- é o padrão seguro — esquecer de escolher publica para todos, nunca esconde
-- de todos.
--
-- `on delete set null`: apagar um curso não pode apagar o material do admin.
-- Ele volta a valer para todos, visível no painel, em vez de sumir da tela.

alter table public.estudos_botoes
  add column if not exists plano_id uuid references public.planos(id) on delete set null;

comment on column public.estudos_botoes.plano_id is
  'Curso (plano) para o qual o botão aparece. NULL = todos os cursos.';

create index if not exists estudos_botoes_plano on public.estudos_botoes (plano_id)
  where plano_id is not null;

-- A segmentação vale no BANCO, não só na tela.
--
-- A política anterior liberava todo botão ativo para qualquer autenticado. A
-- tela do aluno passa a filtrar por curso, mas filtro de tela é conveniência:
-- quem consultasse a tabela direto continuaria vendo o material exclusivo de
-- outro curso. Aqui a regra passa a ser da linha.
drop policy if exists estudos_botoes_select_ativos on public.estudos_botoes;

create policy estudos_botoes_select_ativos on public.estudos_botoes
  for select
  using (
    is_admin()
    or (
      ativo = true
      and (
        plano_id is null
        or plano_id = (select p.plano_id from public.profiles p where p.id = (select auth.uid()))
      )
    )
  );
