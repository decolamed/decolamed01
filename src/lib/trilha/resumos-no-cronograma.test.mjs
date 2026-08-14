// Os quatro resumos de livro têm de chegar ao aluno COM o endereço, em
// qualquer cronograma: janela curta, janela longa, com Copiloto e sem.
//
// O endereço é aplicado uma vez só, no template, por `resolverDias` (que lê
// as configurações). Daí em diante ele atravessa `gerarRota`, que reordena,
// agrupa e comprime os dias. Este arquivo fixa que a travessia preserva a
// URL — se algum dia a rota passar a reconstruir os itens em vez de
// carregá-los, o resumo volta a chegar sem link e o teste avisa.

import test from "node:test";
import assert from "node:assert/strict";
import { gerarRota } from "./rota.ts";
import { resolverDias } from "./resolver-itens.ts";
import { aplicarLinksDosResumos } from "@/lib/site/resumos-livros.ts";

const TODOS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

const LINKS = {
  1: "https://config.test/livro-1",
  2: "https://config.test/livro-2",
  3: "https://config.test/livro-3",
  4: "https://config.test/livro-4"
};

/** Os quatro itens exatamente como estão em `trilha_dias` hoje: url nula. */
const TITULOS = [
  "Leitura do resumo do Livro 1",
  "Leitura do resumo do Livro 2",
  "Leitura do resumo do Livro 3",
  "Leitura do resumo do Livro 4 (dia livre de aulas)"
];

function template() {
  const dias = [];
  for (let d = 1; d <= 40; d++) {
    const itens = [];
    for (let j = 0; j < 6; j++) {
      itens.push({
        tipo: j % 3 === 2 ? "questoes" : "aula",
        titulo: `Conteúdo ${d}.${j + 1}`,
        materia: ["Biologia", "Física", "Química", "Matemática"][(d + j) % 4],
        ref_id: null,
        url: "https://youtu.be/x"
      });
    }
    // Os quatro livros, nos mesmos dias do template real (6, 9, 11, 13).
    const livro = [6, 9, 11, 13].indexOf(d);
    if (livro >= 0) itens.push({ tipo: "leitura", titulo: TITULOS[livro], materia: null, ref_id: null, url: null });
    if ([12, 28].includes(d)) itens.push({ tipo: "redacao", titulo: "Redação", materia: null, ref_id: null, url: null });
    if ([20, 36].includes(d)) itens.push({ tipo: "simulado", titulo: "Simulado", materia: null, ref_id: null, url: null });
    dias.push({ dia_numero: d, titulo: `Dia ${d}`, itens });
  }
  return dias;
}

