-- ============================================================================
-- 065 — Uma matrícula por pré-cadastro (a chave que o código já supunha)
--
-- NÃO APLICADA AINDA. Ver o diagnóstico abaixo antes de rodar.
--
-- O DEFEITO, medido em produção em 19/08/2026
-- -------------------------------------------
-- `confirmarPagamento` grava a matrícula assim:
--
--     .upsert({ ... }, { onConflict: "pre_cadastro_id" })
--
-- ON CONFLICT exige um índice único na coluna citada. A tabela `matriculas`
-- só tem PRIMARY KEY (id). Então o Postgres recusa a instrução inteira:
--
--     there is no unique or exclusion constraint matching the ON CONFLICT
--     specification
--
-- Esse erro apareceu SETE vezes nos logs entre 17:22:19 e 17:22:51 — uma por
-- retentativa da tela de checkout, que pergunta o status a cada 5 segundos.
--
-- A consequência é a pior possível para quem pagou: o usuário e o perfil são
-- criados, a matrícula NÃO, e `pre_cadastros.convertido` nunca vira true.
-- Como é o `convertido` que encerra a idempotência, a confirmação é tentada
-- de novo a cada 5 segundos — e cada tentativa reenvia o convite. O aluno
-- fica sem acesso e com a caixa de entrada cheia do mesmo e-mail.
--
-- POR QUE A CHAVE ESTÁ CERTA
-- --------------------------
-- Ela não existe só para o `onConflict` funcionar: um pré-cadastro é UMA
-- compra, e uma compra dá UMA matrícula. Duas linhas para o mesmo
-- `pre_cadastro_id` seriam acesso duplicado pago uma vez só. A regra que o
-- código sempre quis passa a ser garantida pelo banco.
--
-- SEGURANÇA DA APLICAÇÃO
-- ----------------------
-- Conferido antes de escrever: 4 matrículas na tabela, TODAS com
-- `pre_cadastro_id` nulo (nasceram pelo painel, não pelo checkout), e ZERO
-- pares duplicados. Então o índice entra sem precisar limpar nada.
--
-- Índice comum e não parcial, de propósito: `ON CONFLICT (pre_cadastro_id)`
-- só reconhece um índice sobre exatamente essa coluna, sem cláusula WHERE —
-- um índice parcial não satisfaz a instrução e o defeito continuaria. As
-- matrículas do painel seguem convivendo com ele porque, em Postgres, várias
-- linhas com NULL não colidem num índice único.
-- ============================================================================

create unique index if not exists matriculas_pre_cadastro_id_key
  on public.matriculas (pre_cadastro_id);

comment on index public.matriculas_pre_cadastro_id_key is
  'Uma matrícula por pré-cadastro. Exigido por confirmarPagamento (ON CONFLICT) e pela regra de negócio: uma compra, um acesso.';
