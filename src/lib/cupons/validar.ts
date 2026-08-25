import type { SupabaseClient } from "@supabase/supabase-js";
import type { Cupom } from "@/types/database";
import { cupomValeNoPlano } from "./planos-aplicaveis";

export interface ResultadoCupom {
  cupom: Cupom;
  descontoCentavos: number;
  valorFinalCentavos: number;
}

/**
 * `falha_na_consulta` não é uma recusa do cupom — é a plataforma admitindo
 * que não conseguiu conferir.
 *
 * Sem essa distinção, uma indisponibilidade de um segundo no banco virava
 * "cupom inválido ou expirado" na tela: o aluno com um cupom legítimo ou
 * desistia da compra, ou pagava o preço cheio. E o parceiro perdia a venda
 * sem nunca saber que ela existiu.
 */
export type ErroCupom =
  | "nao_encontrado"
  | "inativo"
  | "expirado"
  | "limite_atingido"
  | "plano_nao_elegivel"
  | "falha_na_consulta";

/**
 * Valida um cupom e calcula o desconto SEMPRE no servidor — nunca confiamos
 * no valor final calculado pelo cliente. Chamado tanto por /api/cupons/validar
 * (preview em tempo real no formulário) quanto por /api/matricula (checkout).
 */
export async function validarCupom(
  supabase: SupabaseClient,
  codigo: string,
  valorOriginalCentavos: number,
  // Em qual plano o cupom está sendo usado. Opcional na assinatura para não
  // quebrar quem já chamava, mas quem valida uma compra DEVE passar: um cupom
  // restrito sem plano informado é recusado (ver `cupomValeNoPlano`).
  planoId?: string | null
): Promise<{ ok: true; resultado: ResultadoCupom } | { ok: false; erro: ErroCupom }> {
  // `maybeSingle` e não `single`: com `single`, "não existe" também chega como
  // erro (PGRST116), e aí não há como separar o cupom que não existe da
  // consulta que falhou — que é exatamente a separação que importa aqui.
  const { data: cupom, error } = await supabase
    .from("cupons")
    .select("*")
    .eq("codigo", codigo.trim().toUpperCase())
    .maybeSingle();

  if (error) {
    console.error("Falha ao consultar o cupom:", codigo, error.message);
    return { ok: false, erro: "falha_na_consulta" };
  }
  if (!cupom) return { ok: false, erro: "nao_encontrado" };
  if (!cupom.ativo) return { ok: false, erro: "inativo" };
  if (cupom.valido_ate && new Date(cupom.valido_ate) < new Date()) return { ok: false, erro: "expirado" };
  if (cupom.limite_usos !== null && cupom.usos >= cupom.limite_usos) return { ok: false, erro: "limite_atingido" };
  // A restrição por plano vem depois das outras: um cupom expirado E fora do
  // plano deve dizer "expirado", que é a informação que o cliente consegue
  // agir sobre.
  if (!cupomValeNoPlano((cupom as { planos_aplicaveis?: unknown }).planos_aplicaveis, planoId)) {
    return { ok: false, erro: "plano_nao_elegivel" };
  }

  const descontoCentavos =
    cupom.tipo === "percentual"
      ? Math.round((valorOriginalCentavos * cupom.valor) / 100)
      : Math.round(cupom.valor * 100);

  const valorFinalCentavos = Math.max(0, valorOriginalCentavos - descontoCentavos);

  return {
    ok: true,
    resultado: { cupom: cupom as Cupom, descontoCentavos, valorFinalCentavos }
  };
}
