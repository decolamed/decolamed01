// Testes da atividade diária "N questões de [matéria]".
//
// Cobrem os 7 cenários exigidos: quantidade, não repetição entre atividades,
// persistência, independência entre alunos, poucas questões disponíveis,
// integridade do fluxo de desempenho e todas as matérias canônicas.

import test from "node:test";
import assert from "node:assert/strict";
import {
  selecionarQuestoes,
  quantidadeDoItem,
  chaveSessaoTrilha,
  chaveSessaoMissao,
  lerChaveSessao,
  QUESTOES_POR_SESSAO,
  MAXIMO_POR_SESSAO
} from "./sessao-questoes.ts";

/** Banco simulado: 82 questões de Biologia, como no banco real. */
const banco = (prefixo, n) => Array.from({ length: n }, (_, i) => `${prefixo}-${String(i + 1).padStart(3, "0")}`);
const BIOLOGIA = banco("bio", 82);

/** Simula a criação de uma sessão e devolve os ids escolhidos. */
function criarSessao({ disponiveis = BIOLOGIA, jaUsadas = [], quantidade = 5, aluno = "aluno-A", chave = "trilha:1:0" }) {
  return selecionarQuestoes({ disponiveis, jaUsadas, quantidade, semente: `${aluno}|${chave}` });
}

// ----------------------------------------------------------------- TESTE 1 --
test("1 — a atividade tem exatamente 5 questões, nunca o banco inteiro", () => {
  const s = criarSessao({});
  assert.equal(s.ids.length, 5, `veio ${s.ids.length} questões`);
  assert.ok(s.ids.length < BIOLOGIA.length, "jamais o acervo completo");
  assert.equal(new Set(s.ids).size, 5, "sem questão repetida dentro da própria sessão");
  s.ids.forEach((id) => assert.ok(BIOLOGIA.includes(id), `${id} não é do banco da matéria`));
});

test("1b — o número sai do título escrito pelo admin", () => {
  assert.equal(quantidadeDoItem("5 questões de Biologia"), 5);
  assert.equal(quantidadeDoItem("10 questões de Matemática"), 10);
  assert.equal(quantidadeDoItem("1 questão de Física"), 1);
  // Sem número reconhecível, o padrão.
  assert.equal(quantidadeDoItem("Bloco de questões"), QUESTOES_POR_SESSAO);
  assert.equal(quantidadeDoItem(null), QUESTOES_POR_SESSAO);
  // Teto de segurança: nenhuma atividade vira "o banco inteiro" por um título.
  assert.equal(quantidadeDoItem("500 questões de Biologia"), MAXIMO_POR_SESSAO);
});

// ----------------------------------------------------------------- TESTE 2 --
test("2 — a segunda atividade de Biologia não repete nenhuma questão da primeira", () => {
  const dia1 = criarSessao({ chave: "trilha:1:0" });
  const dia5 = criarSessao({ chave: "trilha:5:0", jaUsadas: dia1.ids });

  assert.equal(dia5.ids.length, 5);
  const sobreposicao = dia5.ids.filter((id) => dia1.ids.includes(id));
  assert.deepEqual(sobreposicao, [], `repetiu: ${sobreposicao.join(", ")}`);
});

test("2b — o acúmulo continua valendo depois de várias atividades", () => {
  let usadas = [];
  const vistas = new Set();
  // 16 atividades × 5 = 80 questões, dentro das 82 disponíveis.
  for (let i = 0; i < 16; i++) {
    const s = criarSessao({ chave: `trilha:${i + 1}:0`, jaUsadas: usadas });
    assert.equal(s.ids.length, 5, `atividade ${i + 1} veio com ${s.ids.length}`);
    s.ids.forEach((id) => {
      assert.ok(!vistas.has(id), `questão ${id} repetida na atividade ${i + 1}`);
      vistas.add(id);
    });
    usadas = usadas.concat(s.ids);
  }
  assert.equal(vistas.size, 80);
});

// ----------------------------------------------------------------- TESTE 3 --
test("3 — reabrir a mesma atividade devolve exatamente as mesmas 5 questões", () => {
  // A persistência real é a linha em `aluno_sessao_questoes`; aqui garantimos
  // que nem o sorteio depende do acaso: mesma entrada, mesma saída.
  const a = criarSessao({ chave: "trilha:3:1" });
  const b = criarSessao({ chave: "trilha:3:1" });
  assert.deepEqual(a.ids, b.ids, "a seleção mudou entre duas leituras");
});

// ----------------------------------------------------------------- TESTE 4 --
test("4 — o histórico é por aluno: o que um usou não bloqueia o outro", () => {
  const alunoA = criarSessao({ aluno: "aluno-A" });
  // B nunca fez nada — o histórico de A não entra na conta dele.
  const alunoB = criarSessao({ aluno: "aluno-B" });

  assert.equal(alunoB.ids.length, 5);
  assert.equal(alunoB.ineditasDisponiveis, 82, "para B todas as 82 continuam inéditas");
  // Aluno diferente, sorteio diferente — mas nada impede coincidência parcial.
  assert.notDeepEqual(alunoA.ids, alunoB.ids);
});

