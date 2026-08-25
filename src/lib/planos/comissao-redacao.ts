// ============================================================================
// COMISSÃO DE REDAÇÃO
//
// Um valor FIXO por venda, devido à professora responsável pelas redações
// daquele plano. Não é percentual: R$ 80,00 são R$ 80,00 tanto na venda de
// R$ 143,00 quanto na de R$ 454,00 — é o custo da correção que aquela venda
// passou a gerar, não uma fatia do preço.
//
// Por isso são DUAS informações e nenhuma vale sozinha: quanto, e para quem.
// Um valor sem professora é uma dívida sem credor; uma professora sem valor
// não gera nada. Este módulo é o que garante que as duas andam juntas antes
// de qualquer coisa chegar ao banco.
//
// Puro, como o de parcelamento ao lado, e pela mesma razão: as CHECKs do banco
// recusariam parte disto, mas como exceção de constraint — e o admin leria
// "não foi possível salvar o plano" sem saber o que corrigir.
// ============================================================================

/** As colunas de `planos`, como o banco as espera. */
export interface CamposDeComissaoDeRedacao {
  comissao_redacao_centavos: number;
  professor_id: string | null;
}

/** Um formulário, no mínimo que este módulo precisa dele. */
interface Formulario {
  get(nome: string): FormDataEntryValue | null;
}

/** O valor digitado em reais, virado centavos — ou null se não for um número. */
export function centavosDigitados(bruto: unknown): number | null {
  const texto = String(bruto ?? "").trim().replace(",", ".");
  if (texto === "") return 0;
  const reais = Number(texto);
  if (!Number.isFinite(reais) || reais < 0) return null;
  return Math.round(reais * 100);
}

/**
 * O que o administrador preencheu, virado em colunas válidas.
 *
 * Sem professora escolhida o valor é zerado junto. Guardar "R$ 80,00" num
 * plano que não tem a quem pagar deixaria a tela mostrando uma comissão
 * configurada que nunca vira dívida nenhuma — e, no dia em que alguém
 * designasse a professora, R$ 80,00 que ninguém lembra de ter combinado.
 */
export function lerComissaoDeRedacao(form: Formulario): CamposDeComissaoDeRedacao {
  const professorId = String(form.get("professor_id") ?? "").trim();
  if (!professorId) return { comissao_redacao_centavos: 0, professor_id: null };

  const centavos = centavosDigitados(form.get("comissao_redacao"));
  return {
    comissao_redacao_centavos: centavos ?? 0,
    professor_id: professorId
  };
}

/**
 * A mensagem para o administrador quando a configuração não faz sentido, ou
 * null quando está tudo certo.
 *
 * Só reclama do que ele consegue corrigir e do que a normalização não resolve
 * sozinha. O caso que importa é o valor preenchido SEM professora: zerar em
 * silêncio faria o plano parecer configurado quando não está.
 */
export function erroDeComissaoDeRedacao(form: Formulario): string | null {
  const bruto = String(form.get("comissao_redacao") ?? "").trim();
  const professorId = String(form.get("professor_id") ?? "").trim();
  const centavos = centavosDigitados(bruto);

  if (centavos === null) {
    return "O valor da comissão de redação precisa ser um número igual ou maior que zero.";
  }
  if (centavos > 0 && !professorId) {
    return "Escolha a professora que recebe a comissão de redação, ou deixe o valor em branco.";
  }
  return null;
}
