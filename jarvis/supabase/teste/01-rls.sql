-- ===========================================================================
-- TESTE DE ISOLAMENTO ENTRE USUÁRIOS
--
-- Estas são as afirmações de segurança que o README faz. Até agora elas eram
-- só uma explicação bem-intencionada num comentário; aqui elas viram teste.
--
-- Roda com: npm run test:banco
-- ===========================================================================

\set ON_ERROR_STOP on
\set QUIET on
\pset tuples_only on
\pset format unaligned

-- ---------------------------------------------------------------------------
-- Apoio
-- ---------------------------------------------------------------------------
create or replace function conferir(condicao boolean, descricao text)
returns void language plpgsql as $$
begin
  if condicao then
    raise notice 'ok   %', descricao;
  else
    raise exception 'FALHOU: %', descricao;
  end if;
end;
$$;

-- Entra na pele de um usuário logado, exatamente como o Supabase faz: papel
-- `authenticated` mais o `sub` do JWT, que é o que `auth.uid()` lê.
create or replace function virar(quem uuid)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', quem)::text, true);
  execute 'set local role authenticated';
end;
$$;

create or replace function virar_admin()
returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
end;
$$;

-- ---------------------------------------------------------------------------
begin;

-- Dois usuários. A é o dono; B é o intruso.
insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@exemplo.com', '{"nome":"Ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'bruno@exemplo.com', '{"nome":"Bruno"}');

-- === 1. o gatilho de cadastro cria o perfil sozinho ========================
select conferir(
  (select count(*) from perfis where id = '11111111-1111-1111-1111-111111111111') = 1,
  'cadastrar usuário cria o perfil automaticamente'
);
select conferir(
  (select nome from perfis where id = '11111111-1111-1111-1111-111111111111') = 'Ana',
  'o nome vem do raw_user_meta_data do cadastro'
);

-- === 2. A cria a estrutura dela ===========================================
select virar('11111111-1111-1111-1111-111111111111');

insert into tutorias (usuario_id, numero, titulo, modulo)
values ('11111111-1111-1111-1111-111111111111', 1, 'Dor torácica', 'Cardio');

-- A insere a SP passando o usuario_id ERRADO (o de Bruno) de propósito.
-- O gatilho tem que sobrescrever com o dono real da tutoria — que é a Ana.
insert into situacoes_problema (tutoria_id, usuario_id, ordem, titulo)
select id, '22222222-2222-2222-2222-222222222222', 1, 'Homem de 58 anos'
from tutorias where numero = 1;

select conferir(
  (select usuario_id from situacoes_problema limit 1) = '11111111-1111-1111-1111-111111111111',
  'o gatilho ignora o usuario_id enviado e herda o dono real da tutoria'
);

insert into objetivos (sp_id, usuario_id, ordem, texto)
select id, '22222222-2222-2222-2222-222222222222', 1, 'Entender a fisiopatologia'
from situacoes_problema limit 1;

select conferir(
  (select usuario_id from objetivos limit 1) = '11111111-1111-1111-1111-111111111111',
  'objetivo também herda o dono, mesmo com usuario_id forjado'
);

insert into mensagens (sp_id, usuario_id, papel, conteudo)
select id, '11111111-1111-1111-1111-111111111111', 'usuario', 'oi jarvis'
from situacoes_problema limit 1;

insert into resumos (sp_id, usuario_id, titulo, corpo, referencias)
select id, '11111111-1111-1111-1111-111111111111', 'Fisiopatologia', '# Teste',
       '[{"pmid":"123","titulo":"t","autores":[],"revista":"r","ano":"2020"}]'::jsonb
from situacoes_problema limit 1;

insert into memorias (usuario_id, fato)
values ('11111111-1111-1111-1111-111111111111', 'Está no 4º período.');

select conferir((select count(*) from tutorias) = 1, 'A enxerga a própria tutoria');
select conferir((select count(*) from resumos) = 1, 'A enxerga o próprio resumo');

-- === 3. B não enxerga nada da A ===========================================
select virar('22222222-2222-2222-2222-222222222222');

select conferir((select count(*) from tutorias) = 0, 'B não enxerga a tutoria da A');
select conferir((select count(*) from situacoes_problema) = 0, 'B não enxerga a SP da A');
select conferir((select count(*) from objetivos) = 0, 'B não enxerga os objetivos da A');
select conferir((select count(*) from mensagens) = 0, 'B não lê a conversa da A');
select conferir((select count(*) from resumos) = 0, 'B não enxerga os resumos da A');
select conferir((select count(*) from memorias) = 0, 'B não enxerga a memória da A');
-- B enxerga UM perfil: o dele. O que ele não pode é enxergar o da Ana — a
-- policy de `perfis` é `id = auth.uid()`, e não "nenhum".
select conferir((select count(*) from perfis) = 1, 'B enxerga o próprio perfil');
select conferir(
  (select count(*) from perfis where id = '11111111-1111-1111-1111-111111111111') = 0,
  'B não enxerga o perfil da A'
);

-- === 4. B não consegue plantar conteúdo na pasta da A =====================
-- Este é o ataque que o par gatilho+policy existe para impedir: B manda o
-- tutoria_id da Ana e o próprio usuario_id, esperando que a policy aprove
-- (afinal o usuario_id bate com auth.uid()) e a linha caia na pasta dela.
do $$
declare
  id_da_tutoria_alheia uuid;
  deu_erro boolean := false;
begin
  perform virar_admin();
  select id into id_da_tutoria_alheia from tutorias limit 1;
  perform virar('22222222-2222-2222-2222-222222222222');

  begin
    insert into situacoes_problema (tutoria_id, usuario_id, ordem, titulo)
    values (id_da_tutoria_alheia, '22222222-2222-2222-2222-222222222222', 99, 'invasão');
  exception when others then
    deu_erro := true;
  end;

  perform conferir(deu_erro, 'B NÃO consegue criar SP dentro da tutoria da A');
end;
$$;

-- === 5. B não consegue apagar nem alterar o que é da A ====================
select virar('22222222-2222-2222-2222-222222222222');
delete from tutorias;
select virar_admin();
select conferir((select count(*) from tutorias) = 1, 'o DELETE de B não apagou a tutoria da A');

select virar('22222222-2222-2222-2222-222222222222');
update resumos set titulo = 'sequestrado';
select virar_admin();
select conferir(
  (select titulo from resumos limit 1) = 'Fisiopatologia',
  'o UPDATE de B não alterou o resumo da A'
);

-- === 6. identidade é intocável pelo próprio usuário =======================
do $$
declare
  deu_erro boolean := false;
begin
  perform virar('11111111-1111-1111-1111-111111111111');
  begin
    update perfis set email = 'outro@exemplo.com' where id = auth.uid();
  exception when insufficient_privilege then
    deu_erro := true;
  end;
  perform conferir(deu_erro, 'o usuário não consegue trocar o próprio e-mail (GRANT por coluna)');
end;
$$;

select virar('11111111-1111-1111-1111-111111111111');
update perfis set nome = 'Ana Maria', motor_ia = 'gemini' where id = auth.uid();
select conferir(
  (select nome || '/' || motor_ia from perfis where id = auth.uid()) = 'Ana Maria/gemini',
  'o usuário consegue trocar o próprio nome e o motor de IA'
);

-- === 7. memória não acumula repetição =====================================
do $$
declare
  deu_erro boolean := false;
begin
  perform virar('11111111-1111-1111-1111-111111111111');
  begin
    insert into memorias (usuario_id, fato) values (auth.uid(), 'Está no 4º período.');
  exception when unique_violation then
    deu_erro := true;
  end;
  perform conferir(deu_erro, 'o mesmo fato não entra duas vezes na memória');
end;
$$;

-- === 8. apagar a pasta leva tudo junto ====================================
select virar('11111111-1111-1111-1111-111111111111');
delete from tutorias where numero = 1;
select conferir((select count(*) from situacoes_problema) = 0, 'apagar a tutoria apaga as SPs');
select conferir((select count(*) from resumos) = 0, 'apagar a tutoria apaga os resumos');
select conferir((select count(*) from mensagens) = 0, 'apagar a tutoria apaga as mensagens');

-- === 9. anônimo não vê nada ===============================================
select virar_admin();
set local role anon;
do $$
declare
  deu_erro boolean := false;
begin
  begin
    perform count(*) from resumos;
  exception when insufficient_privilege then
    deu_erro := true;
  end;
  perform conferir(deu_erro, 'visitante sem login não tem sequer permissão de ler a tabela');
end;
$$;

reset role;
rollback;

\echo ''
\echo '=================================================='
\echo ' TODOS OS TESTES DE BANCO PASSARAM'
\echo '=================================================='
