import { chaveMateria, mesmaMateria } from "@/lib/site/materia-canonica";
import { chaveSessaoExtra } from "@/lib/trilha/sessao-questoes";
import { planejarQuestoesExtras, type MateriaComQuestoes } from "@/lib/trilha/questoes-extras";
import type { ContextoDoAluno } from "@/lib/trilha/prioridade";
import type { Rota } from "@/lib/trilha/rota";
import type { TrilhaItem } from "@/types/database";

// ============================================================================
// A camada de questões extras, ligada ao banco.
//
// A decisão (quais dias, qual matéria) é pura e mora em `questoes-extras.ts`.
// Aqui só existe leitura de banco e a costura com a rota já pronta:
//
//   1. quantas questões inéditas cada matéria ainda tem PARA ESTE ALUNO;
//   2. quais blocos ele já abriu — esses não podem mudar de matéria;
//   3. anexar o item ao dia, sem somar minutos.
//
// A rota é regerada a cada leitura de tela. Por isso o passo 2 existe: sem
// ele, um bloco já respondido trocaria de matéria sozinho assim que o
// desempenho do aluno mudasse a prioridade das matérias.
// ============================================================================

type ClienteSupabase = { from: (tabela: string) => any };

/**
 * Acrescenta os blocos de questões extras aos dias da rota, no lugar.
 *
 * Nunca lança: a rota vale mesmo que esta camada falhe. Ela é complementar
 * por definição, e derrubar a tela do cronograma por causa dela seria trocar
 * um problema pequeno por um grande.
 */
export async function aplicarQuestoesExtras(
  supabase: ClienteSupabase,
  alunoId: string,
  rota: Rota,
  contexto: ContextoDoAluno
): Promise<void> {
  try {
    const [{ data: questoes }, { data: sessoes }] = await Promise.all([
      supabase.from("questoes").select("id, materia").eq("ativo", true),
      supabase.from("aluno_sessao_questoes").select("chave, materia, questao_ids").eq("aluno_id", alunoId)
    ]);

    const linhasSessao = ((sessoes as { chave: string; materia: string; questao_ids: string[] }[]) ?? []);

    // Tudo que este aluno já recebeu em qualquer atividade. É a mesma conta
    // que `carregarOuCriarSessao` faz na hora de sortear — replicada aqui
    // para o PLANO não prometer um bloco de uma matéria que já acabou para
    // ele. Sem isso o bloco nasceria e abriria vazio.
    const jaUsadas = new Set(linhasSessao.flatMap((s) => s.questao_ids ?? []));

    const porMateria = new Map<string, { materia: string; ineditas: number }>();
    (((questoes as { id: string; materia: string }[]) ?? [])).forEach((q) => {
      if (jaUsadas.has(q.id)) return;
      const chave = chaveMateria(q.materia);
      const atual = porMateria.get(chave);
      if (atual) atual.ineditas += 1;
      else porMateria.set(chave, { materia: q.materia, ineditas: 1 });
    });

    // Blocos já abertos: a matéria está gravada na sessão e manda.
    const congelados: Record<number, string> = {};
    linhasSessao.forEach((s) => {
      const m = /^extra:(\d+)$/.exec(s.chave ?? "");
      if (m && s.materia) congelados[Number(m[1])] = s.materia;
    });

    const disponiveis: MateriaComQuestoes[] = [...porMateria.values()];

    const blocos = planejarQuestoesExtras({
      dias: rota.dias.map((d) => ({ routeDay: d.routeDay, tipo: d.tipo, scheduledDate: d.scheduledDate })),
      contexto,
      disponiveis,
      congelados
    });

    const porDia = new Map(blocos.map((b) => [b.routeDay, b]));
    rota.dias.forEach((dia) => {
      const bloco = porDia.get(dia.routeDay);
      if (!bloco) return;
      // Um dia que já traga um item de questões DA MESMA MATÉRIA vindo do
      // cronograma principal não recebe o bloco: duas atividades iguais no
      // mesmo dia é ruído, não acompanhamento.
      const jaTemDaMateria = (dia.itens ?? []).some(
        (i) => i.tipo === "questoes" && !i.extra && mesmaMateria(i.materia, bloco.materia)
      );
      if (jaTemDaMateria) return;

      dia.itens = [...(dia.itens ?? []), itemExtra(bloco.materia, bloco.quantidade)];
      // `dia.minutos` NÃO é alterado de propósito: o bloco é complementar e
      // não pode fazer o algoritmo achar que o dia ficou mais cheio.
    });
  } catch (erro) {
    console.error("Questões extras: falha ao montar a camada complementar:", erro);
  }
}

function itemExtra(materia: string, quantidade: number): TrilhaItem {
  return {
    tipo: "questoes",
    // O título carrega a quantidade porque é dele que `quantidadeDoItem` lê
    // quantas questões a sessão deve sortear (ver sessao-questoes.ts).
    titulo: `${quantidade} questões extras de ${materia}`,
    materia,
    ref_id: null,
    url: null,
    extra: true
  };
}

/** A chave de sessão do bloco extra de um dia. Reexportada por conveniência. */
export { chaveSessaoExtra };
