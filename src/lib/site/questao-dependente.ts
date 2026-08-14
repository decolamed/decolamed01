// ============================================================================
// QUESTÃO QUE NÃO SE SUSTENTA SOZINHA
//
// Na prova impressa, a questão 15 podia dizer "(Referente ao texto da Questão
// 14)" porque as duas estavam na mesma página. Na plataforma cada questão é
// uma unidade independente: aparece isolada no Banco de Questões, entra
// sozinha numa atividade de 5 questões, pode cair num simulado sem a vizinha.
// Sem o texto-base, ela é impossível de responder — e o aluno erra por um
// defeito de cadastro, não por não saber.
//
// Foi o caso da Q86A665 (FACAPE 2024.1, Inglês, questão 15):
//
//   "(Referente ao texto da Questão 14). Qual das alternativas abaixo é a
//    mais apropriada de acordo com o texto acima:"
//
// Este módulo reconhece o padrão. Ele é usado na auditoria do acervo e na
// importação em massa, para o problema não voltar a entrar em silêncio.
//
// O que ele NÃO faz: marcar como dependente uma questão que traz o próprio
// texto. "De acordo com o texto, ..." depois de três parágrafos citados é
// uma questão normal — o texto está ali. Por isso a regra combina a
// referência com a AUSÊNCIA de texto-base próprio.
// ============================================================================

/** Referência explícita a OUTRA questão. Isso nunca se resolve sozinho. */
const REFERENCIA_A_OUTRA_QUESTAO =
  /(vide\s+(o\s+)?texto\s+d[ae]\s+quest|referente\s+ao\s+(texto|enunciado)\s+d[ae]\s+quest|texto\s+d[ae]\s+quest(ão|ao)\s*\d|enunciado\s+d[ae]\s+quest(ão|ao)\s*\d|o\s+texto\s+base\s+é\s+o\s+mesmo\s+d[ae]\s+quest|d[oa]\s+dito\s+d[ae]\s+quest(ão|ao)\s*\d|quest(ão|ao)\s+anterior|na\s+quest(ão|ao)\s+\d+\s*,?\s*(o|a|foi|vimos))/i;

/** O cadastro declarou que não há texto-base — e mesmo assim cita um. */
const DECLARA_SEM_TEXTO = /\(\s*n[ãa]o\s+possui\s+texto[- ]base\.?\s*\)/i;

/**
 * Anotações do cadastro que não são conteúdo. Elas ocupam espaço no
 * enunciado e falseariam a medida de "quanto texto de apoio existe antes da
 * citação" — "(Não possui texto-base.)" sozinho já tem 24 caracteres.
 */
// Só os marcadores que NÃO citam outra questão: os que citam precisam
// continuar no texto para a regra abaixo enxergá-los.
const MARCADORES_DE_CADASTRO =
  /\(\s*(n[ãa]o\s+possui\s+texto[- ]base\.?|o\s+contexto\s+acima\s+funciona\s+como\s+enunciado)\s*\)\.?/gi;

/** Menção a um apoio visual/textual que deveria estar na própria questão. */
const CITA_APOIO =
  /\b(texto|figura|imagem|gr[áa]fico|tabela|quadro|tirinha|charge|mapa|esquema|fragmento|trecho|poema|cartum)\s+(acima|abaixo|a\s+seguir|ao\s+lado|anterior|apresentad[oa])/i;

/**
 * Um enunciado curto que só faz a pergunta não pode conter o texto de apoio
 * que ele cita. O corte é generoso de propósito: os casos reais do acervo têm
 * entre 96 e 230 caracteres, e o menor texto-base embutido tem mais de 300.
 */
const TAMANHO_SEM_TEXTO_PROPRIO = 320;

/**
 * Quanto texto precisa existir ANTES da citação para ela ser inofensiva.
 * O menor texto de apoio real do acervo — a citação do Dr. Seuss — tem 118
 * caracteres; os casos quebrados tinham zero (a citação abria o enunciado).
 */
const TAMANHO_MINIMO_DE_APOIO = 80;

export interface DiagnosticoDependencia {
  dependente: boolean;
  /** Frase pronta para o admin, ou null quando a questão está íntegra. */
  motivo: string | null;
}

/**
 * A questão depende de contexto que não está nela?
 *
 * `temImagem` importa: "de acordo com a figura acima" é legítimo quando a
 * questão tem imagem anexada. Sem ela, a figura não existe para o aluno.
 */
export function diagnosticarDependencia(
  enunciado: string | null | undefined,
  opcoes: { temImagem?: boolean } = {}
): DiagnosticoDependencia {
  const texto = (enunciado ?? "").trim();
  if (!texto) return { dependente: true, motivo: "Enunciado vazio." };

  // Citar outra questão só é um problema quando NÃO há texto de apoio antes
  // da citação. Depois que o texto-base é incorporado (migração 058), a
  // questão passa a trazer o trecho e continua dizendo "do dito da questão
  // 13" — a frase é herdada da prova original, mas o aluno agora tem tudo o
  // que precisa acima dela. Marcar essa questão como quebrada tiraria do
  // acervo justamente o que acabou de ser consertado.
  //
  // A medição ignora os marcadores de cadastro: "(Não possui texto-base.)"
  // ocupa 24 caracteres e não é apoio nenhum.
  const semMarcadores = texto.replace(MARCADORES_DE_CADASTRO, "").trim();
  const referencia = REFERENCIA_A_OUTRA_QUESTAO.exec(semMarcadores);
  if (referencia) {
    const apoioAntes = semMarcadores.slice(0, referencia.index).trim();
    if (apoioAntes.length < TAMANHO_MINIMO_DE_APOIO) {
      return {
        dependente: true,
        motivo: "O enunciado remete a outra questão da prova; sozinha, ela não pode ser respondida."
      };
    }
  }

  if (DECLARA_SEM_TEXTO.test(texto) && CITA_APOIO.test(texto)) {
    return {
      dependente: true,
      motivo: "O cadastro declara que não há texto-base, mas o enunciado cita um."
    };
  }

  // Enunciado curto que cita um apoio: o apoio não cabe nele.
  if (CITA_APOIO.test(texto) && texto.length < TAMANHO_SEM_TEXTO_PROPRIO) {
    const citaImagem = /\b(figura|imagem|gr[áa]fico|tirinha|charge|mapa|esquema|cartum)\b/i.test(texto);
    // Uma questão com imagem anexada pode legitimamente dizer "figura acima".
    if (citaImagem && opcoes.temImagem) return { dependente: false, motivo: null };
    return {
      dependente: true,
      motivo: "O enunciado cita um texto/apoio visual que não está na própria questão."
    };
  }

  return { dependente: false, motivo: null };
}

/** Atalho booleano, para filtros e listagens. */
export function dependeDeContextoExterno(
  enunciado: string | null | undefined,
  opcoes: { temImagem?: boolean } = {}
): boolean {
  return diagnosticarDependencia(enunciado, opcoes).dependente;
}
