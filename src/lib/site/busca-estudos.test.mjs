// O campo "Buscar conteúdo, assuntos..." da aba Estudos era decorativo: um
// `<input>` sem `value`, sem `onChange`, e nada na tela reagia. O aluno
// digitava, via o texto aparecer, e a tela continuava idêntica.
//
// Estes testes fixam o que a busca precisa encontrar — e, tão importante
// quanto, o que ela NÃO pode fazer: despejar o banco de questões inteiro no
// resultado, ou dizer "nada encontrado" antes de o aluno digitar.

import test from "node:test";
import assert from "node:assert/strict";
import { acervoPesquisavel, buscarNosEstudos, MINIMO_PARA_BUSCAR } from "./busca-estudos.ts";

const ACERVO = {
  conteudos: [
    { id: "c1", tipo: "aula", titulo: "Citologia — a célula", materia: "Biologia", assunto: "Citologia", url: "https://youtu.be/1" },
    { id: "c2", tipo: "pdf", titulo: "Resumo de Cinemática", materia: "Física", assunto: "Cinemática", url: "https://x.test/1.pdf" },
    // Sem URL: não abre nada, então não entra na busca.
    { id: "c3", tipo: "aula", titulo: "Aula fantasma", materia: "Biologia", assunto: null, url: null }
  ],
  conteudosTrilha: [
    { tipo: "aula", ref_id: "t1", url: "https://youtu.be/2", titulo: "Semântica [Prof Noslen]", materia: "Linguagens" },
    // Mesma URL de c1: é o mesmo vídeo, não pode aparecer duas vezes.
    { tipo: "aula", ref_id: "c1", url: "https://youtu.be/1", titulo: "Citologia — a célula", materia: "Biologia" }
  ],
  questoes: [
    { materia: "Biologia", assunto: "Citologia" },
    { materia: "Biologia", assunto: "Genética" },
    { materia: "Física", assunto: "Cinemática" }
  ],
  flashcards: [
    { materia: "Biologia", assunto: "Citologia" },
    { materia: "Química", assunto: "Ácidos" }
  ],
  simulados: [{ id: "s1", titulo: "Simulado FACAPE 01", descricao: "prova completa" }],
  botoes: [{ id: "b1", titulo: "Base de Temas de Redação" }]
};

const acervo = acervoPesquisavel(ACERVO);
const buscar = (q) => buscarNosEstudos(acervo, q);
const titulos = (r) => (r ?? []).map((i) => i.titulo);

// ═══════════════════════════════════════════════ O ACERVO ═══════════════════
test("o material que só existe no cronograma entra na busca", () => {
  // Praticamente todo o acervo desta plataforma mora em `trilha_dias.itens`,
  // não em `conteudos_biblioteca`. Buscar só na biblioteca não acharia quase
  // nada — é o mesmo motivo pelo qual a aba Estudos já recebe
  // `conteudosTrilha`.
  assert.deepEqual(titulos(buscar("semantica")), ["Semântica [Prof Noslen]"]);
});

test("o mesmo vídeo não aparece duas vezes", () => {
  // A aula de Citologia está na biblioteca E num dia do cronograma.
  const achados = (buscar("celula") ?? []).filter((i) => i.url === "https://youtu.be/1");
  assert.equal(achados.length, 1);
});

test("conteúdo sem endereço não entra: seria um resultado que não abre", () => {
  assert.deepEqual(titulos(buscar("fantasma")), []);
});

test("o banco de questões entra agrupado por matéria, não questão a questão", () => {
  const bio = (buscar("biologia") ?? []).filter((i) => i.tipo === "questoes");
  assert.equal(bio.length, 1, "esperava uma linha de matéria, não uma por questão");
  assert.equal(bio[0].titulo, "Biologia");
  assert.equal(bio[0].nota, "2 questões");
});

test("o singular é respeitado quando há uma só", () => {
  const fisica = (buscar("fisica") ?? []).filter((i) => i.tipo === "questoes");
  assert.equal(fisica[0].nota, "1 questão");
});

test("flashcards também entram por matéria", () => {
  const quimica = (buscar("quimica") ?? []).filter((i) => i.tipo === "flashcards");
  assert.equal(quimica.length, 1);
  assert.equal(quimica[0].nota, "1 flashcard");
});

test("simulados e materiais avulsos do admin são encontráveis", () => {
  assert.ok(titulos(buscar("facape")).includes("Simulado FACAPE 01"));
  assert.ok(titulos(buscar("base de temas")).includes("Base de Temas de Redação"));
});

// ══════════════════════════════════════════ O COMPORTAMENTO ═════════════════
test("antes de digitar o suficiente, não há busca — e isso não é 'nada encontrado'", () => {
  // A distinção importa: com null a tela mostra o conteúdo normal. Sem ela,
  // abrir a aba Estudos exibiria "nada encontrado" antes de qualquer digitação.
  assert.equal(buscar(""), null);
  assert.equal(buscar(" "), null);
  assert.equal(buscar("a"), null);
  assert.equal(MINIMO_PARA_BUSCAR, 2);
  assert.notEqual(buscar("bi"), null);
});

test("termo sem resultado devolve lista vazia, não null", () => {
  assert.deepEqual(buscar("astronomia"), []);
});

test("acento e caixa não atrapalham", () => {
  assert.ok(titulos(buscar("SEMANTICA")).includes("Semântica [Prof Noslen]"));
  assert.ok(titulos(buscar("cinemática")).includes("Resumo de Cinemática"));
  assert.ok(titulos(buscar("QUIMICA")).length > 0);
});

test("busca por assunto acha a matéria certa", () => {
  // "citologia" não é o nome de nenhuma matéria — mas é assunto de questões
  // e flashcards de Biologia, e título de uma aula.
  const achados = buscar("citologia") ?? [];
  assert.ok(achados.some((i) => i.tipo === "aula"));
  assert.ok(achados.some((i) => i.tipo === "questoes" && i.titulo === "Biologia"));
});

test("todos os termos precisam casar — busca 'E', não 'OU'", () => {
  assert.deepEqual(titulos(buscar("citologia celula")), ["Citologia — a célula"]);
  assert.deepEqual(buscar("citologia cinematica"), []);
});

test("o título tem precedência sobre a matéria na ordenação", () => {
  // Buscar "cinemática" deve trazer o PDF que se chama assim antes de uma
  // linha que só casa pela matéria.
  const r = buscar("cinematica") ?? [];
  assert.equal(r[0].titulo, "Resumo de Cinemática");
});

test("o limite de resultados é respeitado", () => {
  const muitos = acervoPesquisavel({
    ...ACERVO,
    conteudos: Array.from({ length: 100 }, (_, i) => ({
      id: `x${i}`, tipo: "aula", titulo: `Aula de Biologia ${i}`, materia: "Biologia", assunto: null, url: `https://youtu.be/x${i}`
    }))
  });
  assert.equal(buscarNosEstudos(muitos, "biologia", 10).length, 10);
});

test("acervo vazio não explode", () => {
  const vazio = acervoPesquisavel({
    conteudos: [], conteudosTrilha: [], questoes: [], flashcards: [], simulados: [], botoes: []
  });
  assert.deepEqual(buscarNosEstudos(vazio, "biologia"), []);
});

test("cada resultado tem chave única — a lista é renderizada por chave", () => {
  const chaves = acervo.map((i) => i.chave);
  assert.equal(new Set(chaves).size, chaves.length);
});
