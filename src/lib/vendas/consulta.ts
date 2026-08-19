import type { SupabaseClient } from "@supabase/supabase-js";
import { limitesDoPeriodo, somarRecebidos, type ResumoDoPeriodo, type VendaSomavel } from "./periodo";

// ============================================================================
// BUSCAR AS VENDAS DO PERÍODO — TODAS ELAS
//
// O total do topo da tela precisa vir do banco, não das linhas que a tabela
// conseguiu mostrar. O PostgREST devolve no máximo 1000 linhas por resposta,
// então uma única consulta "traz tudo e soma" tem prazo de validade: no dia
// em que a plataforma passar de mil vendas, o total simplesmente para de
// crescer, sem erro nenhum na tela. Por isso a soma varre a tabela em blocos.
//
// Os filtros ficam num só lugar (`aplicarFiltrosDeVendas`) e são usados tanto
// pela tabela quanto pela soma — é o que garante que o número do cartão é o
// número das vendas listadas embaixo, e não duas consultas parecidas que um
// dia divergem.
// ============================================================================

export interface FiltrosDeVendas {
  de?: string;
  ate?: string;
  planoId?: string;
  status?: string;
  cupom?: string;
  parceiroId?: string;
}

// O construtor de consulta do Supabase é tipado de forma recursiva; encaixar
// os genéricos dele aqui estoura o verificador ("Type instantiation is
// excessively deep"). O `any` fica preso a este módulo — quem chama recebe de
// volta um construtor normal e continua com os tipos do Supabase.
type Consulta = any;

/**
 * Os filtros da tela aplicados a uma consulta de `pagamentos`.
 *
 * O período usa os limites do fuso da plataforma (ver `limitesDoPeriodo`).
 * Período invertido não filtra por data aqui — quem chama detecta e avisa,
 * porque devolver zero calado faria o admin achar que não vendeu nada.
 */
export function aplicarFiltrosDeVendas(query: Consulta, filtros: FiltrosDeVendas): Consulta {
  const { inicio, fim, invertido } = limitesDoPeriodo(filtros.de, filtros.ate);
  let atual = query;

  if (!invertido) {
    if (inicio) atual = atual.gte("data_pagamento", inicio);
    if (fim) atual = atual.lte("data_pagamento", fim);
  }
  if (filtros.planoId) atual = atual.eq("plano_id", filtros.planoId);
  if (filtros.status) atual = atual.eq("status", filtros.status);
  if (filtros.cupom) atual = atual.eq("cupom_codigo", filtros.cupom.trim().toUpperCase());
  if (filtros.parceiroId) atual = atual.eq("parceiro_id", filtros.parceiroId);

  return atual;
}

/**
 * A consulta que alimenta a TABELA de vendas — os mesmos filtros do resumo,
 * para os dois números nunca discordarem.
 */
export function consultaDeVendas(supabase: SupabaseClient<any>, filtros: FiltrosDeVendas): Consulta {
  return aplicarFiltrosDeVendas(supabase.from("pagamentos").select("*"), filtros).order("data_pagamento", {
    ascending: false
  });
}

/** As colunas que a soma precisa — nada além disso viaja pela rede. */
const COLUNAS_DA_SOMA = "id, status, valor_centavos, valor_liquido_centavos, comissao_centavos, plano_nome";

const TAMANHO_DO_BLOCO = 1000;

// Trava de segurança: 500 blocos são 500 mil vendas. Se a varredura chegar
// aqui, alguma coisa está errada (um filtro que não filtra, por exemplo) e é
// melhor parar e avisar do que prender a renderização da página.
const MAXIMO_DE_BLOCOS = 500;

const RESUMO_VAZIO: ResumoDoPeriodo = {
  totalCentavos: 0,
  liquidoCentavos: 0,
  quantidade: 0,
  ticketMedioCentavos: 0,
  porPlano: []
};

export interface ResultadoDoResumo {
  resumo: ResumoDoPeriodo;
  /** A varredura bateu na trava antes de acabar — o total está incompleto. */
  incompleto: boolean;
  /** Mensagem técnica quando a consulta falhou. */
  erro: string | null;
}

/**
 * O resumo financeiro do período, somado a partir de todas as linhas que
 * batem com o filtro — não só as que cabem numa resposta.
 *
 * A ordenação é por `id` de propósito: `data_pagamento` repete (várias vendas
 * no mesmo dia, e as antigas estão todas à meia-noite), e paginar por uma
 * coluna com empates pode pular ou repetir linhas entre os blocos.
 */
export async function resumoDeVendas(
  supabase: SupabaseClient<any>,
  filtros: FiltrosDeVendas
): Promise<ResultadoDoResumo> {
  const linhas: VendaSomavel[] = [];

  for (let bloco = 0; bloco < MAXIMO_DE_BLOCOS; bloco++) {
    const inicio = bloco * TAMANHO_DO_BLOCO;
    const { data, error } = await aplicarFiltrosDeVendas(supabase.from("pagamentos").select(COLUNAS_DA_SOMA), filtros)
      .order("id", { ascending: true })
      .range(inicio, inicio + TAMANHO_DO_BLOCO - 1);

    if (error) return { resumo: RESUMO_VAZIO, incompleto: false, erro: error.message };

    const pagina = (data ?? []) as VendaSomavel[];
    linhas.push(...pagina);

    // Bloco menor que o pedido significa que acabou. É também o caso do
    // primeiro bloco vazio, quando não há venda nenhuma no período.
    if (pagina.length < TAMANHO_DO_BLOCO) {
      return { resumo: somarRecebidos(linhas), incompleto: false, erro: null };
    }
  }

  return { resumo: somarRecebidos(linhas), incompleto: true, erro: null };
}
