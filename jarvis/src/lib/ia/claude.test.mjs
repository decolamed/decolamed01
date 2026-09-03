// Testes do motor Claude contra um servidor HTTP local.
//
// Por que servidor de verdade em vez de dublar o `fetch`: aqui o pedido é
// montado pelo SDK oficial, não por mim. Interceptar o fetch testaria o que eu
// mandei para o SDK; subir um servidor testa o que o SDK REALMENTE põe na
// rede — que é onde mora a diferença entre "compila" e "funciona".
//
// O SDK aceita `ANTHROPIC_BASE_URL`, então não é preciso costura nenhuma no
// código de produção para os testes existirem.

import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

const recebidos = [];
let respostas = [];
let i = 0;

const servidor = createServer((req, res) => {
  let corpo = "";
  req.on("data", (p) => (corpo += p));
  req.on("end", () => {
    recebidos.push({
      caminho: req.url,
      cabecalhos: req.headers,
      corpo: JSON.parse(corpo || "{}")
    });
    const resposta = respostas[Math.min(i, respostas.length - 1)];
    i++;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(resposta));
  });
});

const porta = await new Promise((ok) => {
  servidor.listen(0, "127.0.0.1", () => ok(servidor.address().port));
});

process.env.ANTHROPIC_API_KEY = "chave-de-teste";
process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${porta}`;

// Importado DEPOIS das variáveis de ambiente: o cliente é construído na
// primeira chamada e congela a URL base.
const { conversarComClaude } = await import("./claude.ts");

test.after(() => servidor.close());

function prepararRespostas(lista) {
  recebidos.length = 0;
  respostas = lista;
  i = 0;
}

function mensagem(content, stop_reason = "end_turn") {
  return {
    id: "msg_teste",
    type: "message",
    role: "assistant",
    model: "claude-opus-5",
    content,
    stop_reason,
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 10 }
  };
}

const ferramentaFalsa = (registro = []) => ({
  registro,
  ferramenta: {
    nome: "buscar_pubmed",
    descricao: "Busca artigos no PubMed.",
    esquema: {
      type: "object",
      properties: { consulta: { type: "string", description: "em inglês" } },
      required: ["consulta"]
    },
    async executar(entrada) {
      registro.push(entrada);
      return { paraModelo: "8 artigos encontrados", paraTela: "PubMed: 8 artigos" };
    }
  }
});

test("manda modelo, prompt de sistema e a conversa no formato do SDK", async () => {
  prepararRespostas([mensagem([{ type: "text", text: "olá" }])]);

  const r = await conversarComClaude({
    motor: "claude",
    sistema: "Você é o Jarvis.",
    turnos: [
      { papel: "usuario", texto: "primeira" },
      { papel: "jarvis", texto: "respondi" },
      { papel: "usuario", texto: "segunda" }
    ],
    ferramentas: []
  });

  assert.equal(r.texto, "olá");
  assert.equal(r.motor, "claude");

  const { corpo, cabecalhos } = recebidos[0];
  assert.equal(corpo.model, "claude-opus-5");
  assert.equal(corpo.system, "Você é o Jarvis.");
  assert.deepEqual(
    corpo.messages.map((m) => m.role),
    ["user", "assistant", "user"]
  );
  assert.equal(cabecalhos["x-api-key"], "chave-de-teste");
});

test("declara a ferramenta com o esquema JSON como está", async () => {
  const { ferramenta } = ferramentaFalsa();
  prepararRespostas([mensagem([{ type: "text", text: "ok" }])]);

  await conversarComClaude({
    motor: "claude",
    sistema: "s",
    turnos: [{ papel: "usuario", texto: "x" }],
    ferramentas: [ferramenta]
  });

  const [decl] = recebidos[0].corpo.tools;
  assert.equal(decl.name, "buscar_pubmed");
  assert.equal(decl.description, "Busca artigos no PubMed.");
  // Ao contrário do Gemini, aqui o JSON Schema vai em minúscula, sem tradução.
  assert.equal(decl.input_schema.type, "object");
  assert.equal(decl.input_schema.properties.consulta.type, "string");
  assert.deepEqual(decl.input_schema.required, ["consulta"]);
});

test("laço completo devolvendo o tool_result no formato certo", async () => {
  const { ferramenta, registro } = ferramentaFalsa();
  prepararRespostas([
    mensagem(
      [
        { type: "thinking", thinking: "", signature: "assinatura-abc" },
        { type: "tool_use", id: "tu_1", name: "buscar_pubmed", input: { consulta: "chest pain" } }
      ],
      "tool_use"
    ),
    mensagem([{ type: "text", text: "Achei oito artigos." }])
  ]);

  const r = await conversarComClaude({
    motor: "claude",
    sistema: "s",
    turnos: [{ papel: "usuario", texto: "estuda dor torácica" }],
    ferramentas: [ferramenta]
  });

  assert.deepEqual(registro, [{ consulta: "chest pain" }]);
  assert.equal(r.texto, "Achei oito artigos.");
  assert.deepEqual(r.acoes, [
    { ferramenta: "buscar_pubmed", descricao: "PubMed: 8 artigos", erro: false }
  ]);

  const segundo = recebidos[1].corpo.messages;
  assert.equal(segundo.length, 3);

  // O turno do assistente volta INTEIRO, com o bloco de raciocínio. Mandar só
  // o texto quebra a continuidade que o modelo espera ao ler o resultado.
  const doAssistente = segundo[1];
  assert.equal(doAssistente.role, "assistant");
  assert.ok(
    doAssistente.content.some((b) => b.type === "thinking"),
    "o bloco de raciocínio tem que voltar junto"
  );

  // Todos os resultados numa mensagem `user` só — separá-los ensina o modelo
  // a parar de pedir ferramentas em paralelo.
  const resultado = segundo[2];
  assert.equal(resultado.role, "user");
  assert.equal(resultado.content[0].type, "tool_result");
  assert.equal(resultado.content[0].tool_use_id, "tu_1");
  assert.equal(resultado.content[0].content, "8 artigos encontrados");
});

test("duas ferramentas pedidas de uma vez rodam juntas e voltam numa mensagem só", async () => {
  const registro = [];
  const { ferramenta } = ferramentaFalsa(registro);
  prepararRespostas([
    mensagem(
      [
        { type: "tool_use", id: "tu_1", name: "buscar_pubmed", input: { consulta: "a" } },
        { type: "tool_use", id: "tu_2", name: "buscar_pubmed", input: { consulta: "b" } }
      ],
      "tool_use"
    ),
    mensagem([{ type: "text", text: "pronto" }])
  ]);

  await conversarComClaude({
    motor: "claude",
    sistema: "s",
    turnos: [{ papel: "usuario", texto: "x" }],
    ferramentas: [ferramenta]
  });

  assert.deepEqual(registro, [{ consulta: "a" }, { consulta: "b" }]);
  const resultado = recebidos[1].corpo.messages[2];
  assert.equal(resultado.content.length, 2, "os dois resultados na MESMA mensagem");
  assert.deepEqual(
    resultado.content.map((b) => b.tool_use_id),
    ["tu_1", "tu_2"]
  );
});

test("ferramenta que explode vira tool_result com is_error", async () => {
  const ferramenta = {
    nome: "buscar_pubmed",
    descricao: "d",
    esquema: { type: "object", properties: {} },
    async executar() {
      throw new Error("PubMed fora do ar");
    }
  };

  prepararRespostas([
    mensagem([{ type: "tool_use", id: "tu_1", name: "buscar_pubmed", input: {} }], "tool_use"),
    mensagem([{ type: "text", text: "Não consegui pesquisar." }])
  ]);

  const r = await conversarComClaude({
    motor: "claude",
    sistema: "s",
    turnos: [{ papel: "usuario", texto: "x" }],
    ferramentas: [ferramenta]
  });

  assert.equal(r.texto, "Não consegui pesquisar.");
  assert.equal(r.acoes[0].erro, true);
  const enviado = recebidos[1].corpo.messages[2].content[0];
  assert.equal(enviado.is_error, true);
  assert.match(enviado.content, /PubMed fora do ar/);
});

test("no último passo a ferramenta continua declarada, mas proibida", async () => {
  const { ferramenta } = ferramentaFalsa();
  prepararRespostas([
    mensagem([{ type: "tool_use", id: "tu_1", name: "buscar_pubmed", input: {} }], "tool_use")
  ]);

  await conversarComClaude({
    motor: "claude",
    sistema: "s",
    turnos: [{ papel: "usuario", texto: "x" }],
    ferramentas: [ferramenta],
    maxPassos: 2
  }).catch(() => undefined);

  const escolhas = recebidos.map((r) => r.corpo.tool_choice.type);
  assert.deepEqual(escolhas, ["auto", "auto", "none"]);
  // Tirar a ferramenta da lista faria a API recusar: o histórico já tem
  // `tool_use` apontando para ela.
  assert.ok(recebidos.at(-1).corpo.tools.length > 0, "a ferramenta segue declarada");
});

test("recusa do modelo vira mensagem que o aluno entende", async () => {
  prepararRespostas([mensagem([], "refusal")]);
  await assert.rejects(
    conversarComClaude({
      motor: "claude",
      sistema: "s",
      turnos: [{ papel: "usuario", texto: "x" }],
      ferramentas: []
    }),
    /recusou este pedido/
  );
});

test("o pedido carrega o fallback de recusa", async () => {
  prepararRespostas([mensagem([{ type: "text", text: "ok" }])]);
  await conversarComClaude({
    motor: "claude",
    sistema: "s",
    turnos: [{ papel: "usuario", texto: "x" }],
    ferramentas: []
  });

  // Conteúdo médico esbarra em classificador de segurança de vez em quando.
  // Sem isto, uma recusa deixa o aluno na mão no meio da tutoria.
  assert.equal(recebidos[0].corpo.fallbacks, "default");
  assert.match(recebidos[0].cabecalhos["anthropic-beta"] ?? "", /server-side-fallback/);
});

test("sem chave configurada, o erro diz qual variável falta", async () => {
  const guardada = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    await assert.rejects(
      conversarComClaude({
        motor: "claude",
        sistema: "s",
        turnos: [{ papel: "usuario", texto: "x" }],
        ferramentas: []
      }),
      /ANTHROPIC_API_KEY/
    );
  } finally {
    process.env.ANTHROPIC_API_KEY = guardada;
  }
});
