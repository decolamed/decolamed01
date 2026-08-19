// ============================================================================
// PARCELAMENTO NO CARTÃO
//
// Cada plano decide se aceita parcelar, em até quantas vezes, e se cobra
// juros. Este módulo transforma essa configuração nas opções que o cliente vê
// — e no valor que vai para o gateway.
//
// Ele é PURO de propósito. O valor mostrado na tela e o valor enviado ao
// Asaas precisam ser o mesmo número, e a única forma de garantir isso é os
// dois saírem da mesma função, com o mesmo arredondamento. Duas contas
// parecidas em lugares diferentes divergem em centavos — e centavo divergente
// numa cobrança é diferença que o cliente vê no extrato.
//
// Tudo em CENTAVOS, inteiros. Dinheiro em ponto flutuante acumula erro: 0.1 +
// 0.2 não dá 0.3 em nenhuma linguagem que usa IEEE 754, e uma parcela de
// R$ 148,333... precisa virar centavos com uma regra explícita, não com o
// arredondamento que o acaso der.
// ============================================================================

/** O que o plano define sobre parcelar. */
export interface ConfiguracaoDeParcelamento {
  parcelamentoAtivo: boolean;
  parcelasMaximas: number;
  jurosAtivo: boolean;
  /** Juros ao mês em porcentagem: 2.5 = 2,5% a.m. */
  jurosPercentual: number;
}

/** Uma opção de pagamento no cartão, pronta para a tela e para o gateway. */
export interface OpcaoDeParcelamento {
  parcelas: number;
  /** O que o cliente paga por mês, em centavos. */
  valorDaParcelaCentavos: number;
  /** O total da compra nesta opção, em centavos. */
  totalCentavos: number;
  /** Quanto os juros acrescentaram ao preço do plano, em centavos. */
  jurosCentavos: number;
  temJuros: boolean;
}

/** Teto do próprio Asaas para parcelamento no cartão. */
export const PARCELAS_MAXIMAS_ABSOLUTAS = 24;

/** A configuração de um plano que não parcela — o padrão de todos. */
export const SEM_PARCELAMENTO: ConfiguracaoDeParcelamento = {
  parcelamentoAtivo: false,
  parcelasMaximas: 1,
  jurosAtivo: false,
  jurosPercentual: 0
};

/**
 * Lê a configuração de uma linha de `planos`, tolerando ausência.
 *
 * Um plano criado antes desta funcionalidade não tem as colunas preenchidas
 * na memória de quem consultou com `select` parcial — e o resultado precisa
 * ser "não parcela", nunca um valor inventado.
 */
export function lerConfiguracao(plano: Record<string, unknown> | null | undefined): ConfiguracaoDeParcelamento {
  if (!plano) return SEM_PARCELAMENTO;

  const ativo = plano.parcelamento_ativo === true;
  if (!ativo) return SEM_PARCELAMENTO;

  const maximas = Number(plano.parcelas_maximas ?? 1);
  const jurosAtivo = plano.juros_ativo === true;
  const percentual = Number(plano.juros_percentual ?? 0);

  return {
    parcelamentoAtivo: true,
    parcelasMaximas: limitarParcelas(maximas),
    // Juros ligado com percentual zerado não é "com juros": é configuração
    // incompleta. Tratamos como sem juros para o cliente nunca ler um aviso
    // de juros e pagar o valor à vista — ou o contrário.
    jurosAtivo: jurosAtivo && percentual > 0,
    jurosPercentual: percentual > 0 ? percentual : 0
  };
}

/** O teto real de parcelas: entre 1 e o limite do gateway. */
export function limitarParcelas(valor: number): number {
  if (!Number.isFinite(valor)) return 1;
  return Math.min(PARCELAS_MAXIMAS_ABSOLUTAS, Math.max(1, Math.floor(valor)));
}

/**
 * O total da compra em N parcelas.
 *
 * Sem juros, o total é o preço do plano — parcelar não encarece nada.
 *
 * Com juros, usamos JUROS COMPOSTOS sobre o número de parcelas:
 *
 *     total = preço × (1 + i)^n
 *
 * É o modelo de "juros ao mês" que o cliente reconhece de qualquer parcelamento
 * de cartão. Juros simples (preço × (1 + i×n)) cobraria menos e daria uma conta
 * que não bate com a do mercado; a escolha precisa ser explícita porque as duas
 * são defensáveis, e trocar uma pela outra muda o que o cliente paga.
 *
 * À vista (n = 1) nunca tem juros, mesmo com juros configurados: não há prazo
 * a remunerar.
 */
