// Testes do motor Gemini com o `fetch` dublado.
//
// Por que estes testes existem: o adaptador do Claude passa pelo SDK oficial,
// que valida o formato do pedido. O do Gemini é HTTP cru, montado à mão — se
// o corpo sair no formato errado, a API devolve 400 e o único sintoma é "não
// funciona". Estes testes conferem o CORPO que sai daqui, sem rede.
//
// O que eles NÃO provam: que a API do Google aceita esse corpo hoje. Isso só
// a tela de diagnóstico, rodando na máquina do usuário com a chave dele,
// responde.

import test from "node:test";
import assert from "node:assert/strict";
import { conversarComGemini } from "./gemini.ts";

process.env.GEMINI_API_KEY = "chave-de-teste";

/** Ferramenta de mentira que registra o que recebeu. */
function ferramentaFalsa(nome = "buscar_pubmed") {
  const chamadas = [];
  return {
    chamadas,
    ferramenta: {
      nome,
      descricao: "Busca artigos.",
      esquema: {
        type: "object",
        properties: {
          consulta: { type: "string", description: "em inglês" },
          quantidade: { type: "integer" },
          apenas_revisoes: { type: "boolean" },
          filtros: {
            type: "object",
            properties: { anos: { type: "integer" } }
          },
          termos: { type: "array", items: { type: "string" } }
        },
        required: ["consulta"]
      },
      async executar(entrada) {
        chamadas.push(entrada);
        return { paraModelo: "8 artigos encontrados", paraTela: "PubMed: 8 artigos" };
      }
    }
  };
}

/**
 * Substitui o fetch global por uma fila de respostas e guarda os corpos
 * enviados. Devolve os corpos para inspeção.
 */