// ----------------------------------------------------------------- TESTE 5 --
test("5 — com menos de 5 inéditas, entrega o que existe e NÃO abre o banco", () => {
  // 79 das 82 já usadas: sobram 3.
  const usadas = BIOLOGIA.slice(0, 79);
  const s = criarSessao({ jaUsadas: usadas });

  assert.equal(s.ids.length, 3, "deveria entregar as 3 inéditas");
  assert.equal(s.ineditasDisponiveis, 3);
  assert.equal(s.incompleta, true, "precisa sinalizar que faltou");
  s.ids.forEach((id) => assert.ok(!usadas.includes(id), "não pode repetir para completar"));
});

test("5b — sem nenhuma inédita, a sessão vem vazia em vez do acervo completo", () => {
  const s = criarSessao({ jaUsadas: BIOLOGIA });
  assert.deepEqual(s.ids, []);
  assert.equal(s.ineditasDisponiveis, 0);
  assert.equal(s.incompleta, true);
});

test("5c — banco menor que o pedido não vira erro nem fallback", () => {
  const s = criarSessao({ disponiveis: banco("fis", 2) });
  assert.equal(s.ids.length, 2);
  assert.equal(s.incompleta, true);
});

// ----------------------------------------------------------------- TESTE 6 --
test("6 — a sessão só devolve ids; o registro de desempenho segue o fluxo normal", () => {
  // Este módulo não grava nada e não conhece respostas: quem registra é
  // `registrarResposta`, o mesmo do Banco de Questões, que alimenta
  // `respostas_aluno` e dispara o Copiloto. O teste trava o contrato para
  // que ninguém acrescente um caminho paralelo de gravação aqui.
  const s = criarSessao({});
  assert.deepEqual(Object.keys(s).sort(), ["ids", "incompleta", "ineditasDisponiveis", "pedidas"]);
  s.ids.forEach((id) => assert.equal(typeof id, "string"));
});

// ----------------------------------------------------------------- TESTE 7 --
test("7 — funciona para todas as matérias canônicas, sem misturar acervo", () => {
  const OFICIAIS = [
    "Biologia",
    "Espanhol",
    "Física",
    "Geografia",
    "História",
    "Inglês",
    "Linguagens",
    "Matemática",
    "Química"
  ];

  // Um acervo por matéria, com prefixo próprio.
  const acervos = Object.fromEntries(OFICIAIS.map((m) => [m, banco(m.toLowerCase().slice(0, 3), 20)]));

  OFICIAIS.forEach((materia) => {
    const s = selecionarQuestoes({
      disponiveis: acervos[materia],
      jaUsadas: [],
      quantidade: 5,
      semente: `aluno-A|trilha:1:0|${materia}`
    });
    assert.equal(s.ids.length, 5, `${materia} não recebeu 5 questões`);
    s.ids.forEach((id) =>
      assert.ok(acervos[materia].includes(id), `${materia} recebeu ${id}, que é de outra matéria`)
    );
  });

  // Inglês e Espanhol continuam separados: nenhum id de um cai no outro.
  const ingles = selecionarQuestoes({ disponiveis: acervos["Inglês"], jaUsadas: [], quantidade: 5, semente: "s" });
  const espanhol = selecionarQuestoes({ disponiveis: acervos["Espanhol"], jaUsadas: [], quantidade: 5, semente: "s" });
  assert.equal(ingles.ids.filter((id) => espanhol.ids.includes(id)).length, 0);
});

// -------------------------------------------------------------------- CHAVES
test("as chaves de sessão vão e voltam sem ambiguidade", () => {
  assert.equal(chaveSessaoTrilha(2, 0), "trilha:2:0");
  assert.deepEqual(lerChaveSessao("trilha:2:0"), { tipo: "trilha", dia: 2, indice: 0 });

  const id = "3f1a2b4c-5d6e-4f70-8901-234567890abc";
  assert.equal(chaveSessaoMissao(id), `missao:${id}`);
  assert.deepEqual(lerChaveSessao(`missao:${id}`), { tipo: "missao", id });

  // Chave inventada não abre sessão nenhuma (a rota devolve 404).
  ["", "trilha:", "trilha:a:b", "missao:123", "../../etc/passwd", "aula:1"].forEach((c) =>
    assert.equal(lerChaveSessao(c), null, `${c} não deveria ser aceita`)
  );
});

test("a chave da atividade é a MESMA do progresso — concluir uma conclui a outra", () => {
  // `chaveDeItemTrilha` monta "trilha:<dia>:<índice>" para itens de questões;
  // a sessão usa exatamente esse formato, então marcar a sessão como
  // concluída marca o item do cronograma.
  assert.equal(chaveSessaoTrilha(12, 3), "trilha:12:3");
});
