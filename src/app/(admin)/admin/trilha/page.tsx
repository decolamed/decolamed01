import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { TrilhaManager } from "./trilha-manager";
import { PAGINAS_INTERNAS, type ItemCatalogo } from "@/lib/trilha/catalogo";
import { resolverDias } from "@/lib/trilha/resolver";
import type { TrilhaDia, ConteudoBiblioteca, LinkExterno, Simulado } from "@/types/database";

export default async function AdminTrilhaPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [
    { data: dias },
    { data: conteudos },
    { data: links },
    { data: simulados },
    { data: atividades },
    { data: materiasData },
    { data: questoesData },
    { data: flashcardsData }
  ] = await Promise.all([
    supabase.from("trilha_dias").select("*").order("dia_numero"),
    supabase.from("conteudos_biblioteca").select("*").eq("ativo", true).order("titulo"),
    supabase.from("links_externos").select("*").eq("ativo", true).order("titulo"),
    supabase.from("simulados").select("*").eq("ativo", true).order("titulo"),
    supabase.from("atividades").select("id, titulo, materia, descricao").eq("ativo", true).order("titulo"),
    supabase.from("materias_peso").select("materia").order("materia"),
    supabase.from("questoes").select("materia").eq("ativo", true),
    supabase.from("flashcards").select("materia").eq("ativo", true)
  ]);

  const todosConteudos = (conteudos as ConteudoBiblioteca[]) ?? [];

  // Quantas questões/flashcards já existem por matéria — mostrado junto do
  // resultado da busca pra o admin saber, na hora de anexar, se realmente tem
  // conteúdo cadastrado naquela matéria antes de montar a missão do dia.
  const contarPorMateria = (linhas: { materia: string }[] | null) => {
    const mapa = new Map<string, number>();
    (linhas ?? []).forEach((l) => mapa.set(l.materia, (mapa.get(l.materia) ?? 0) + 1));
    return mapa;
  };
  const questoesPorMateria = contarPorMateria(questoesData);
  const flashcardsPorMateria = contarPorMateria(flashcardsData);

  // ---- Catálogo unificado ---------------------------------------------------
  // Uma lista só, de todas as fontes, para a busca do "Adicionar conteúdo".
  // Montada aqui (servidor) e enviada pronta: o volume é da ordem de centenas
  // de itens, então buscar no cliente é instantâneo e evita um ida-e-volta ao
  // servidor a cada tecla digitada.
  const catalogo: ItemCatalogo[] = [];

  todosConteudos.forEach((c) => {
    // "Bagagem Essencial" é como o aluno vê os materiais de leitura (PDFs e
    // resumos de livro), então o rótulo da busca precisa falar essa língua —
    // o admin procura pelo nome que aparece no app, não pelo nome da coluna.
    const ehAula = c.tipo === "aula" || c.tipo === "video_externo";
    const tipo = ehAula ? ("aula" as const) : ("pdf" as const);
    const bagagem = c.tipo === "resumo_livro" || c.tipo === "pdf";
    catalogo.push({
      chave: `${tipo}:${c.id}`,
      tipo,
      titulo: c.titulo,
      materia: c.materia,
      detalhe: [c.assunto, c.descricao, bagagem ? "Bagagem Essencial" : null].filter(Boolean).join(" · ") || null,
      ref_id: c.id,
      url: c.url,
      nota: c.duracao_minutos > 0 ? `${c.duracao_minutos} min` : null
    });
  });

  ((links as LinkExterno[]) ?? []).forEach((l) => {
    catalogo.push({
      chave: `link:${l.id}`,
      tipo: "link",
      titulo: l.titulo,
      materia: null,
      detalhe: l.url,
      ref_id: l.id,
      url: l.url,
      nota: null
    });
  });

  ((simulados as Simulado[]) ?? []).forEach((s) => {
    catalogo.push({
      chave: `simulado:${s.id}`,
      tipo: "simulado",
      titulo: s.titulo,
      materia: null,
      detalhe: s.descricao ?? null,
      ref_id: s.id,
      url: null,
      nota: null
    });
  });

  ((atividades as { id: string; titulo: string; materia: string | null; descricao: string | null }[]) ?? []).forEach((a) => {
    catalogo.push({
      chave: `atividade:${a.id}`,
      tipo: "atividade",
      titulo: a.titulo,
      materia: a.materia,
      detalhe: a.descricao,
      ref_id: a.id,
      url: null,
      nota: null
    });
  });

  // Questões e flashcards não são itens individuais no cronograma: o aluno
  // recebe "praticar questões de Biologia". Só entram no catálogo as matérias
  // que TÊM conteúdo — anexar uma matéria vazia produziria exatamente a tela
  // de "Não há flashcards disponíveis" que a Alteração 2 mandou eliminar.
  questoesPorMateria.forEach((qtd, materia) => {
    catalogo.push({
      chave: `questoes:${materia}`,
      tipo: "questoes",
      titulo: `Praticar questões de ${materia}`,
      materia,
      detalhe: "banco de questões",
      ref_id: null,
      url: null,
      nota: `${qtd} ${qtd === 1 ? "questão" : "questões"}`
    });
  });
  flashcardsPorMateria.forEach((qtd, materia) => {
    catalogo.push({
      chave: `flashcards:${materia}`,
      tipo: "flashcards",
      titulo: `Revisar flashcards de ${materia}`,
      materia,
      detalhe: "revisão espaçada",
      ref_id: null,
      url: null,
      nota: `${qtd} ${qtd === 1 ? "card" : "cards"}`
    });
  });

  PAGINAS_INTERNAS.forEach((p) => {
    catalogo.push({
      chave: `pagina:${p.rota}`,
      tipo: "pagina",
      titulo: p.titulo,
      materia: null,
      detalhe: p.detalhe,
      ref_id: null,
      url: p.rota,
      nota: "página do app"
    });
  });

  // ---- Itens apontando para conteúdo que não existe ------------------------
  // A Alteração 2 pede que o aluno nunca abra uma atividade vazia. O Copiloto
  // já respeita isso ao gerar missões, mas os itens FIXOS cadastrados pelo
  // admin não tinham nenhuma verificação: depois da limpeza do banco de
  // questões, 36 itens de "questões" continuaram no cronograma apontando para
  // um banco com zero questões. O aluno vê "ainda não há questões" — não
  // quebra, mas é uma missão que não leva a lugar nenhum, e o admin não tinha
  // como saber disso sem abrir os 40 dias um a um.
  const materiasComQuestoes = new Set(questoesPorMateria.keys());
  const materiasComFlashcards = new Set(flashcardsPorMateria.keys());
  const idsSimulados = new Set(((simulados as Simulado[]) ?? []).map((x) => x.id));
  const idsConteudos = new Set(todosConteudos.map((c) => c.id));

  const itensSemConteudo: { dia: number; titulo: string; motivo: string }[] = [];
  ((dias as TrilhaDia[]) ?? []).forEach((d) => {
    (d.itens ?? []).forEach((item) => {
      const falta =
        item.tipo === "questoes" && !materiasComQuestoes.has(item.materia ?? "")
          ? `nenhuma questão cadastrada${item.materia ? ` em ${item.materia}` : ""}`
          : item.tipo === "flashcards" && !materiasComFlashcards.has(item.materia ?? "")
          ? `nenhum flashcard cadastrado${item.materia ? ` em ${item.materia}` : ""}`
          : item.tipo === "simulado" && item.ref_id && !idsSimulados.has(item.ref_id)
          ? "o simulado não existe mais"
          : (item.tipo === "aula" || item.tipo === "pdf") && item.ref_id && !idsConteudos.has(item.ref_id)
          ? "o conteúdo foi excluído ou desativado"
          : null;
      if (falta) itensSemConteudo.push({ dia: d.dia_numero, titulo: item.titulo, motivo: falta });
    });
  });

  // Os dias mostram o título/URL atuais da biblioteca — assim o editor não
  // exibe o nome antigo de uma aula que já foi corrigida em Cursos e Aulas.
  const fonteConteudos = new Map(
    todosConteudos.map((c) => [c.id, { id: c.id, titulo: c.titulo, url: c.url, materia: c.materia, ativo: c.ativo }])
  );

  return (
    <TrilhaManager
      dias={resolverDias((dias as TrilhaDia[]) ?? [], fonteConteudos)}
      catalogo={catalogo}
      materias={(materiasData ?? []).map((m: any) => m.materia)}
      itensSemConteudo={itensSemConteudo}
    />
  );
}
