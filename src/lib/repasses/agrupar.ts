import { ehRecebido } from "@/lib/vendas/periodo";

// ============================================================================
// QUANTO PRECISO PAGAR PARA CADA UM ESTE MÊS
//
// A tela de Vendas responde "quanto entrou". Esta responde a outra metade:
// quanto SAI, e para quem. São duas comissões diferentes com naturezas
// diferentes, e o financeiro precisa das duas na mesma folha:
//
//   cupom   — percentual sobre o recebido, devido ao parceiro afiliado;
//   redacao — valor fixo por venda, devido à professora do plano.
//
// Este módulo é a parte pura: agrupar por pessoa, somar, e não somar o que não
// deve. Quem busca as linhas é a página.
//
// A REGRA QUE MAIS IMPORTA AQUI
// -----------------------------
// Comissão de venda ESTORNADA não é dívida. O razão marca essas linhas como
// 'cancelada' (ver a trigger `sync_comissao_parceiro`), e elas ficam de fora
// de qualquer total — mas continuam visíveis na lista, porque "essa comissão
// sumiu" é uma pergunta que alguém vai fazer.
//
// A data que manda é a DA VENDA, não a da linha de comissão. Uma parcela
// confirmada hoje sobre uma venda de agosto é dívida de agosto: é assim que o
// repasse fecha com o mês que o admin escolheu na tela de vendas.
// ============================================================================

export type TipoDeComissao = "cupom" | "redacao";

export const TIPO_LABEL: Record<TipoDeComissao, string> = {
  cupom: "Cupom / afiliado",
  redacao: "Redação"
};

export const STATUS_LABEL: Record<string, string> = {
  pendente: "A pagar",
  paga: "Paga",
  cancelada: "Cancelada"
};

/** Uma linha do razão, com o que a tela precisa junto. */
export interface ComissaoDevida {
  id: string;
  beneficiario_id: string;
  tipo: TipoDeComissao;
  valor_centavos: number;
  status: string;
  /** Quando a comissão foi quitada, não quando a venda aconteceu. */
  data_pagamento: string | null;
  beneficiario: { nome: string | null; role: string | null } | null;
  pagamento: {
    comprador_nome: string | null;
    plano_nome: string | null;
    data_pagamento: string | null;
    status: string | null;
  } | null;
}

export interface ResumoDeUmBeneficiario {
  beneficiarioId: string;
  nome: string;
  papel: string;
  /** O que ainda falta pagar. É o número que importa. */
  aPagarCentavos: number;
  /** O que já foi quitado no período. */
  pagoCentavos: number;
  quantidade: number;
  /** Quanto vem de cada tipo, para a pessoa que recebe pelos dois. */
  porTipo: { tipo: TipoDeComissao; aPagarCentavos: number; quantidade: number }[];
}

export interface ResumoDosRepasses {
  /** O total geral a repassar no período — a resposta da pergunta. */
  aPagarCentavos: number;
  pagoCentavos: number;
  quantidade: number;
  porBeneficiario: ResumoDeUmBeneficiario[];
  /** Consolidado por tipo, para separar afiliados de professores. */
  porTipo: { tipo: TipoDeComissao; aPagarCentavos: number; pagoCentavos: number; quantidade: number }[];
}

/**
 * Uma comissão só é dívida se a venda dela de fato entrou.
 *
 * A trigger cancela as comissões de venda estornada, mas ela depende de um
 * UPDATE chegar. Conferir o status da venda aqui também é o que impede uma
 * venda pendente — cobrança emitida e não paga — de virar repasse a pagar.
 */
export function ehDevida(c: ComissaoDevida): boolean {
  if (c.status !== "pendente") return false;
  // Sem a venda carregada não dá para afirmar que ela entrou; e uma comissão
  // órfã não é algo que se pague por omissão.
  return ehRecebido(c.pagamento?.status);
}

function ehPaga(c: ComissaoDevida): boolean {
  return c.status === "paga";
}

/**
 * O resumo dos repasses: por pessoa, por tipo e o total geral.
 *
 * A ordenação é por valor a pagar, decrescente — quem tem mais a receber vem
 * primeiro, que é a ordem em que o financeiro resolve a lista. Empate no
 * valor desempata pelo nome, para a tela não trocar de ordem entre duas
 * cargas iguais.
 */
export function resumirRepasses(linhas: readonly ComissaoDevida[]): ResumoDosRepasses {
  const porPessoa = new Map<string, ResumoDeUmBeneficiario>();
  const porTipo = new Map<TipoDeComissao, { aPagarCentavos: number; pagoCentavos: number; quantidade: number }>();
  const vistas = new Set<string>();

  let aPagarCentavos = 0;
  let pagoCentavos = 0;
  let quantidade = 0;

  for (const linha of linhas) {
    if (vistas.has(linha.id)) continue;
    vistas.add(linha.id);

    const devida = ehDevida(linha);
    const paga = ehPaga(linha);
    // Cancelada não entra em soma nenhuma — mas continua na lista da tela.
    if (!devida && !paga) continue;

    const valor = linha.valor_centavos ?? 0;
    const aPagar = devida ? valor : 0;
    const jaPago = paga ? valor : 0;

    aPagarCentavos += aPagar;
    pagoCentavos += jaPago;
    quantidade += 1;

    const pessoa = porPessoa.get(linha.beneficiario_id) ?? {
      beneficiarioId: linha.beneficiario_id,
      nome: linha.beneficiario?.nome ?? "Sem nome",
      papel: linha.beneficiario?.role ?? "—",
      aPagarCentavos: 0,
      pagoCentavos: 0,
      quantidade: 0,
      porTipo: []
    };
    pessoa.aPagarCentavos += aPagar;
    pessoa.pagoCentavos += jaPago;
    pessoa.quantidade += 1;

    const doTipo = pessoa.porTipo.find((t) => t.tipo === linha.tipo);
    if (doTipo) {
      doTipo.aPagarCentavos += aPagar;
      doTipo.quantidade += 1;
    } else {
      pessoa.porTipo.push({ tipo: linha.tipo, aPagarCentavos: aPagar, quantidade: 1 });
    }
    porPessoa.set(linha.beneficiario_id, pessoa);

    const totalDoTipo = porTipo.get(linha.tipo) ?? { aPagarCentavos: 0, pagoCentavos: 0, quantidade: 0 };
    totalDoTipo.aPagarCentavos += aPagar;
    totalDoTipo.pagoCentavos += jaPago;
    totalDoTipo.quantidade += 1;
    porTipo.set(linha.tipo, totalDoTipo);
  }

  return {
    aPagarCentavos,
    pagoCentavos,
    quantidade,
    porBeneficiario: [...porPessoa.values()].sort(
      (a, b) => b.aPagarCentavos - a.aPagarCentavos || a.nome.localeCompare(b.nome, "pt-BR")
    ),
    porTipo: [...porTipo.entries()]
      .map(([tipo, dados]) => ({ tipo, ...dados }))
      .sort((a, b) => b.aPagarCentavos - a.aPagarCentavos)
  };
}

/** "Repasses de agosto de 2026" — o período escrito por extenso. */
export function descreverPeriodoDeRepasse(de?: string | null, ate?: string | null): string {
  if (!de && !ate) return "Comissões de todo o período";
  const bonito = (iso: string) => iso.split("-").reverse().join("/");
  if (de && ate) return `Comissões de vendas entre ${bonito(de)} e ${bonito(ate)}`;
  if (de) return `Comissões de vendas a partir de ${bonito(de)}`;
  return `Comissões de vendas até ${bonito(ate!)}`;
}
