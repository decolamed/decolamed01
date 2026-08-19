import { dataBR, instanteNoFuso, MEIO_DIA } from "@/lib/site/data";

// ============================================================================
// O TOTAL RECEBIDO NUM PERÍODO
//
// A tela de Vendas já filtrava por data, mas não dizia quanto entrou no
// intervalo — e os cartões de resumo somavam as linhas que a página tinha
// buscado, não o que existe no banco. São coisas diferentes: o PostgREST tem
// teto de linhas por resposta (1000 por padrão), então bastaria a operação
// crescer para o "total" virar "total das primeiras mil vendas", sem aviso
// nenhum. Dinheiro somado pela metade é pior do que dinheiro não somado.
//
// Este módulo é a parte pura da conta: que status representa dinheiro que
// entrou, onde começa e termina o período, e como somar sem contar a mesma
// venda duas vezes. Quem busca as linhas é a página (ver `resumoDeVendas`).
// ============================================================================

/**
 * Os status que representam dinheiro efetivamente recebido.
 *
 * `pendente` é cobrança emitida e não paga; `estornado` é dinheiro devolvido;
 * `falhou` nunca entrou. Nenhum dos três pode aparecer no faturamento.
 */
export const STATUS_RECEBIDOS = ["confirmado", "recebido"] as const;

export function ehRecebido(status: string | null | undefined): boolean {
  return (STATUS_RECEBIDOS as readonly string[]).includes(String(status ?? ""));
}

/** Uma data de calendário no formato dos campos <input type="date">. */
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

export function dataValida(valor: string | null | undefined): string | null {
  const bruto = (valor ?? "").trim();
  if (!FORMATO_DATA.test(bruto)) return null;
  // Rejeita 2026-02-31 e afins: o Date normaliza para março e o período
  // filtraria por um dia que o admin não escolheu.
  const [ano, mes, dia] = bruto.split("-").map(Number);
  const teste = new Date(Date.UTC(ano, mes - 1, dia));
  if (teste.getUTCFullYear() !== ano || teste.getUTCMonth() !== mes - 1 || teste.getUTCDate() !== dia) return null;
  return bruto;
}

export interface LimitesDoPeriodo {
  /** Início do período em ISO/UTC, ou null quando não há data inicial. */
  inicio: string | null;
  /** Fim do período em ISO/UTC, ou null quando não há data final. */
  fim: string | null;
  /** A data inicial é posterior à final — não existe período nenhum. */
  invertido: boolean;
}

/**
 * Onde o período começa e termina, em instantes que o banco entende.
 *
 * O dia final entra inteiro (até 23:59:59.999): o admin que digita
 * "30/08" quer as vendas DO dia 30, não as vendas até a virada dele.
 */
export function limitesDoPeriodo(de?: string | null, ate?: string | null): LimitesDoPeriodo {
  const inicioData = dataValida(de);
  const fimData = dataValida(ate);
  const invertido = Boolean(inicioData && fimData && inicioData > fimData);

  return {
    inicio: inicioData ? instanteNoFuso(inicioData, "00:00:00.000").toISOString() : null,
    fim: fimData ? instanteNoFuso(fimData, "23:59:59.999").toISOString() : null,
    invertido
  };
}

/**
 * A data em que um pagamento foi pago, pronta para gravar.
 *
 * O Asaas manda `paymentDate` como dia de calendário ("2026-08-18"), sem
 * hora. Gravado assim, o Postgres o fixa à meia-noite UTC — que em Brasília
 * ainda é dia 17, às 21h. Toda venda vinda do gateway ficava arquivada um dia
 * antes do dia em que foi paga, e um filtro por mês perdia (ou ganhava) a
 * virada. Ao meio-dia do fuso da plataforma o dia é o mesmo em qualquer
 * leitura. Instante completo (com hora) passa direto: ali não há ambiguidade.
 */
export function dataDePagamento(valor?: string | null, agora: Date = new Date()): string {
  const bruto = (valor ?? "").trim();
  if (!bruto) return agora.toISOString();
  const dia = dataValida(bruto);
  if (dia) return instanteNoFuso(dia, MEIO_DIA).toISOString();
  const instante = new Date(bruto);
  return Number.isNaN(instante.getTime()) ? agora.toISOString() : instante.toISOString();
}

/** Como o período é escrito embaixo do total. */
export function descreverPeriodo(de?: string | null, ate?: string | null): string {
  const inicio = dataValida(de);
  const fim = dataValida(ate);
  if (inicio && fim) return `Total recebido entre ${dataBR(inicio)} e ${dataBR(fim)}`;
  if (inicio) return `Total recebido a partir de ${dataBR(inicio)}`;
  if (fim) return `Total recebido até ${dataBR(fim)}`;
  return "Total recebido em todo o período";
}

/** Uma linha de `pagamentos`, com só o que a soma precisa. */
export interface VendaSomavel {
  id: string;
  status: string | null;
  valor_centavos: number | null;
  valor_liquido_centavos: number | null;
  comissao_centavos: number | null;
  plano_nome: string | null;
}

export interface ResumoDoPeriodo {
  totalCentavos: number;
  liquidoCentavos: number;
  quantidade: number;
  ticketMedioCentavos: number;
  porPlano: { plano: string; quantidade: number; totalCentavos: number }[];
}

/**
 * O líquido de uma venda.
 *
 * `valor_liquido_centavos` é preenchido pelo webhook; nas vendas manuais
 * antigas ele é nulo, e aí o líquido é o bruto menos a comissão do parceiro.
 */
function liquidoDaVenda(v: VendaSomavel): number {
  return v.valor_liquido_centavos ?? (v.valor_centavos ?? 0) - (v.comissao_centavos ?? 0);
}

/**
 * Soma as vendas recebidas, ignorando repetições.
 *
 * A deduplicação por `id` não é zelo excessivo: as linhas chegam em blocos
 * paginados, e uma venda registrada no meio da busca empurra as seguintes
 * para o bloco de trás — a mesma venda apareceria em dois blocos e seria
 * contada duas vezes.
 */
export function somarRecebidos(linhas: readonly VendaSomavel[]): ResumoDoPeriodo {
  const vistas = new Set<string>();
  const porPlano = new Map<string, { quantidade: number; totalCentavos: number }>();
  let totalCentavos = 0;
  let liquidoCentavos = 0;
  let quantidade = 0;

  for (const linha of linhas) {
    if (!ehRecebido(linha.status)) continue;
    if (vistas.has(linha.id)) continue;
    vistas.add(linha.id);

    const bruto = linha.valor_centavos ?? 0;
    totalCentavos += bruto;
    liquidoCentavos += liquidoDaVenda(linha);
    quantidade += 1;

    const chave = linha.plano_nome ?? "Sem plano";
    const atual = porPlano.get(chave) ?? { quantidade: 0, totalCentavos: 0 };
    atual.quantidade += 1;
    atual.totalCentavos += bruto;
    porPlano.set(chave, atual);
  }

  return {
    totalCentavos,
    liquidoCentavos,
    quantidade,
    ticketMedioCentavos: quantidade > 0 ? Math.round(totalCentavos / quantidade) : 0,
    porPlano: [...porPlano.entries()]
      .map(([plano, dados]) => ({ plano, ...dados }))
      .sort((a, b) => b.totalCentavos - a.totalCentavos)
  };
}