function janela(dias, horas) {
  const inicio = "2026-08-12";
  const d = new Date(`${inicio}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return { inicio, dataProva: d.toISOString().slice(0, 10), diasEstuda: TODOS, minutosPorDia: horas * 60 };
}

/** Todos os itens de leitura da rota, achatados. */
function leiturasDa(rota) {
  return rota.dias.flatMap((d) => (d.itens ?? []).filter((i) => i.tipo === "leitura"));
}

// ───────────────────────────────────── A APLICAÇÃO NO TEMPLATE ──────────────
test("resolverDias preenche os quatro resumos a partir das configurações", () => {
  // Sem nenhum ref_id na lista — que é o caso real. A função lia a
  // biblioteca e voltava cedo, e era por isso que os quatro chegavam nulos.
  const resolvido = resolverDias(template(), new Map(), LINKS);
  const leituras = resolvido.flatMap((d) => d.itens.filter((i) => i.tipo === "leitura"));
  assert.equal(leituras.length, 4);
  assert.deepEqual(
    leituras.map((i) => i.url),
    [LINKS[1], LINKS[2], LINKS[3], LINKS[4]]
  );
});

test("sem link cadastrado, o item continua sem url — nada de endereço inventado", () => {
  const resolvido = resolverDias(template(), new Map(), {});
  resolvido
    .flatMap((d) => d.itens.filter((i) => i.tipo === "leitura"))
    .forEach((i) => assert.equal(i.url, null));
});

test("trocar o link nas configurações troca o destino, sem tocar no template", () => {
  const base = template();
  const antes = resolverDias(base, new Map(), LINKS);
  const depois = resolverDias(base, new Map(), { ...LINKS, 2: "https://config.test/livro-2-novo" });
  const url = (dias, n) =>
    dias.flatMap((d) => d.itens).find((i) => i.tipo === "leitura" && i.titulo.includes(`Livro ${n}`)).url;
  assert.equal(url(antes, 2), LINKS[2]);
  assert.equal(url(depois, 2), "https://config.test/livro-2-novo");
  // O template original não pode ter sido mutado por nenhuma das chamadas.
  assert.equal(base.flatMap((d) => d.itens).find((i) => i.tipo === "leitura").url, null);
});

// ────────────────────────────── A TRAVESSIA PELO ALGORITMO ──────────────────
for (const [rotulo, dias, horas] of [
  ["janela longa (40 dias, 3h)", 40, 3],
  ["janela média (20 dias, 3h)", 20, 3],
  ["janela curta (10 dias, 2h)", 10, 2],
  ["capacidade mínima (10 dias, 1h)", 10, 1]
]) {
  test(`os quatro resumos chegam com link — ${rotulo}`, () => {
    const rota = gerarRota(resolverDias(template(), new Map(), LINKS), janela(dias, horas));
    const leituras = leiturasDa(rota);
    assert.equal(leituras.length, 4, `esperava os 4 livros, vieram ${leituras.length}`);
    leituras.forEach((i) => {
      assert.ok(i.url, `"${i.titulo}" chegou sem endereço`);
      assert.ok(Object.values(LINKS).includes(i.url), `"${i.titulo}" aponta para ${i.url}`);
    });
  });
}

test("cada livro mantém o SEU link depois da compressão da rota", () => {
  // A rota curta agrupa dias do template. Se o agrupamento embaralhasse os
  // itens, o Livro 3 poderia acabar com o endereço do Livro 1 — e ninguém
  // perceberia, porque os dois abrem.
  const rota = gerarRota(resolverDias(template(), new Map(), LINKS), janela(10, 2));
  leiturasDa(rota).forEach((i) => {
    const n = Number(/Livro (\d)/.exec(i.titulo)[1]);
    assert.equal(i.url, LINKS[n], `${i.titulo} deveria apontar para o livro ${n}`);
  });
});

// ─────────────────────────────────── O RESTO NÃO PODE MUDAR ─────────────────
test("aplicar os links não mexe em mais nada do cronograma", () => {
  const com = gerarRota(resolverDias(template(), new Map(), LINKS), janela(20, 3));
  const sem = gerarRota(resolverDias(template(), new Map(), {}), janela(20, 3));
  // Mesma quantidade de dias, mesma ordem, mesmos títulos: a integração
  // define o que acontece no CLIQUE, não quando o resumo aparece.
  assert.deepEqual(
    com.dias.map((d) => (d.itens ?? []).map((i) => i.titulo)),
    sem.dias.map((d) => (d.itens ?? []).map((i) => i.titulo))
  );
});

test("itens que não são resumo de livro passam intactos", () => {
  const antes = template();
  const depois = resolverDias(antes, new Map(), LINKS);
  const naoLeitura = (dias) => dias.flatMap((d) => d.itens).filter((i) => i.tipo !== "leitura");
  // Comparação item a item com a entrada: nenhum outro tipo pode ter sido
  // tocado — nem o que já tinha URL, nem o que não tinha.
  assert.deepEqual(naoLeitura(depois), naoLeitura(antes));
});

test("leitura que não nomeia um dos quatro livros continua sem endereço", () => {
  // Uma leitura avulsa criada pelo admin não é um dos resumos obrigatórios;
  // dar a ela o link do Livro 1 seria pior do que deixá-la sem ação.
  const dias = [
    {
      dia_numero: 1,
      titulo: "Dia 1",
      itens: [{ tipo: "leitura", titulo: "Leitura complementar de Biologia", materia: null, ref_id: null, url: null }]
    }
  ];
  assert.equal(resolverDias(dias, new Map(), LINKS)[0].itens[0].url, null);
});

test("a biblioteca resolve primeiro; a configuração dá a palavra final", () => {
  // Um resumo anexado como conteúdo da biblioteca (com URL própria) tem de
  // acabar apontando para o endereço das configurações — senão sobrariam
  // dois endereços para o mesmo livro.
  const dias = [
    {
      dia_numero: 1,
      titulo: "Dia 1",
      itens: [{ tipo: "leitura", titulo: "Resumo do Livro 2", materia: null, ref_id: "abc", url: null }]
    }
  ];
  const fonte = new Map([
    ["abc", { id: "abc", titulo: "Bagagem Essencial — Livro 2", url: "https://antigo.test/2", materia: "", ativo: true }]
  ]);
  const [dia] = resolverDias(dias, fonte, LINKS);
  assert.equal(dia.itens[0].url, LINKS[2]);
});

test("aplicarLinksDosResumos é idempotente", () => {
  const uma = aplicarLinksDosResumos([{ tipo: "leitura", titulo: "Livro 1", url: null }], LINKS);
  const duas = aplicarLinksDosResumos(uma, LINKS);
  assert.deepEqual(duas, uma);
});