export function totalComJuros(
  precoCentavos: number,
  parcelas: number,
  config: ConfiguracaoDeParcelamento
): number {
  if (parcelas <= 1 || !config.jurosAtivo || config.jurosPercentual <= 0) {
    return precoCentavos;
  }
  const taxa = config.jurosPercentual / 100;
  return Math.round(precoCentavos * Math.pow(1 + taxa, parcelas));
}

/**
 * Uma opção de parcelamento, com a parcela já fechada em centavos.
 *
 * O total é recalculado a partir da parcela arredondada — não o contrário.
 * Assim `parcela × n` bate exatamente com o total exibido e com o total
 * cobrado. Se guardássemos o total "teórico" e mostrássemos a parcela
 * arredondada, a soma das parcelas não fecharia com o total na tela, e a
 * diferença apareceria na fatura do cliente.
 *
 * O arredondamento é para CIMA no centavo: o Asaas cobra `n` parcelas iguais,
 * então arredondar para baixo deixaria a soma abaixo do preço do plano — a
 * plataforma receberia menos do que vendeu.
 */
export function montarOpcao(
  precoCentavos: number,
  parcelas: number,
  config: ConfiguracaoDeParcelamento
): OpcaoDeParcelamento {
  const n = Math.max(1, Math.floor(parcelas));
  const totalBruto = totalComJuros(precoCentavos, n, config);
  const valorDaParcelaCentavos = Math.ceil(totalBruto / n);
  const totalCentavos = valorDaParcelaCentavos * n;

  // "Tem juros" vem do total ANTES do arredondamento, não depois.
  //
  // Sem isso, um plano SEM juros anunciaria "com juros": R$ 445,00 em 3x dá
  // R$ 148,3333…, arredonda para R$ 148,34, e o total fecha em R$ 445,02 —
  // dois centavos acima do preço, só por causa da divisão. Comparar o total
  // final com o preço confundiria essa sobra de arredondamento com cobrança
  // de juros, e o cliente leria um aviso falso na tela.
  const houveJuros = totalBruto > precoCentavos;

  return {
    parcelas: n,
    valorDaParcelaCentavos,
    totalCentavos,
    // Os centavos de arredondamento não são juros e não entram na conta.
    jurosCentavos: houveJuros ? totalCentavos - precoCentavos : 0,
    temJuros: houveJuros
  };
}

/**
 * Todas as opções que o cliente pode escolher no cartão.
 *
 * Sempre inclui a de 1x — "à vista" é uma opção, não a ausência de opção. Um
 * plano sem parcelamento devolve exatamente uma opção, e a tela mostra o
 * cartão como sempre foi.
 */
export function opcoesDeParcelamento(
  precoCentavos: number,
  config: ConfiguracaoDeParcelamento
): OpcaoDeParcelamento[] {
  const teto = config.parcelamentoAtivo ? limitarParcelas(config.parcelasMaximas) : 1;
  const opcoes: OpcaoDeParcelamento[] = [];
  for (let n = 1; n <= teto; n++) opcoes.push(montarOpcao(precoCentavos, n, config));
  return opcoes;
}

/**
 * A opção correspondente a um número de parcelas pedido — ou null.
 *
 * É por aqui que o servidor confere o que veio do checkout. O número de
 * parcelas chega do navegador, e o navegador é entrada não confiável: pedir
 * 12x num plano configurado para 3x não pode virar uma cobrança em 12x. Fora
 * do teto, devolve null e quem chamou recusa.
 */
export function opcaoEscolhida(
  precoCentavos: number,
  parcelasPedidas: unknown,
  config: ConfiguracaoDeParcelamento
): OpcaoDeParcelamento | null {
  const n = Number(parcelasPedidas);
  if (!Number.isInteger(n) || n < 1) return null;

  const teto = config.parcelamentoAtivo ? limitarParcelas(config.parcelasMaximas) : 1;
  if (n > teto) return null;

  return montarOpcao(precoCentavos, n, config);
}

