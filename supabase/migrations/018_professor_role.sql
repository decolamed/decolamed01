-- ============================================================================
-- DECOLA MED — MIGRAÇÃO 018: novo role "professor"
--
-- Mesmo padrão da migração 004 (role "parceiro"): só o ALTER TYPE aqui,
-- porque o Postgres não permite usar um valor de enum recém-criado na
-- mesma transação em que foi adicionado.
--
-- Escopo do papel "professor": é um marcador organizacional em profiles.role
-- para gestão de usuários (filtros, cadastro manual) — sem área própria no
-- app nem permissões elevadas no painel administrativo. Um professor não
-- tem matrícula/plano e, se tentar acessar /aluno, cai no fluxo normal de
-- "acesso expirado" por não ter matrícula ativa.
-- ============================================================================

alter type user_role add value if not exists 'professor';
