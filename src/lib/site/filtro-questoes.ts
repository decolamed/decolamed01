import { normalizar } from "@/lib/trilha/catalogo";

// ============================================================================
// FILTRO DE QUESTÕES (Alteração 4.5)
//
// Montar um simulado exigia rolar o banco inteiro agrupado por matéria. Com
// milhares de questões isso é inviável, e não havia como pedir "só FACAPE
// 2025.1" ou "Biologia + Citologia" — exatamente os recortes que o admin usa
// para montar uma prova.
//
// Puro e compartilhado: Atividades e Simulados fazem a mesma seleção, e
// duplicar a regra em duas telas garantiria que uma ficasse para trás.
// ============================================================================

export interface QuestaoFiltravel {
  id: string;
  materia: string;
  assunto: string | null;
  enunciado: string;
  prova_nome?: string | null;
  ano?: number | null;
  semestre?: number | null;
  modalidade?: string | null;
  numero_questao?: number | null;
  anulada?: boolean | null;
}

export interface FiltrosQuestao {
  busca: string;
  materia: string;
  assunto: string;
  prova: string;
  ano: string;
  modalidade: string;
}

export const FILTROS_VAZIOS: FiltrosQuestao = {
  busca: "",
  materia: "",
  assunto: "",
  prova: "",
  ano: "",
  modalidade: ""
};

/**
 * O banco guarda a modalidade em código ("ampla"/"peba"), que é o que o CHECK
 * da tabela aceita. Quem lê a tela quer o nome por extenso.
 */
export const ROTULO_MODALIDADE: Record<string, string> = {
  ampla: "Ampla Concorrência",
  peba: "Rede PEBA"
};

export function rotuloModalidade(modalidade: string | null | undefined): string | null {
  const m = modalidade?.trim();
  if (!m) return null;
  return ROTULO_MODALIDADE[m] ?? m;
}

/** Rótulo da prova de origem: "FACAPE 2026.1 — Ampla Concorrência". */
export function rotuloProva(q: QuestaoFiltravel): string | null {
  const nome = q.prova_nome?.trim();
  if (!nome && !q.ano) return null;
  const edicao = q.ano ? `${q.ano}${q.semestre ? "." + q.semestre : ""}` : "";
  const base = [nome, edicao].filter(Boolean).join(" ");
  const mod = rotuloModalidade(q.modalidade);
  return mod ? `${base} — ${mod}` : base || null;
}

/**
 * Aplica todos os filtros. Combináveis por construção: cada um é uma condição
 * independente, então "Biologia + Citologia + 2025" funciona sem nenhum caso
 * especial.
 */
export function filtrarQuestoes<T extends QuestaoFiltravel>(questoes: T[], f: FiltrosQuestao): T[] {
  const termos = normalizar(f.busca).split(/\s+/).filter(Boolean);

  return questoes.filter((q) => {
    if (f.materia && q.materia !== f.materia) return false;
    if (f.assunto && (q.assunto ?? "") !== f.assunto) return false;
    if (f.prova && (q.prova_nome ?? "") !== f.prova) return false;
    if (f.ano && String(q.ano ?? "") !== f.ano) return false;
    if (f.modalidade && (q.modalidade ?? "") !== f.modalidade) return false;
    if (termos.length === 0) return true;

    // A busca cobre enunciado, ID e número da questão: procurar pelo trecho do
    // texto e procurar por "questão 42" são dois jeitos igualmente naturais de
    // achar uma questão específica.
    const alvo = normalizar(
      [q.enunciado, q.materia, q.assunto ?? "", q.id, String(q.numero_questao ?? ""), rotuloProva(q) ?? ""].join(" ")
    );
    return termos.every((t) => alvo.includes(t));
  });
}

/** Opções de cada filtro, derivadas do próprio banco — nada fixo no código. */
export function opcoesDeFiltro(questoes: QuestaoFiltravel[]) {
  const unicos = (vals: (string | null | undefined)[]) =>
    Array.from(new Set(vals.filter((v): v is string => !!v && v.trim() !== ""))).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  return {
    materias: unicos(questoes.map((q) => q.materia)),
    assuntos: unicos(questoes.map((q) => q.assunto)),
    provas: unicos(questoes.map((q) => q.prova_nome)),
    modalidades: unicos(questoes.map((q) => q.modalidade)),
    // Ano decrescente: quem monta prova procura primeiro pelo mais recente.
    anos: Array.from(new Set(questoes.map((q) => q.ano).filter((a): a is number => !!a))).sort((a, b) => b - a)
  };
}

/**
 * Restringe as opções ao que ainda é alcançável com os filtros já aplicados.
 *
 * Sem isso o admin escolhe "Biologia", vê "Citologia" e "Química Orgânica" na
 * lista de assuntos, clica no segundo e recebe zero resultados — um beco sem
 * saída que a interface poderia ter evitado.
 */
export function opcoesCompativeis(questoes: QuestaoFiltravel[], f: FiltrosQuestao) {
  const semAssunto = filtrarQuestoes(questoes, { ...f, assunto: "", busca: "" });
  const semProva = filtrarQuestoes(questoes, { ...f, prova: "", ano: "", modalidade: "", busca: "" });
  return {
    ...opcoesDeFiltro(questoes),
    assuntos: opcoesDeFiltro(semAssunto).assuntos,
    provas: opcoesDeFiltro(semProva).provas,
    anos: opcoesDeFiltro(semProva).anos,
    modalidades: opcoesDeFiltro(semProva).modalidades
  };
}
