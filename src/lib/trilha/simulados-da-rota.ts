import type { SimuladoDisponivel } from "./rota";

// ============================================================================
// QUAIS SIMULADOS A ROTA DO VOO GUIADO USA
//
// Antes: os dois simulados mais antigos da tabela, por `created_at`. O
// administrador não escolhia nada — cadastrar um simulado novo não dava jeito
// de usá-lo, e a ordem dependia de um campo que não foi criado para isso.
// Pior: com um único simulado utilizável, o fallback `simulados[ordem - 1] ??
// simulados[0]` fazia os DOIS dias abrirem o mesmo simulado, sem avisar
// ninguém.
//
// Agora quem escolhe é o admin, em /admin/configuracoes, sob as chaves
// `voo_guiado.simulado_1_id` e `voo_guiado.simulado_2_id`. Isto é separado
// dos itens de simulado do cronograma padrão (trilha_dias), que continuam
// valendo só para o plano Decolando — os dois sistemas não se tocam.
//
// O POSICIONAMENTO não muda: `posicionarSimulados` continua decidindo em que
// dia cada um cai. Aqui só se decide QUAL simulado é.
//
// ─── A regra difícil: o aluno que já tem rota ────────────────────────────
//
// A rota é regerada a cada leitura da tela (ver rota-persistencia.ts). Se a
// escolha viesse direto da configuração, trocar o simulado no painel trocaria
// o simulado de todo mundo no meio do caminho — inclusive de quem já o fez.
//
// Por isso a atribuição é FIXADA por aluno, em `aluno_simulados_rota`, na
// primeira vez que a rota dele é gerada. Daí em diante:
//
//   • simulado já REALIZADO      → fica, para sempre. Nunca é substituído,
//                                  nem se for desativado no painel.
//   • fixado e ainda utilizável  → fica. Mudar a configuração vale para os
//                                  próximos alunos, não para este.
//   • fixado e inutilizável, sem → substitui pelo que está configurado hoje.
//     tentativa                    É a ÚNICA regra de substituição: sem ela o
//                                  dia ficaria apontando para um simulado
//                                  apagado ou vazio.
//   • sem nada fixado            → usa a configuração atual e fixa.
//
// Módulo puro de propósito: esta é a parte que precisa de teste, e ela não
// depende de banco nenhum. Quem lê e grava é `rota-persistencia.ts`.
// ============================================================================

/** As duas posições de simulado que toda rota tem. */
export const ORDENS_DE_SIMULADO = [1, 2] as const;

/** Chave em `configuracoes` do simulado de uma das posições. */
export function chaveDoSimulado(ordem: number): string {
  return `voo_guiado.simulado_${ordem}_id`;
}

/** As duas chaves, na ordem — para ler tudo numa consulta só. */
export const CHAVES_DOS_SIMULADOS: string[] = ORDENS_DE_SIMULADO.map(chaveDoSimulado);

/** Um simulado do catálogo, como a decisão precisa vê-lo. */
export interface SimuladoDoCatalogo {
  id: string;
  titulo: string;
  /** Ativo E com questões (ou redação) — a mesma régua da aba Atividades. */
  utilizavel: boolean;
}

export interface EntradaDaDecisao {
  /** O que o admin escolheu, por ordem. Ausente/vazio = não configurado. */
  configurados: Record<number, string | null>;
  /** O que já está fixado para ESTE aluno, por ordem. */
  fixados: Record<number, string | null>;
  /** Todos os simulados, inclusive os desativados — indexados por id. */
  catalogo: Map<string, SimuladoDoCatalogo>;
  /** Ids de simulado que este aluno já realizou (simulado_tentativas). */
  realizados: Set<string>;
}

export type MotivoDaEscolha =
  | "fixado-realizado"
  | "fixado"
  | "substituido"
  | "novo"
  | "sem-configuracao";

export interface EscolhaDeSimulado {
  ordem: number;
  simulado: SimuladoDisponivel | null;
  motivo: MotivoDaEscolha;
}

