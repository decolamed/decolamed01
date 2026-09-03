import { buscar, porPmid } from "@/lib/pubmed/client";
import type { Artigo } from "@/lib/pubmed/tipos";
import { renderizar } from "@/lib/resumo/renderizar";
import type { Referencia } from "@/lib/resumo/tipos";
import type { Ferramenta, ResultadoFerramenta } from "@/lib/ia/tipos";
import type { criarClienteServidor } from "@/lib/supabase/servidor";

type Cliente = ReturnType<typeof criarClienteServidor>;

export interface ContextoDasFerramentas {
  supabase: Cliente;
  usuarioId: string;
  spId: string;
}

// Quanto de cada resumo vai para o modelo na LISTA de resultados. Um resumo
// estruturado do PubMed passa fácil de 2.000 caracteres, e oito deles inteiros
// enchem o contexto de uma vez. O corte é o que torna `ler_artigo` útil: a
// lista serve para escolher, `ler_artigo` serve para se aprofundar.
const CORTE_DO_RESUMO = 900;

function formatarArtigo(a: Artigo, completo = false): string {
  const autores = a.autores.length > 0 ? a.autores.slice(0, 4).join(", ") : "sem autoria listada";
  const maisAutores = a.autores.length > 4 ? ", et al." : "";
  const resumo = a.resumo
    ? completo || a.resumo.length <= CORTE_DO_RESUMO
      ? a.resumo
      : `${a.resumo.slice(0, CORTE_DO_RESUMO)}… [cortado — use ler_artigo com o PMID ${a.pmid} para o resumo inteiro]`
    : "(este artigo não tem resumo público)";

  return [
    `PMID: ${a.pmid}`,
    `Título: ${a.titulo}`,
    `Autores: ${autores}${maisAutores}`,
    `Publicado em: ${a.revista || "revista não informada"}, ${a.ano || "ano não informado"}`,
    a.tipos.length > 0 ? `Tipo de estudo: ${a.tipos.join(", ")}` : null,
    a.doi ? `DOI: ${a.doi}` : null,
    `Resumo: ${resumo}`
  ]
    .filter(Boolean)
    .join("\n");
}

function comoReferencia(a: Artigo): Referencia {
  return {
    pmid: a.pmid,
    titulo: a.titulo,
    autores: a.autores,
    revista: a.revista,
    ano: a.ano,
    doi: a.doi
  };
}

function falha(paraTela: string, paraModelo: string): ResultadoFerramenta {
  return { paraTela, paraModelo, erro: true };
}

