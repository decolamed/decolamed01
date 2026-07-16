import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { validarCupom } from "@/lib/cupons/validar";

const bodySchema = z.object({
  codigo: z.string().min(1),
  planoId: z.string().uuid()
});

const MENSAGENS_ERRO: Record<string, string> = {
  nao_encontrado: "Cupom não encontrado.",
  inativo: "Este cupom não está mais ativo.",
  expirado: "Este cupom expirou.",
  limite_atingido: "Este cupom atingiu o limite de usos."
};

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: plano } = await supabase
    .from("planos")
    .select("preco_centavos")
    .eq("id", parsed.data.planoId)
    .eq("ativo", true)
    .single();

  if (!plano) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  const resultado = await validarCupom(supabase, parsed.data.codigo, plano.preco_centavos);

  if (!resultado.ok) {
    return NextResponse.json({ error: MENSAGENS_ERRO[resultado.erro] }, { status: 400 });
  }

  return NextResponse.json({
    descontoCentavos: resultado.resultado.descontoCentavos,
    valorFinalCentavos: resultado.resultado.valorFinalCentavos
  });
}
