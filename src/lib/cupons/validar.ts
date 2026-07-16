import type { SupabaseClient } from "@supabase/supabase-js";
import type { Cupom } from "@/types/database";

export interface ResultadoCupom {
  cupom: Cupom;
  descontoCentavos: number;
  valorFinalCentavos: number;
}

export type ErroCupom = "nao_encontrado" | "inativo" | "expirado" | "limite_atingido";

/**
 * Valida um cupom e calcula o desconto SEMPRE no servidor — nunca confiamos
 * no valor final calculado pelo cliente. Chamado tanto por /api/cupons/validar
 * (preview em tempo real no formulário) quanto por /api/matricula (checkout).
 */
export async function validarCupom(
  supabase: SupabaseClient,
  codigo: string,
  valorOriginalCentavos: number
): Promise<{ ok: true; resultado: ResultadoCupom } | { ok: false; erro: ErroCupom }> {
  const { data: cupom } = await supabase
    .from("cupons")
    .select("*")
    .eq("codigo", codigo.trim().toUpperCase())
    .single();

  if (!cupom) return { ok: false, erro: "nao_encontrado" };
  if (!cupom.ativo) return { ok: false, erro: "inativo" };
  if (cupom.valido_ate && new Date(cupom.valido_ate) < new Date()) return { ok: false, erro: "expirado" };
  if (cupom.limite_usos !== null && cupom.usos >= cupom.limite_usos) return { ok: false, erro: "limite_atingido" };

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
