import { createClient } from "@/lib/supabase/server";
import { materiaCanonica, mesmaMateria } from "@/lib/site/materia-canonica";
import { selecionarQuestoes, type SelecaoDeQuestoes } from "@/lib/trilha/sessao-questoes";
import type { Questao } from "@/types/database";
import { listaOuVazio } from "@/lib/supabase/resultado";

// ============================================================================
// Carrega — ou cria uma única vez — a sessão de questões de uma atividade.
//
// A parte que decide QUAIS questões entram é pura e vive em
// `sessao-questoes.ts`. Aqui só existe banco: ler o que já foi sorteado,
// sortear na primeira vez, e trazer as questões na ordem gravada.
// ============================================================================

export interface SessaoDeQuestoes {
  chave: string;
  materia: string;
  /** As questões, na ordem gravada. Nunca o banco inteiro. */
  questoes: Questao[];
  /** Quantas o item pedia (normalmente 5). */
  quantidadePedida: number;
  /** Quantas questões da matéria o aluno ainda não tinha visto. */
  ineditasDisponiveis: number;
  /** Havia menos inéditas do que o pedido. */
  incompleta: boolean;
  /** O aluno já usou todas as questões da matéria em atividades anteriores. */
  esgotada: boolean;
}

export async function carregarOuCriarSessao(p: {
  alunoId: string;
  chave: string;
  materia: string;
  quantidade: number;
}): Promise<SessaoDeQuestoes> {
  const supabase = createClient();
  const materia = materiaCanonica(p.materia);

  const { data: existente } = await supabase
    .from("aluno_sessao_questoes")
    .select("materia, questao_ids, quantidade_pedida")
    .eq("aluno_id", p.alunoId)
    .eq("chave", p.chave)
    .maybeSingle();

  if (existente) {
    // Sessão já sorteada: as mesmas questões, na mesma ordem, sempre. É este
    // caminho que faz o aluno voltar em "3/5" e encontrar as suas 5 questões.
    const ids = (existente.questao_ids as string[]) ?? [];
    return {
      chave: p.chave,
      materia: (existente.materia as string) || materia,
      questoes: await buscarNaOrdem(ids),
      quantidadePedida: Number(existente.quantidade_pedida) || p.quantidade,
      ineditasDisponiveis: ids.length,
      incompleta: ids.length < (Number(existente.quantidade_pedida) || p.quantidade),
      esgotada: ids.length === 0
    };
  }

  // ---- Primeira abertura: sorteia e grava ----------------------------------

  // Pool da matéria. A comparação é canônica: uma questão gravada como
  // "Português" entra numa atividade de "Linguagens", e Inglês nunca entra
  // numa de Espanhol.
  const rBanco = await supabase.from("questoes").select("id, materia").eq("ativo", true);
  // Falha aqui deixa o aluno sem questão nenhuma na atividade. Continua sendo
  // vazio na tela, mas agora com motivo no log em vez de "o banco está vazio".
  const doBanco = listaOuVazio(rBanco, "banco de questões da atividade");
  const disponiveis = ((doBanco as { id: string; materia: string }[]) ?? [])
    .filter((q) => mesmaMateria(q.materia, materia))
    .map((q) => q.id)
    // Ordem estável antes do sorteio semeado: sem isto, a ordem que o
    // Postgres devolve poderia mudar o resultado entre execuções.
    .sort();

  // O que ESTE aluno já recebeu em atividades anteriores. O histórico é
  // individual — uma questão usada por outro aluno continua disponível aqui.
  const rAnteriores = await supabase
    .from("aluno_sessao_questoes")
    .select("questao_ids")
    .eq("aluno_id", p.alunoId);
  // Falha aqui não impede a atividade — só faz o sorteio ignorar o histórico e
  // repetir questões que o aluno já viu. Degradação aceitável, silêncio não.
  const anteriores = listaOuVazio(rAnteriores, "histórico de questões do aluno");
  const jaUsadas = ((anteriores as { questao_ids: string[] }[]) ?? []).flatMap((s) => s.questao_ids ?? []);

  const selecao: SelecaoDeQuestoes = selecionarQuestoes({
    disponiveis,
    jaUsadas,
    quantidade: p.quantidade,
    semente: `${p.alunoId}|${p.chave}`
  });

  // Grava antes de mostrar. `onConflict` cobre a corrida de duas abas abrindo
  // a mesma atividade ao mesmo tempo: a segunda encontra a primeira e usa o
  // que já existe, em vez de sobrescrever com outro sorteio.
  const { data: gravada } = await supabase
    .from("aluno_sessao_questoes")
    .upsert(
      {
        aluno_id: p.alunoId,
        chave: p.chave,
        materia,
        questao_ids: selecao.ids,
        quantidade_pedida: selecao.pedidas
      },
      { onConflict: "aluno_id,chave", ignoreDuplicates: true }
    )
    .select("questao_ids")
    .maybeSingle();

  const ids = ((gravada?.questao_ids as string[] | undefined) ?? selecao.ids);

  return {
    chave: p.chave,
    materia,
    questoes: await buscarNaOrdem(ids),
    quantidadePedida: selecao.pedidas,
    ineditasDisponiveis: selecao.ineditasDisponiveis,
    incompleta: selecao.incompleta,
    esgotada: ids.length === 0
  };
}

/** Busca as questões e as devolve na ordem em que a sessão as gravou. */
async function buscarNaOrdem(ids: string[]): Promise<Questao[]> {
  if (ids.length === 0) return [];
  const supabase = createClient();
  const { data } = await supabase.from("questoes").select("*").in("id", ids).eq("ativo", true);

  const porId = new Map((((data as Questao[]) ?? [])).map((q) => [q.id, q]));
  // `.in()` não garante ordem; a ordem da sessão é que vale, porque é ela que
  // faz "Questão 3/5" apontar sempre para a mesma questão.
  return ids.map((id) => porId.get(id)).filter((q): q is Questao => Boolean(q));
}
