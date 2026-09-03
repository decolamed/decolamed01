// Testes das ferramentas do Jarvis.
//
// A que importa mais aqui é `salvar_resumo`. O README afirma que o Jarvis "não
// CONSEGUE inventar fonte" — e essa é uma afirmação sobre CÓDIGO, não sobre o
// prompt. Se ela for falsa, o produto inteiro perde o sentido: um resumo com
// citação inventada é pior do que resumo nenhum, porque parece confiável.
//
// Como o teste alcança isso sem rede: o `fetch` global é dublado com XML de
// verdade do PubMed, então `porPmid` roda inteiro — inclusive o parse. O que é
// falso aqui é só o banco.

import test from "node:test";
import assert from "node:assert/strict";
import { criarFerramentas } from "./ferramentas.ts";

// ---------------------------------------------------------------------------
// Banco de mentira
//
// Imita só as cadeias de chamada que as ferramentas usam de fato. Não é um
// Supabase: é o suficiente para as ferramentas rodarem e para se poder olhar
// o que elas tentaram gravar.
// ---------------------------------------------------------------------------
function bancoFalso(inicial = {}) {
  const tabelas = { objetivos: [], memorias: [], resumos: [], ...inicial };
  const gravacoes = [];

  function consulta(nome) {
    let linhas = [...(tabelas[nome] ?? [])];
    const alvo = {
      select: () => alvo,
      eq: (campo, valor) => {
        linhas = linhas.filter((l) => l[campo] === valor);
        return alvo;
      },
      maybeSingle: async () => ({ data: linhas[0] ?? null, error: null }),
      single: async () => ({ data: linhas[0] ?? null, error: linhas[0] ? null : { message: "sem linhas" } }),
      then: (ok) => ok({ data: linhas, error: null }),

      delete: () => {
        const apagar = { ...alvo };
        apagar.eq = (campo, valor) => {
          tabelas[nome] = (tabelas[nome] ?? []).filter((l) => l[campo] !== valor);
          gravacoes.push({ op: "delete", tabela: nome, campo, valor });
          return { then: (ok) => ok({ error: null }) };
        };
        return apagar;
      },

      insert: (dados) => {
        const novas = Array.isArray(dados) ? dados : [dados];
        const comId = novas.map((l, i) => ({ id: `id-${nome}-${(tabelas[nome]?.length ?? 0) + i}`, ...l }));
        tabelas[nome] = [...(tabelas[nome] ?? []), ...comId];
        gravacoes.push({ op: "insert", tabela: nome, linhas: comId });
        const depois = {
          select: () => depois,
          single: async () => ({ data: comId[0], error: null }),
          maybeSingle: async () => ({ data: comId[0], error: null }),
          then: (ok) => ok({ data: comId, error: null })
        };
        return depois;
      },

      update: (campos) => {
        const atualizar = {
          _filtros: {},
          eq(campo, valor) {
            this._filtros[campo] = valor;
            return this;
          },
          select() {
            return this;
          },
          async maybeSingle() {
            const casam = (tabelas[nome] ?? []).filter((l) =>
              Object.entries(this._filtros).every(([c, v]) => l[c] === v)
            );
            casam.forEach((l) => Object.assign(l, campos));
            gravacoes.push({ op: "update", tabela: nome, campos, filtros: this._filtros });
            return { data: casam[0] ?? null, error: null };
          }
        };
        return atualizar;
      },

      upsert: (linha) => {
        const jaTem = (tabelas[nome] ?? []).some(
          (l) => l.usuario_id === linha.usuario_id && l.fato === linha.fato
        );
        if (!jaTem) tabelas[nome] = [...(tabelas[nome] ?? []), linha];
        gravacoes.push({ op: "upsert", tabela: nome, linha, duplicata: jaTem });
        return { then: (ok) => ok({ error: null }) };
      }
    };
    return alvo;
  }

  return { from: consulta, _tabelas: tabelas, _gravacoes: gravacoes };
}

