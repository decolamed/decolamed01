import { notFound } from "next/navigation";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { alunoTemCopiloto } from "@/lib/copiloto/permissao";
import { hojeISO } from "@/lib/site/data";
import { resolverCronograma } from "@/lib/trilha/resolver";
import { cronogramaDeTela } from "@/lib/trilha/rota";
import { rotaDoAluno } from "@/lib/trilha/rota-persistencia";
import { lerChaveSessao, quantidadeDoItem, QUESTOES_POR_SESSAO } from "@/lib/trilha/sessao-questoes";
import { carregarOuCriarSessao } from "@/lib/trilha/sessao-questoes-servidor";
import { PaginaAluno } from "@/components/aluno/pagina-aluno";
import { SessaoQuestoesRunner } from "@/components/aluno/sessao-questoes-runner";
import type { TrilhaDia, TrilhaItem } from "@/types/database";

// A sessão é criada na primeira abertura e lida do banco nas seguintes —
// nunca de cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// ATIVIDADE DIÁRIA — "5 questões de Biologia"
//
// Esta rota existe porque a atividade não tinha rota própria: o item do
// cronograma apontava para `/aluno/questoes?materia=Biologia`, o Banco de
// Questões filtrado. O aluno recebia o acervo inteiro da matéria, e a cada
// carregamento um sorteio diferente.
//
// Aqui a atividade é resolvida a partir da chave, tem as suas questões
// escolhidas uma única vez e gravadas, e termina na última delas.
// ============================================================================

export default async function SessaoDeQuestoesPage({ params }: { params: { chave: string } }) {
  const profile = await requireAcessoAluno();
  const chave = decodeURIComponent(params.chave);
  const lida = lerChaveSessao(chave);
  if (!lida) notFound();

  const supabase = createClient();

  // Matéria e quantidade vêm do ITEM, resolvido no servidor. Não viajam pela
  // URL de propósito: se viessem, bastaria trocar o parâmetro para pedir 500
  // questões e a atividade voltaria a ser o banco inteiro.
  let materia: string | null = null;
  let quantidade = QUESTOES_POR_SESSAO;
  let titulo = "Atividade";

  if (lida.tipo === "trilha") {
    const item = await itemDoCronograma(profile.id, lida.dia, lida.indice);
    if (!item || item.tipo !== "questoes") notFound();
    materia = item.materia ?? null;
    quantidade = quantidadeDoItem(item.titulo);
    titulo = item.titulo || "Atividade";
  } else if (lida.tipo === "extra") {
    // Bloco de questões extras do dia. Não tem índice: é procurado pela
    // marca `extra` dentro do dia, porque a posição dele muda conforme o
    // algoritmo escolhe mais ou menos itens principais.
    const item = await blocoExtraDoDia(profile.id, lida.dia);
    if (!item) notFound();
    materia = item.materia ?? null;
    quantidade = quantidadeDoItem(item.titulo);
    titulo = item.titulo || "Questões extras";
  } else {
    const { data: missao } = await supabase
      .from("aluno_missoes")
      .select("titulo, materia, tipo")
      .eq("id", lida.id)
      .eq("aluno_id", profile.id)
      .maybeSingle();
    if (!missao || missao.tipo !== "questoes") notFound();
    materia = (missao.materia as string | null) ?? null;
    quantidade = quantidadeDoItem(missao.titulo as string);
    titulo = (missao.titulo as string) || "Atividade";
  }

  if (!materia) notFound();

  const sessao = await carregarOuCriarSessao({
    alunoId: profile.id,
    chave,
    materia,
    quantidade
  });

  return (
    <PaginaAluno
      titulo={titulo}
      descricao={`Sessão de ${sessao.quantidadePedida} ${
        sessao.quantidadePedida === 1 ? "questão" : "questões"
      } de ${sessao.materia}. Ao terminar, a atividade é marcada como concluída.`}
      voltarPara="/aluno"
      rotuloVoltar="Voltar ao painel"
    >
      <SessaoQuestoesRunner
        questoes={sessao.questoes}
        chave={chave}
        materia={sessao.materia}
        quantidadePedida={sessao.quantidadePedida}
        voltarPara="/aluno"
      />
    </PaginaAluno>
  );
}

/**
 * Encontra o item pelo dia e índice, usando exatamente o cronograma que o
 * aluno enxerga: a rota personalizada no Voo Guiado, o template linear no
 * Decolando. É a mesma resolução do painel e da tela de cronograma, então a
 * chave `trilha:<dia>:<índice>` aponta sempre para o mesmo item nas três.
 */
async function itemDoCronograma(alunoId: string, dia: number, indice: number): Promise<TrilhaItem | null> {
  const dias = await diasDoAluno(alunoId);
  const doDia = dias.find((d) => d.dia_numero === dia);
  return doDia?.itens?.[indice] ?? null;
}

/** O bloco de questões extras daquele dia, se a camada tiver posto um lá. */
async function blocoExtraDoDia(alunoId: string, dia: number): Promise<TrilhaItem | null> {
  const dias = await diasDoAluno(alunoId);
  const doDia = dias.find((d) => d.dia_numero === dia);
  return (doDia?.itens ?? []).find((i) => i.extra && i.tipo === "questoes") ?? null;
}

async function diasDoAluno(alunoId: string): Promise<TrilhaDia[]> {
  const supabase = createClient();
  const hoje = hojeISO();

  const [temCopiloto, { data: trilha }, { data: briefing }] = await Promise.all([
    alunoTemCopiloto(alunoId),
    supabase.from("trilha_dias").select("*").order("dia_numero"),
    supabase
      .from("aluno_briefing")
      .select("data_prova, inicio_estudos, dias_estuda, horas_por_dia_semana")
      .eq("aluno_id", alunoId)
      .maybeSingle()
  ]);

  const template = await resolverCronograma((trilha as TrilhaDia[]) ?? []);

  const rota = await rotaDoAluno(supabase, alunoId, {
    temCopiloto,
    briefing: briefing as Parameters<typeof rotaDoAluno>[2]["briefing"],
    template,
    hoje
  });

  return rota ? (cronogramaDeTela(rota) as TrilhaDia[]) : template;
}