export interface DecisaoDosSimulados {
  /** Índice 0 = ordem 1, índice 1 = ordem 2. Pode conter null. */
  simulados: (SimuladoDisponivel | null)[];
  /** O que precisa ser gravado em `aluno_simulados_rota`. */
  aFixar: { ordem: number; simuladoId: string }[];
  /** Uma linha por ordem, para log e para a tela do admin. */
  escolhas: EscolhaDeSimulado[];
}

function comoDisponivel(s: SimuladoDoCatalogo): SimuladoDisponivel {
  return { id: s.id, titulo: s.titulo };
}

/**
 * Decide qual simulado vai em cada uma das duas posições da rota.
 *
 * Determinístico e sem efeito colateral: a gravação dos novos vínculos sai
 * em `aFixar`, para quem chamou decidir quando escrever.
 *
 * Nunca repete um simulado por acidente. Se a posição 2 não tiver simulado
 * configurado, ela volta `null` — o dia continua existindo e leva o aluno à
 * lista de simulados, em vez de repetir silenciosamente o da posição 1.
 * (Se o admin escolher o MESMO simulado nas duas posições, aí é escolha
 * explícita dele e é respeitada; a tela do admin avisa.)
 */
export function decidirSimuladosDaRota(entrada: EntradaDaDecisao): DecisaoDosSimulados {
  const { configurados, fixados, catalogo, realizados } = entrada;
  const escolhas: EscolhaDeSimulado[] = [];
  const aFixar: { ordem: number; simuladoId: string }[] = [];

  ORDENS_DE_SIMULADO.forEach((ordem) => {
    const fixado = fixados[ordem] ?? null;
    const doCatalogo = fixado ? catalogo.get(fixado) ?? null : null;

    // 1. Já realizado: intocável. Vale mesmo se o simulado tiver sido
    //    desativado depois — o aluno fez AQUELE, e o cronograma dele tem de
    //    continuar dizendo a verdade sobre o que ele fez.
    if (fixado && realizados.has(fixado) && doCatalogo) {
      escolhas.push({ ordem, simulado: comoDisponivel(doCatalogo), motivo: "fixado-realizado" });
      return;
    }

    // 2. Fixado e ainda utilizável: fica. Trocar a configuração no painel
    //    não mexe em cronograma que já está rodando.
    if (doCatalogo?.utilizavel) {
      escolhas.push({ ordem, simulado: comoDisponivel(doCatalogo), motivo: "fixado" });
      return;
    }

    // 3. Sem vínculo aproveitável — cai para a configuração atual. Só entra
    //    o que o aluno consegue de fato abrir: reservar o dia para um
    //    simulado vazio o mandaria a uma tela sem questões justamente no dia
    //    marcado para fazer a prova.
    const configurado = configurados[ordem] ?? null;
    const novo = configurado ? catalogo.get(configurado) ?? null : null;
    if (!novo?.utilizavel) {
      escolhas.push({ ordem, simulado: null, motivo: "sem-configuracao" });
      return;
    }

    aFixar.push({ ordem, simuladoId: novo.id });
    escolhas.push({
      ordem,
      simulado: comoDisponivel(novo),
      // "substituido" quando havia um vínculo que deixou de servir — é o
      // único caso em que a rota de um aluno troca de simulado sozinha, e
      // por isso ele é nomeado à parte.
      motivo: fixado ? "substituido" : "novo"
    });
  });

  return {
    simulados: escolhas.map((e) => e.simulado),
    aFixar,
    escolhas
  };
}

/** Lê os ids configurados a partir das linhas de `configuracoes`. */
export function lerSimuladosConfigurados(
  linhas: { chave: string; valor: unknown }[] | null | undefined,
  desembrulhar: (valor: unknown) => string
): Record<number, string | null> {
  const escolhidos: Record<number, string | null> = {};
  ORDENS_DE_SIMULADO.forEach((ordem) => {
    escolhidos[ordem] = null;
  });
  (linhas ?? []).forEach(({ chave, valor }) => {
    const m = /^voo_guiado\.simulado_(\d+)_id$/.exec(chave);
    if (!m) return;
    const ordem = Number(m[1]);
    if (!ORDENS_DE_SIMULADO.includes(ordem as 1 | 2)) return;
    const texto = desembrulhar(valor).trim();
    escolhidos[ordem] = texto || null;
  });
  return escolhidos;
}
