// O que estes testes fixam é uma distinção, não um formato: "a consulta
// falhou" e "não há registros" NÃO podem produzir o mesmo resultado visível.
// Foi a confusão entre os dois que produziu os três defeitos citados no
// módulo.

import test from "node:test";
import assert from "node:assert/strict";
import { listaOuVazio, linhaOuNula, falhaAoCarregar } from "./resultado.ts";

const ok = (data) => ({ data, error: null });
const falhou = (mensagem) => ({ data: null, error: { message: mensagem } });

/** Captura o que foi para o console.error durante o corpo. */
function comLog(corpo) {
  const original = console.error;
  const linhas = [];
  console.error = (...args) => linhas.push(args.join(" "));
  try {
    corpo();
  } finally {
    console.error = original;
  }
  return linhas;
}

// ══════════════════════════════════════════════ LISTA ═══════════════════════

test("lista vazia de verdade não vira log de erro", () => {
  const linhas = comLog(() => {
    assert.deepEqual(listaOuVazio(ok([]), "usuários"), []);
  });
  assert.deepEqual(linhas, [], "não há falha nenhuma a registrar");
});

test("lista que falhou vira lista vazia COM log", () => {
  let devolvido;
  const linhas = comLog(() => {
    devolvido = listaOuVazio(falhou("more than one relationship was found"), "usuários do painel");
  });
  assert.deepEqual(devolvido, [], "a tela sobrevive");
  assert.equal(linhas.length, 1, "mas a falha ficou registrada");
  assert.match(linhas[0], /usuários do painel/, "o log diz QUAL consulta falhou");
  assert.match(linhas[0], /more than one relationship/, "e o motivo exato");
});

test("data nula sem erro é lista vazia, sem drama", () => {
  const linhas = comLog(() => {
    assert.deepEqual(listaOuVazio(ok(null), "planos"), []);
  });
  assert.deepEqual(linhas, []);
});

test("as linhas passam intactas quando dá certo", () => {
  assert.deepEqual(listaOuVazio(ok([{ id: 1 }, { id: 2 }]), "planos"), [{ id: 1 }, { id: 2 }]);
});

// ══════════════════════════════════════════════ LINHA ÚNICA ═════════════════

test("linha que falhou vira null COM log", () => {
  let devolvido;
  const linhas = comLog(() => {
    devolvido = linhaOuNula(falhou("timeout"), "perfil do aluno");
  });
  assert.equal(devolvido, null);
  assert.match(linhas[0], /perfil do aluno.*timeout/);
});

test("linha ausente de verdade é null sem log", () => {
  const linhas = comLog(() => {
    assert.equal(linhaOuNula(ok(null), "cupom"), null);
  });
  assert.deepEqual(linhas, []);
});

// ══════════════════════════════════════ A MENSAGEM DA TELA ══════════════════

test("nenhuma falha não produz aviso nenhum", () => {
  assert.equal(falhaAoCarregar({ usuários: ok([]), planos: ok([]) }), null);
});

test("a mensagem nomeia a consulta e o motivo", () => {
  const aviso = falhaAoCarregar({ usuários: falhou("PGRST201"), planos: ok([]) });
  assert.match(aviso, /usuários/);
  assert.match(aviso, /PGRST201/);
});

test("a mensagem desmente explicitamente a leitura de 'não há registros'", () => {
  // É a frase que faltou nas três vezes: sem ela, o admin vê a tabela vazia
  // logo abaixo do aviso e conclui que não há dados.
  const aviso = falhaAoCarregar({ usuários: falhou("erro") });
  assert.match(aviso, /não trate como/i);
});

test("todas as falhas aparecem, não só a primeira", () => {
  // Quando a causa é comum — uma chave estrangeira nova, uma tabela
  // renomeada — ver as três juntas é o que denuncia a causa comum.
  const aviso = falhaAoCarregar({
    usuários: falhou("a"),
    planos: falhou("b"),
    cupons: falhou("c")
  });
  for (const nome of ["usuários", "planos", "cupons"]) assert.match(aviso, new RegExp(nome));
});

test("consulta ausente ou indefinida não quebra o aviso", () => {
  // As páginas montam esse objeto à mão; um campo esquecido não pode derrubar
  // a renderização inteira.
  assert.equal(falhaAoCarregar({ usuários: undefined, planos: ok([]) }), null);
});
