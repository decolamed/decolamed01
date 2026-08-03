import { createAdminClient } from "@/lib/supabase/server";

// Parâmetros do algoritmo do Copiloto, carregados do banco.
//
// Antes eles eram constantes no meio de motor.ts: duração de cada tipo de
// missão, quantas recomendações por modo, a partir de quantos dias o modo
// vira "cirúrgico". Mudar qualquer um exigia alterar código e publicar de
// novo — e a tela de configurações do admin não tinha efeito nenhum sobre o
// algoritmo, o que é justamente o oposto do que o painel promete.
//
// Agora tudo vem de `configuracoes` (chaves `copiloto.*`). Os valores atuais
// viram apenas o PADRÃO: uma instalação sem nada cadastrado se comporta
// exatamente como antes, e o admin pode ajustar sem deploy.

export interface ConfigCopiloto {
  /** Minutos estimados por tipo de missão. */
  duracaoPorTipo: Record<string, number>;
  /** Máximo de recomendações por rodada, por modo adaptativo. */
  maxRecomendacoes: { generoso: number; equilibrado: number; cirurgico: number };
  /** Dias restantes até a prova a partir dos quais o modo vira "cirúrgico". */
  diasParaModoCirurgico: number;
  /** Abaixo deste número de dias livres, o modo também vira "cirúrgico". */
  diasLivresMinimos: number;
  /** Quantos dias o Copiloto pode modificar numa mesma execução. */
  maxDiasModificadosPorExecucao: number;
}

export const CONFIG_COPILOTO_PADRAO: ConfigCopiloto = {
  duracaoPorTipo: { questoes: 40, flashcards: 25, revisao: 30, aula: 45, simulado: 90 },
  maxRecomendacoes: { generoso: 8, equilibrado: 5, cirurgico: 3 },
  diasParaModoCirurgico: 14,
  diasLivresMinimos: 3,
  maxDiasModificadosPorExecucao: 3
};

export const PREFIXO_CONFIG_COPILOTO = "copiloto.";

/** Número positivo vindo do jsonb, ou o padrão quando ausente/inválido. */
function numero(valor: unknown, padrao: number): number {
  const n = typeof valor === "string" ? Number(valor) : typeof valor === "number" ? valor : NaN;
  return Number.isFinite(n) && n > 0 ? n : padrao;
}

export async function carregarConfigCopiloto(): Promise<ConfigCopiloto> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("configuracoes")
    .select("chave, valor")
    .like("chave", `${PREFIXO_CONFIG_COPILOTO}%`);

  const mapa = new Map<string, unknown>();
  (data ?? []).forEach((l: { chave: string; valor: unknown }) => mapa.set(l.chave, l.valor));

  const p = CONFIG_COPILOTO_PADRAO;
  const duracaoPorTipo: Record<string, number> = {};
  Object.entries(p.duracaoPorTipo).forEach(([tipo, padrao]) => {
    duracaoPorTipo[tipo] = numero(mapa.get(`copiloto.duracao.${tipo}`), padrao);
  });

  return {
    duracaoPorTipo,
    maxRecomendacoes: {
      generoso: numero(mapa.get("copiloto.max_recomendacoes.generoso"), p.maxRecomendacoes.generoso),
      equilibrado: numero(mapa.get("copiloto.max_recomendacoes.equilibrado"), p.maxRecomendacoes.equilibrado),
      cirurgico: numero(mapa.get("copiloto.max_recomendacoes.cirurgico"), p.maxRecomendacoes.cirurgico)
    },
    diasParaModoCirurgico: numero(mapa.get("copiloto.dias_modo_cirurgico"), p.diasParaModoCirurgico),
    diasLivresMinimos: numero(mapa.get("copiloto.dias_livres_minimos"), p.diasLivresMinimos),
    maxDiasModificadosPorExecucao: numero(
      mapa.get("copiloto.max_dias_modificados"),
      p.maxDiasModificadosPorExecucao
    )
  };
}

/** Campos editáveis no admin, na ordem em que aparecem na tela. */
export const CAMPOS_CONFIG_COPILOTO: {
  chave: string;
  rotulo: string;
  ajuda: string;
  padrao: number;
}[] = [
  { chave: "copiloto.duracao.questoes",   rotulo: "Duração — bloco de questões (min)", ajuda: "Tempo estimado de uma missão de questões.", padrao: 40 },
  { chave: "copiloto.duracao.flashcards", rotulo: "Duração — flashcards (min)",        ajuda: "Tempo estimado de uma rodada de flashcards.", padrao: 25 },
  { chave: "copiloto.duracao.revisao",    rotulo: "Duração — revisão (min)",           ajuda: "Tempo estimado de uma revisão dirigida.", padrao: 30 },
  { chave: "copiloto.duracao.aula",       rotulo: "Duração — aula (min)",              ajuda: "Tempo estimado de uma videoaula.", padrao: 45 },
  { chave: "copiloto.duracao.simulado",   rotulo: "Duração — simulado (min)",          ajuda: "Tempo estimado de um simulado completo.", padrao: 90 },
  { chave: "copiloto.dias_modo_cirurgico", rotulo: "Dias para o modo cirúrgico",       ajuda: "A menos desta quantidade de dias até a prova, o Copiloto foca só no essencial.", padrao: 14 },
  { chave: "copiloto.dias_livres_minimos", rotulo: "Mínimo de dias livres",            ajuda: "Com menos dias livres que isto, o Copiloto também entra em modo cirúrgico.", padrao: 3 },
  { chave: "copiloto.max_dias_modificados", rotulo: "Máx. de dias alterados por rodada", ajuda: "Limite de dias que o Copiloto pode remanejar de uma vez.", padrao: 3 },
  { chave: "copiloto.max_recomendacoes.generoso",    rotulo: "Máx. recomendações — modo generoso",    ajuda: "Quando sobra tempo até a prova.", padrao: 8 },
  { chave: "copiloto.max_recomendacoes.equilibrado", rotulo: "Máx. recomendações — modo equilibrado", ajuda: "Ritmo normal.", padrao: 5 },
  { chave: "copiloto.max_recomendacoes.cirurgico",   rotulo: "Máx. recomendações — modo cirúrgico",   ajuda: "Reta final.", padrao: 3 }
];
