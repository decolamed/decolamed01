// ============================================================================
// QUANDO UMA AULA QUEBRA, QUAL COLOCAR NO LUGAR
//
// O aluno abre a missão do dia e recebe "vídeo indisponível". Não adianta
// avisar: o dia dele já era. A plataforma precisa trocar a aula por outra que
// ensine A MESMA COISA.
//
// A regra tem três exigências, nesta ordem de importância:
//
//   1. MESMO CONTEÚDO. Matéria igual não basta — o cronograma pediu Citologia
//      naquele dia porque o dia seguinte depende dela. Uma aula de Genética
//      "de Biologia" não substitui. Sem assunto compatível, não há troca.
//   2. FUNCIONA. De nada serve trocar um vídeo quebrado por outro quebrado.
//      Só entra candidato já verificado.
//   3. OUTRO PROFESSOR, de preferência. Se a aula do professor X quebrou,
//      provavelmente o canal dele saiu do ar ou removeu o vídeo — a aula
//      seguinte do mesmo canal tende a estar quebrada também. É preferência,
//      não obrigação: uma aula certa do mesmo professor é melhor do que
//      nenhuma.
//
// A posição no cronograma não é tocada. O que muda é o vídeo dentro da aula,
// não o lugar da aula no dia — nenhuma outra atividade se move.
// ============================================================================

/** Uma aula candidata a substituir outra. */
export interface AulaCandidata {
  id: string;
  titulo: string;
  materia: string;
  assunto: string | null;
  url: string | null;
  /** Canal do YouTube — é o que identifica o professor. */
  canalId: string | null;
  /** Já verificada: existe, é pública e pode ser incorporada. */
  funciona: boolean;
  duracaoMinutos: number;
}

/** A aula que quebrou. */
export interface AulaQuebrada {
  id: string;
  materia: string;
  assunto: string | null;
  canalId: string | null;
}

/** Comparação de assunto tolerante a acento, caixa e espaço. */
export function mesmoAssunto(a: string | null, b: string | null): boolean {
  const normal = (v: string | null) =>
    (v ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  const x = normal(a);
  const y = normal(b);
  // Assunto vazio dos dois lados não é "mesmo assunto": seria autorizar a
  // troca por qualquer aula da matéria, que é exatamente o que não pode.
  if (!x || !y) return false;
  return x === y;
}

/**
 * A melhor substituta, ou null se não houver nenhuma aceitável.
 *
 * Devolver null é um resultado legítimo e comum: é melhor o admin ver "não
 * achei substituta para esta aula" do que o aluno receber uma aula de outro
 * assunto no lugar da que ele precisava.
 */
export function escolherSubstituta(
  quebrada: AulaQuebrada,
  candidatas: readonly AulaCandidata[]
): AulaCandidata | null {
  const elegiveis = candidatas.filter(
    (c) =>
      c.id !== quebrada.id &&
      c.funciona &&
      Boolean(c.url) &&
      c.materia === quebrada.materia &&
      mesmoAssunto(c.assunto, quebrada.assunto)
  );

  if (elegiveis.length === 0) return null;

  // Outro professor primeiro. Canal desconhecido conta como "outro": não
  // sabemos que é o mesmo, e o mesmo canal é justamente o suspeito.
  const deOutroProfessor = elegiveis.filter(
    (c) => !quebrada.canalId || !c.canalId || c.canalId !== quebrada.canalId
  );

  const preferidas = deOutroProfessor.length > 0 ? deOutroProfessor : elegiveis;

  // Entre as preferidas, a mais longa — numa lista de candidatas do mesmo
  // assunto, a aula mais completa costuma ser a de aula cheia, e não um corte
  // curto ou uma chamada do canal. Empate resolve pelo id, para a escolha ser
  // sempre a mesma: substituição que muda a cada execução deixaria o aluno
  // com uma aula diferente a cada abertura do cronograma.
  return [...preferidas].sort(
    (a, b) => b.duracaoMinutos - a.duracaoMinutos || a.id.localeCompare(b.id)
  )[0];
}

/** Resumo de uma troca, para o relatório do admin e para a auditoria. */
export interface TrocaDeAula {
  aulaId: string;
  motivo: string;
  substituiuPor: { titulo: string; url: string; canal: string | null } | null;
}