// ---------------------------------------------------------------------------
// PubMed de mentira, no nível do fetch — o parse do XML roda de verdade.
// ---------------------------------------------------------------------------
function xmlDe(pmids) {
  const artigos = pmids
    .map(
      (p) => `<PubmedArticle><MedlineCitation><PMID>${p}</PMID><Article>
        <Journal><ISOAbbreviation>Lancet</ISOAbbreviation>
          <JournalIssue><PubDate><Year>2021</Year></PubDate></JournalIssue></Journal>
        <ArticleTitle>Artigo real ${p}</ArticleTitle>
        <Abstract><AbstractText>Resumo do artigo ${p}.</AbstractText></Abstract>
        <AuthorList><Author><LastName>Silva</LastName><Initials>A</Initials></Author></AuthorList>
        <PublicationTypeList><PublicationType>Review</PublicationType></PublicationTypeList>
      </Article></MedlineCitation></PubmedArticle>`
    )
    .join("");
  return `<?xml version="1.0"?><PubmedArticleSet>${artigos}</PubmedArticleSet>`;
}

/** `existentes` decide quais PMIDs o PubMed reconhece. O resto simplesmente não volta. */
function dublarPubmed(existentes) {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const endereco = String(url);

    if (endereco.includes("efetch")) {
      const pedidos = new URL(endereco).searchParams.get("id")?.split(",") ?? [];
      const reais = pedidos.filter((p) => existentes.includes(p));
      return new Response(xmlDe(reais), { headers: { "Content-Type": "application/xml" } });
    }

    if (endereco.includes("esearch")) {
      return new Response(
        JSON.stringify({ esearchresult: { idlist: existentes, count: String(existentes.length) } }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    throw new Error(`endpoint inesperado: ${endereco}`);
  };
  return () => {
    globalThis.fetch = original;
  };
}

const CTX = (supabase) => ({ supabase, usuarioId: "usuario-1", spId: "sp-1" });
const pegar = (fs, nome) => fs.find((f) => f.nome === nome);

// ===========================================================================
// salvar_resumo — a trava
// ===========================================================================

test("salva o resumo quando toda citação tem fonte real", async () => {
  const restaurar = dublarPubmed(["31234567", "29876543"]);
  const banco = bancoFalso();
  try {
    const r = await pegar(criarFerramentas(CTX(banco)), "salvar_resumo").executar({
      titulo: "Dor torácica",
      corpo: "A troponina sobe em 3h [@31234567]. O escore HEART ajuda [@29876543].",
      pmids: ["31234567", "29876543"]
    });

    assert.ok(!r.erro, "não deveria recusar");
    assert.match(r.paraTela, /Resumo salvo/);
    assert.equal(banco._tabelas.resumos.length, 1);
    assert.equal(banco._tabelas.resumos[0].referencias.length, 2);
    // As referências guardadas vêm do PubMed, não do que o modelo digitou.
    assert.equal(banco._tabelas.resumos[0].referencias[0].titulo, "Artigo real 31234567");
  } finally {
    restaurar();
  }
});

test("RECUSA o resumo com PMID que o PubMed não reconhece", async () => {
  // O cenário que a trava existe para pegar: o modelo cita um identificador
  // que parece um PMID, e até o declara em `pmids` — mas ele não existe.
  const restaurar = dublarPubmed(["31234567"]);
  const banco = bancoFalso();
  try {
    const r = await pegar(criarFerramentas(CTX(banco)), "salvar_resumo").executar({
      titulo: "Dor torácica",
      corpo: "Fato verdadeiro [@31234567]. Fato inventado [@99999999].",
      pmids: ["31234567", "99999999"]
    });

    assert.equal(r.erro, true);
    assert.equal(banco._tabelas.resumos.length, 0, "nada pode ser gravado");
    assert.match(r.paraModelo, /NÃO foi salvo/);
    assert.match(r.paraModelo, /99999999/);
    // O modelo precisa saber que o PubMed não reconhece o número — senão ele
    // tenta de novo com o mesmo PMID.
    assert.match(r.paraModelo, /não existem|não reconhece/);
  } finally {
    restaurar();
  }
});

test("RECUSA quando o corpo cita um PMID que nem foi declarado", async () => {
  const restaurar = dublarPubmed(["31234567"]);
  const banco = bancoFalso();
  try {
    const r = await pegar(criarFerramentas(CTX(banco)), "salvar_resumo").executar({
      titulo: "t",
      corpo: "Citação surgida do nada [@12121212].",
      pmids: ["31234567"]
    });

    assert.equal(r.erro, true);
    assert.equal(banco._tabelas.resumos.length, 0);
    assert.match(r.paraModelo, /nem estavam na lista/);
  } finally {
    restaurar();
  }
});

test("resumo sem citação nenhuma é aceito", async () => {
  // Nem todo resumo precisa de fonte: fisiologia de livro-texto não precisa.
  // Exigir citação sempre empurraria o modelo a inventar uma.
  const restaurar = dublarPubmed([]);
  const banco = bancoFalso();
  try {
    const r = await pegar(criarFerramentas(CTX(banco)), "salvar_resumo").executar({
      titulo: "Anatomia do coração",
      corpo: "# Câmaras\nO ventrículo esquerdo bombeia para a aorta.",
      pmids: []
    });
    assert.ok(!r.erro);
    assert.equal(banco._tabelas.resumos.length, 1);
  } finally {
    restaurar();
  }
});

test("resumo sem título ou sem corpo é recusado antes de qualquer rede", async () => {
  const banco = bancoFalso();
  const f = pegar(criarFerramentas(CTX(banco)), "salvar_resumo");
  assert.equal((await f.executar({ titulo: "", corpo: "x" })).erro, true);
  assert.equal((await f.executar({ titulo: "x", corpo: "" })).erro, true);
  assert.equal(banco._tabelas.resumos.length, 0);
});

// ===========================================================================
// definir_objetivos
// ===========================================================================

test("redefinir objetivos preserva o que já estava concluído", async () => {
  // Sem isto, acrescentar um objetivo à lista desmarcaria tudo que o aluno já
  // tinha fechado — e ele perderia o progresso sem entender por quê.
  const banco = bancoFalso({
    objetivos: [
      { id: "o1", sp_id: "sp-1", ordem: 1, texto: "Fisiopatologia", concluido: true },
      { id: "o2", sp_id: "sp-1", ordem: 2, texto: "Diagnóstico", concluido: false }
    ]
  });

  const r = await pegar(criarFerramentas(CTX(banco)), "definir_objetivos").executar({
    objetivos: ["Fisiopatologia", "Diagnóstico", "Tratamento"]
  });

  assert.ok(!r.erro);
  const salvos = banco._tabelas.objetivos;
  assert.equal(salvos.length, 3);
  assert.equal(salvos.find((o) => o.texto === "Fisiopatologia").concluido, true, "continua concluído");
  assert.equal(salvos.find((o) => o.texto === "Diagnóstico").concluido, false);
  assert.equal(salvos.find((o) => o.texto === "Tratamento").concluido, false);
  assert.deepEqual(salvos.map((o) => o.ordem), [1, 2, 3]);
});

test("lista de objetivos vazia é recusada", async () => {
  const banco = bancoFalso();
  const r = await pegar(criarFerramentas(CTX(banco)), "definir_objetivos").executar({ objetivos: [] });
  assert.equal(r.erro, true);
});

// ===========================================================================
// buscar_pubmed e ler_artigo
// ===========================================================================

test("busca sem resultado avisa o modelo de que o vazio é REAL", async () => {
  const restaurar = dublarPubmed([]);
  try {
    const r = await pegar(criarFerramentas(CTX(bancoFalso())), "buscar_pubmed").executar({
      consulta: "assunto que nao existe"
    });
    // Se o modelo achar que a ferramenta falhou, ele preenche a lacuna com o
    // que "acha" que a literatura diz. A mensagem existe para impedir isso.
    assert.match(r.paraModelo, /resultado verdadeiro, não uma falha/);
  } finally {
    restaurar();
  }
});

test("ler_artigo com PMID inexistente manda o modelo NÃO citar", async () => {
  const restaurar = dublarPubmed(["31234567"]);
  try {
    const r = await pegar(criarFerramentas(CTX(bancoFalso())), "ler_artigo").executar({
      pmid: "99999999"
    });
    assert.equal(r.erro, true);
    assert.match(r.paraModelo, /NÃO cite este PMID/);
  } finally {
    restaurar();
  }
});

// ===========================================================================
// anotar_memoria
// ===========================================================================

test("memória repetida não duplica", async () => {
  const banco = bancoFalso();
  const f = pegar(criarFerramentas(CTX(banco)), "anotar_memoria");
  await f.executar({ fato: "Está no 4º período." });
  await f.executar({ fato: "Está no 4º período." });
  assert.equal(banco._tabelas.memorias.length, 1);
});