export function criarFerramentas(ctx: ContextoDasFerramentas): Ferramenta[] {
  const { supabase, usuarioId, spId } = ctx;

  const buscarPubmed: Ferramenta = {
    nome: "buscar_pubmed",
    descricao:
      "Busca artigos no PubMed. A consulta DEVE estar em inglês e usar vocabulário " +
      "científico (de preferência termos MeSH). Aceita operadores booleanos: " +
      "(heart failure) AND (sacubitril OR valsartan). Devolve título, autores, " +
      "revista, ano, tipo de estudo e o resumo (cortado quando muito longo).",
    esquema: {
      type: "object",
      properties: {
        consulta: {
          type: "string",
          description: "A expressão de busca, em inglês. Ex.: 'acute chest pain AND risk stratification'"
        },
        ultimos_anos: {
          type: "integer",
          description: "Limita aos artigos publicados nos últimos N anos. Use 5 ou 10 para conduta e diretriz."
        },
        apenas_revisoes: {
          type: "boolean",
          description:
            "Quando true, traz só revisão, revisão sistemática, meta-análise e diretriz. " +
            "Prefira true para estudar um tema; false para achar um estudo primário específico."
        },
        quantidade: {
          type: "integer",
          description: "Quantos artigos trazer (1 a 20). O padrão, 8, costuma bastar."
        }
      },
      required: ["consulta"]
    },
    async executar(entrada) {
      const consulta = String(entrada.consulta ?? "").trim();
      if (!consulta) return falha("Busca vazia", "A consulta veio vazia.");

      const resultado = await buscar(consulta, {
        ultimosAnos: typeof entrada.ultimos_anos === "number" ? entrada.ultimos_anos : undefined,
        apenasRevisoes: entrada.apenas_revisoes === true,
        quantidade: typeof entrada.quantidade === "number" ? entrada.quantidade : undefined
      });

      if (resultado.artigos.length === 0) {
        return {
          paraTela: `PubMed: nenhum resultado para "${consulta}"`,
          // O modelo precisa saber que o vazio é REAL, senão ele tende a
          // preencher a lacuna com o que acha que a literatura diz.
          paraModelo:
            `A busca "${resultado.consulta}" não retornou nenhum artigo. ` +
            `Isso é um resultado verdadeiro, não uma falha. Tente outros termos, ` +
            `afrouxe os filtros, ou diga ao aluno que não achou evidência sobre isso.`
        };
      }

      return {
        paraTela: `PubMed: ${resultado.artigos.length} de ${resultado.total} artigos — "${consulta}"`,
        paraModelo: [
          `Busca: ${resultado.consulta}`,
          `${resultado.total} artigos encontrados; os ${resultado.artigos.length} mais relevantes:`,
          "",
          resultado.artigos.map((a) => formatarArtigo(a)).join("\n\n---\n\n")
        ].join("\n")
      };
    }
  };

  const lerArtigo: Ferramenta = {
    nome: "ler_artigo",
    descricao:
      "Traz o registro completo de um artigo do PubMed pelo PMID, com o resumo inteiro " +
      "(sem corte). Use quando um artigo da busca for central para o objetivo em estudo.",
    esquema: {
      type: "object",
      properties: {
        pmid: { type: "string", description: "O PMID, só dígitos. Ex.: '31234567'" }
      },
      required: ["pmid"]
    },
    async executar(entrada) {
      const pmid = String(entrada.pmid ?? "").trim();
      const [artigo] = await porPmid([pmid]);
      if (!artigo) {
        return falha(
          `PubMed: PMID ${pmid} não existe`,
          `Não existe artigo com o PMID ${pmid} no PubMed. NÃO cite este PMID em lugar nenhum.`
        );
      }
      return {
        paraTela: `Leu: ${artigo.titulo.slice(0, 70)}${artigo.titulo.length > 70 ? "…" : ""}`,
        paraModelo: formatarArtigo(artigo, true)
      };
    }
  };

  const definirObjetivos: Ferramenta = {
    nome: "definir_objetivos",
    descricao:
      "Registra os objetivos de aprendizagem desta situação-problema. Use quando o aluno " +
      "disser quais são, ou quando vocês os formularem juntos a partir do enunciado. " +
      "Substitui a lista inteira — para acrescentar um objetivo, mande a lista completa.",
    esquema: {
      type: "object",
      properties: {
        objetivos: {
          type: "array",
          description: "Os objetivos, na ordem, cada um numa frase.",
          items: { type: "string" }
        }
      },
      required: ["objetivos"]
    },
    async executar(entrada) {
      const lista = Array.isArray(entrada.objetivos)
        ? entrada.objetivos.map((o) => String(o).trim()).filter(Boolean)
        : [];
      if (lista.length === 0) return falha("Objetivos vazios", "A lista de objetivos veio vazia.");

      // Substituição em duas etapas: os objetivos concluídos que continuam na
      // lista precisam continuar concluídos. Apagar e reinserir sem isto faria
      // o aluno perder o progresso toda vez que um objetivo fosse acrescentado.
      const { data: anteriores } = await supabase
        .from("objetivos")
        .select("texto, concluido")
        .eq("sp_id", spId);

      const jaConcluidos = new Set(
        (anteriores ?? []).filter((o) => o.concluido).map((o) => o.texto.trim().toLowerCase())
      );

      await supabase.from("objetivos").delete().eq("sp_id", spId);

      const { error } = await supabase.from("objetivos").insert(
        lista.map((texto, i) => ({
          sp_id: spId,
          usuario_id: usuarioId,
          ordem: i + 1,
          texto,
          concluido: jaConcluidos.has(texto.trim().toLowerCase())
        }))
      );

      if (error) return falha("Não consegui salvar os objetivos", `Falha ao salvar: ${error.message}`);

      return {
        paraTela: `${lista.length} objetivo(s) registrado(s)`,
        paraModelo: `Objetivos salvos:\n${lista.map((o, i) => `${i + 1}. ${o}`).join("\n")}`
      };
    }
  };

  const concluirObjetivo: Ferramenta = {
    nome: "concluir_objetivo",
    descricao:
      "Marca um objetivo de aprendizagem como concluído (ou reabre). Use quando o aluno " +
      "demonstrar que entendeu o tema, não só porque vocês falaram dele.",
    esquema: {
      type: "object",
      properties: {
        numero: { type: "integer", description: "O número do objetivo, como aparece na lista." },
        concluido: { type: "boolean", description: "true para concluir, false para reabrir. Padrão: true." }
      },
      required: ["numero"]
    },
    async executar(entrada) {
      const numero = Number(entrada.numero);
      const concluido = entrada.concluido !== false;
      if (!Number.isInteger(numero)) return falha("Número inválido", "O número do objetivo é inválido.");

      const { data, error } = await supabase
        .from("objetivos")
        .update({ concluido })
        .eq("sp_id", spId)
        .eq("ordem", numero)
        .select("texto")
        .maybeSingle();

      if (error) return falha("Não consegui atualizar", `Falha: ${error.message}`);
      if (!data) return falha(`Objetivo ${numero} não existe`, `Não existe objetivo de número ${numero} nesta SP.`);

      return {
        paraTela: `Objetivo ${numero} ${concluido ? "concluído" : "reaberto"}`,
        paraModelo: `Objetivo ${numero} ("${data.texto}") marcado como ${concluido ? "concluído" : "aberto"}.`
      };
    }
  };

  const anotarMemoria: Ferramenta = {
    nome: "anotar_memoria",
    descricao:
      "Guarda um fato DURADOURO sobre o aluno, para você lembrar em conversas futuras — " +
      "período, faculdade, data de prova, dificuldade recorrente, jeito de estudar que " +
      "funciona com ele. NÃO use para conteúdo médico nem para o que já está no resumo: " +
      "isto é memória sobre a PESSOA, não sobre a matéria.",
    esquema: {
      type: "object",
      properties: {
        fato: {
          type: "string",
          description: "O fato, numa frase completa e autossuficiente. Ex.: 'Está no 4º período da UFPE.'"
        }
      },
      required: ["fato"]
    },
    async executar(entrada) {
      const fato = String(entrada.fato ?? "").trim();
      if (!fato) return falha("Memória vazia", "O fato veio vazio.");

      // `upsert` em vez de `insert`: a tabela tem chave única em
      // (usuario_id, fato) justamente para não acumular repetição, e um insert
      // puro devolveria erro de conflito num caso que não é erro nenhum.
      const { error } = await supabase
        .from("memorias")
        .upsert({ usuario_id: usuarioId, fato, origem_sp_id: spId }, { onConflict: "usuario_id,fato" });

      if (error) return falha("Não consegui anotar", `Falha ao anotar: ${error.message}`);
      return { paraTela: `Anotado: ${fato}`, paraModelo: `Anotado na memória: "${fato}"` };
    }
  };

  const salvarResumo: Ferramenta = {
    nome: "salvar_resumo",
    descricao:
      "Salva um resumo formatado desta situação-problema, na pasta dela. Escreva o resumo " +
      "COMPLETO aqui, na marcação descrita no seu prompt. Todo PMID citado no corpo com " +
      "[@PMID] tem que estar na lista `pmids`, e cada PMID é conferido contra o PubMed " +
      "antes de salvar.",
    esquema: {
      type: "object",
      properties: {
        titulo: { type: "string", description: "Título do resumo. Ex.: 'Fisiopatologia da insuficiência cardíaca'" },
        corpo: { type: "string", description: "O resumo inteiro, na marcação do prompt." },
        pmids: {
          type: "array",
          description: "Os PMIDs de todas as fontes citadas no corpo.",
          items: { type: "string" }
        }
      },
      required: ["titulo", "corpo"]
    },
    async executar(entrada) {
      const titulo = String(entrada.titulo ?? "").trim();
      const corpo = String(entrada.corpo ?? "").trim();
      if (!titulo || !corpo) return falha("Resumo incompleto", "Título e corpo são obrigatórios.");

      const pedidos = Array.isArray(entrada.pmids)
        ? [...new Set(entrada.pmids.map((p) => String(p).trim()).filter((p) => /^\d+$/.test(p)))]
        : [];

      // A TRAVA CONTRA FONTE INVENTADA.
      //
      // Cada PMID é resolvido contra o PubMed de verdade. Um PMID que não
      // existe simplesmente não volta daqui — e aí, se ele estiver citado no
      // corpo, vira citação órfã no passo seguinte e o resumo é recusado.
      // O prompt PEDE que o modelo não invente fonte; isto IMPEDE.
      const artigos = pedidos.length > 0 ? await porPmid(pedidos) : [];
      const referencias = artigos.map(comoReferencia);

      const { citacoesOrfas } = renderizar(corpo, referencias);
      if (citacoesOrfas.length > 0) {
        const inexistentes = citacoesOrfas.filter((p) => !pedidos.includes(p));
        return falha(
          `Resumo recusado: ${citacoesOrfas.length} citação(ões) sem fonte`,
          [
            `O resumo NÃO foi salvo.`,
            `Estes PMIDs estão citados no corpo mas não têm fonte válida: ${citacoesOrfas.join(", ")}.`,
            inexistentes.length > 0
              ? `Destes, ${inexistentes.join(", ")} nem estavam na lista \`pmids\`.`
              : `Eles estavam na lista \`pmids\`, mas o PubMed não reconhece esses identificadores — ou seja, esses artigos não existem.`,
            `Corrija: use apenas PMIDs que voltaram de buscar_pubmed ou ler_artigo nesta conversa, ` +
              `ou tire a citação e a afirmação que dependia dela. Depois chame salvar_resumo de novo.`
          ].join(" ")
        );
      }

      const { data, error } = await supabase
        .from("resumos")
        .insert({ sp_id: spId, usuario_id: usuarioId, titulo, corpo, referencias })
        .select("id")
        .single();

      if (error) return falha("Não consegui salvar o resumo", `Falha ao salvar: ${error.message}`);

      return {
        paraTela: `Resumo salvo: ${titulo}`,
        paraModelo:
          `Resumo "${titulo}" salvo com ${referencias.length} fonte(s) (id ${data.id}). ` +
          `Avise o aluno em uma frase e diga o que ainda ficou de fora, se ficou.`
      };
    }
  };

  return [buscarPubmed, lerArtigo, definirObjetivos, concluirObjetivo, anotarMemoria, salvarResumo];
}