/** "3x de R$ 148,33 (com juros)" — o rótulo que o cliente lê. */
export function descreverOpcao(opcao: OpcaoDeParcelamento): string {
  const emReais = (centavos: number) =>
    (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (opcao.parcelas === 1) return `À vista — ${emReais(opcao.totalCentavos)}`;

  const sufixo = opcao.temJuros ? " (com juros)" : " sem juros";
  return `${opcao.parcelas}x de ${emReais(opcao.valorDaParcelaCentavos)}${sufixo}`;
}

// ============================================================================
// O FORMULÁRIO DO PAINEL
// ============================================================================

/** As colunas de `planos`, como o banco as espera. */
export interface CamposDeParcelamento {
  parcelamento_ativo: boolean;
  parcelas_maximas: number;
  juros_ativo: boolean;
  juros_percentual: number;
}

/**
 * O que o administrador marcou, virado em colunas válidas.
 *
 * As CHECKs do banco recusam configuração impossível, mas um erro de
 * digitação não pode chegar lá como uma exceção de constraint — o admin leria
 * "não foi possível salvar o plano" sem saber o que corrigir. Aqui os valores
 * são normalizados antes, e o que sobrar de inválido tem mensagem própria
 * (ver `erroDeParcelamento`).
 *
 * Desligar o parcelamento zera o resto: guardar "até 12x" num plano que não
 * parcela é uma contradição que reapareceria na próxima vez que alguém ligasse
 * a opção, com um número que ninguém escolheu.
 */
export function lerCamposDoFormulario(form: {
  get(nome: string): FormDataEntryValue | null;
}): CamposDeParcelamento {
  const ativo = form.get("parcelamento_ativo") === "on";
  if (!ativo) {
    return { parcelamento_ativo: false, parcelas_maximas: 1, juros_ativo: false, juros_percentual: 0 };
  }

  const maximas = limitarParcelas(Number(form.get("parcelas_maximas") ?? 1));
  const jurosAtivo = form.get("juros_ativo") === "on";
  const percentual = Number(String(form.get("juros_percentual") ?? "0").replace(",", "."));
  const percentualValido = Number.isFinite(percentual) && percentual > 0 ? percentual : 0;

  return {
    parcelamento_ativo: true,
    parcelas_maximas: maximas,
    // Sem percentual não há juros a cobrar. Gravar `juros_ativo` sozinho
    // violaria a CHECK do banco e faria o salvamento inteiro falhar.
    juros_ativo: jurosAtivo && percentualValido > 0,
    juros_percentual: jurosAtivo ? percentualValido : 0
  };
}

/**
 * A mensagem para o administrador quando a configuração não faz sentido, ou
 * null quando está tudo certo.
 *
 * Só reclama do que ele consegue corrigir e do que a normalização não resolve
 * sozinha — cobrar juros sem dizer quanto, e um número de parcelas que ele
 * digitou fora da faixa. Recusar em silêncio, ou "consertar" 50 parcelas para
 * 24 sem avisar, deixaria o plano diferente do que ele configurou.
 */
export function erroDeParcelamento(form: {
  get(nome: string): FormDataEntryValue | null;
}): string | null {
  if (form.get("parcelamento_ativo") !== "on") return null;

  const pedidas = Number(form.get("parcelas_maximas") ?? 1);
  if (!Number.isFinite(pedidas) || !Number.isInteger(pedidas) || pedidas < 1) {
    return "O número máximo de parcelas precisa ser um número inteiro a partir de 1.";
  }
  if (pedidas > PARCELAS_MAXIMAS_ABSOLUTAS) {
    return `O Asaas aceita no máximo ${PARCELAS_MAXIMAS_ABSOLUTAS} parcelas no cartão.`;
  }

  if (form.get("juros_ativo") === "on") {
    const percentual = Number(String(form.get("juros_percentual") ?? "0").replace(",", "."));
    if (!Number.isFinite(percentual) || percentual <= 0) {
      return "Para cobrar juros, informe um percentual maior que zero.";
    }
    if (percentual > 100) {
      return "O percentual de juros não pode passar de 100% ao mês.";
    }
  }

  return null;
}