function dublarFetch(respostas) {
  const enviados = [];
  const original = globalThis.fetch;
  let i = 0;

  globalThis.fetch = async (url, init) => {
    enviados.push({ url: String(url), corpo: JSON.parse(init.body) });
    const resposta = respostas[Math.min(i, respostas.length - 1)];
    i++;
    return new Response(JSON.stringify(resposta.json ?? resposta), {
      status: resposta.status ?? 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  return { enviados, restaurar: () => { globalThis.fetch = original; } };
}

const textoSimples = (t) => ({ candidates: [{ content: { parts: [{ text: t }] }, finishReason: "STOP" }] });

test("manda systemInstruction e mapeia os papéis da conversa", async () => {
  const d = dublarFetch([textoSimples("oi")]);
  try {
    await conversarComGemini({
      motor: "gemini",
      sistema: "Você é o Jarvis.",
      turnos: [
        { papel: "usuario", texto: "primeira" },
        { papel: "jarvis", texto: "respondi" },
        { papel: "usuario", texto: "segunda" }
      ],
      ferramentas: []
    });
  } finally {
    d.restaurar();
  }

  const { corpo } = d.enviados[0];
  assert.equal(corpo.systemInstruction.parts[0].text, "Você é o Jarvis.");
  // "jarvis" tem que virar "model" — o Gemini não conhece outro nome, e um
  // papel inválido derruba a requisição inteira com 400.
  assert.deepEqual(
    corpo.contents.map((c) => c.role),
    ["user", "model", "user"]
  );
});

test("a chave vai na query string e nunca no corpo", async () => {
  const d = dublarFetch([textoSimples("oi")]);
  try {
    await conversarComGemini({ motor: "gemini", sistema: "s", turnos: [{ papel: "usuario", texto: "x" }], ferramentas: [] });
  } finally {
    d.restaurar();
  }
  assert.match(d.enviados[0].url, /key=chave-de-teste/);
  assert.ok(!JSON.stringify(d.enviados[0].corpo).includes("chave-de-teste"));
});

test("traduz o esquema da ferramenta para o dialeto do Gemini", async () => {
  const { ferramenta } = ferramentaFalsa();
  const d = dublarFetch([textoSimples("ok")]);
  try {
    await conversarComGemini({
      motor: "gemini",
      sistema: "s",
      turnos: [{ papel: "usuario", texto: "x" }],
      ferramentas: [ferramenta]
    });
  } finally {
    d.restaurar();
  }

  const [decl] = d.enviados[0].corpo.tools[0].functionDeclarations;
  assert.equal(decl.name, "buscar_pubmed");

  // O Gemini usa um subconjunto do OpenAPI: tipo em MAIÚSCULA, em todos os
  // níveis. Minúscula é recusada com 400.
  assert.equal(decl.parameters.type, "OBJECT");
  assert.equal(decl.parameters.properties.consulta.type, "STRING");
  assert.equal(decl.parameters.properties.quantidade.type, "INTEGER");
  assert.equal(decl.parameters.properties.apenas_revisoes.type, "BOOLEAN");
  assert.equal(decl.parameters.properties.filtros.type, "OBJECT");
  assert.equal(decl.parameters.properties.filtros.properties.anos.type, "INTEGER");
  assert.equal(decl.parameters.properties.termos.type, "ARRAY");
  assert.equal(decl.parameters.properties.termos.items.type, "STRING");
  assert.deepEqual(decl.parameters.required, ["consulta"]);
});

test("laço completo: pede ferramenta, recebe resultado, responde", async () => {
  const { ferramenta, chamadas } = ferramentaFalsa();
  const d = dublarFetch([
    {
      candidates: [
        {
          content: {
            parts: [{ functionCall: { name: "buscar_pubmed", args: { consulta: "chest pain" } } }]
          },
          finishReason: "STOP"
        }
      ]
    },
    textoSimples("Achei oito artigos sobre dor torácica.")
  ]);

  let r;
  try {
    r = await conversarComGemini({
      motor: "gemini",
      sistema: "s",
      turnos: [{ papel: "usuario", texto: "estuda dor torácica" }],
      ferramentas: [ferramenta]
    });
  } finally {
    d.restaurar();
  }

  assert.deepEqual(chamadas, [{ consulta: "chest pain" }]);
  assert.equal(r.texto, "Achei oito artigos sobre dor torácica.");
  assert.deepEqual(r.acoes, [{ ferramenta: "buscar_pubmed", descricao: "PubMed: 8 artigos", erro: false }]);

  // O segundo pedido tem que carregar a conversa inteira: pergunta, o pedido
  // de ferramenta do modelo, e a resposta da ferramenta.
  const segundo = d.enviados[1].corpo.contents;
  assert.equal(segundo.length, 3);
  assert.ok(segundo[1].parts[0].functionCall, "o turno do modelo volta como functionCall");
  // O resultado da função vai com papel "user": o Gemini não tem papel "tool".
  assert.equal(segundo[2].role, "user");
  assert.equal(segundo[2].parts[0].functionResponse.name, "buscar_pubmed");
  assert.equal(segundo[2].parts[0].functionResponse.response.resultado, "8 artigos encontrados");
});

test("ferramenta que explode vira resultado de erro, não derruba o turno", async () => {
  const ferramenta = {
    nome: "buscar_pubmed",
    descricao: "d",
    esquema: { type: "object", properties: {} },
    async executar() {
      throw new Error("PubMed fora do ar");
    }
  };

  const d = dublarFetch([
    { candidates: [{ content: { parts: [{ functionCall: { name: "buscar_pubmed", args: {} } }] } }] },
    textoSimples("Não consegui pesquisar agora.")
  ]);

  let r;
  try {
    r = await conversarComGemini({
      motor: "gemini",
      sistema: "s",
      turnos: [{ papel: "usuario", texto: "x" }],
      ferramentas: [ferramenta]
    });
  } finally {
    d.restaurar();
  }

  assert.equal(r.texto, "Não consegui pesquisar agora.");
  assert.equal(r.acoes[0].erro, true);
  // O modelo precisa VER o erro para poder explicar ao aluno o que faltou.
  const enviado = d.enviados[1].corpo.contents.at(-1).parts[0].functionResponse;
  assert.match(enviado.response.erro, /PubMed fora do ar/);
});

test("no último passo a ferramenta é proibida, para forçar uma resposta", async () => {
  const { ferramenta } = ferramentaFalsa();
  // O modelo insiste em chamar ferramenta para sempre.
  const d = dublarFetch([
    { candidates: [{ content: { parts: [{ functionCall: { name: "buscar_pubmed", args: {} } }] } }] }
  ]);

  try {
    await conversarComGemini({
      motor: "gemini",
      sistema: "s",
      turnos: [{ papel: "usuario", texto: "x" }],
      ferramentas: [ferramenta],
      maxPassos: 2
    }).catch(() => undefined);
  } finally {
    d.restaurar();
  }

  const modos = d.enviados.map((e) => e.corpo.toolConfig.functionCallingConfig.mode);
  assert.deepEqual(modos, ["AUTO", "AUTO", "NONE"], "o passo final desliga as ferramentas");
});

test("resposta cortada por MAX_TOKENS vira erro explicado, não mensagem vazia", async () => {
  // Este é o modo de falha traiçoeiro do Gemini: HTTP 200, texto vazio.
  const d = dublarFetch([{ candidates: [{ content: { parts: [] }, finishReason: "MAX_TOKENS" }] }]);
  try {
    await assert.rejects(
      conversarComGemini({ motor: "gemini", sistema: "s", turnos: [{ papel: "usuario", texto: "x" }], ferramentas: [] }),
      /cortada no meio/
    );
  } finally {
    d.restaurar();
  }
});

test("bloqueio por filtro de conteúdo vira mensagem acionável", async () => {
  const d = dublarFetch([{ promptFeedback: { blockReason: "SAFETY" } }]);
  try {
    await assert.rejects(
      conversarComGemini({ motor: "gemini", sistema: "s", turnos: [{ papel: "usuario", texto: "x" }], ferramentas: [] }),
      /filtro de conteúdo/
    );
  } finally {
    d.restaurar();
  }
});

test("429 fala de cota, não de 'erro 429'", async () => {
  const d = dublarFetch([{ status: 429, json: { error: { message: "quota" } } }]);
  try {
    await assert.rejects(
      conversarComGemini({ motor: "gemini", sistema: "s", turnos: [{ papel: "usuario", texto: "x" }], ferramentas: [] }),
      /cota do Gemini/
    );
  } finally {
    d.restaurar();
  }
});

test("sem chave configurada, o erro diz qual variável falta", async () => {
  const guardada = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    await assert.rejects(
      conversarComGemini({ motor: "gemini", sistema: "s", turnos: [{ papel: "usuario", texto: "x" }], ferramentas: [] }),
      /GEMINI_API_KEY/
    );
  } finally {
    process.env.GEMINI_API_KEY = guardada;
  }
});
