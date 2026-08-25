import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { validarCupom } from "@/lib/cupons/validar";
import { MENSAGEM_PLANO_NAO_ELEGIVEL } from "@/lib/cupons/planos-aplicaveis";

const bodySchema = z.object({
  codigo: z.string().min(1),
  planoId: z.string().uuid()
});

const MENSAGENS_ERRO: Record<string, string> = {
  nao_encontrado: "Cupom não encontrado.",
  inativo: "Este cupom não está mais ativo.",
  expirado: "Este cupom expirou.",
  limite_atingido: "Este cupom atingiu o limite de usos.",
  plano_nao_elegivel: MENSAGEM_PLANO_NAO_ELEGIVEL,
  // Não é recusa do cupom: é a plataforma dizendo que não conseguiu conferir.
  // Chamar isso de "cupom inválido" faz o aluno com um cupom legítimo pagar o
  // preço cheio ou desistir — e o parceiro perde a venda sem saber.
  falha_na_consulta: "Não foi possível verificar o cupom agora. Tente de novo em instantes."
};

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const supabase = createAdminClient();
  // `maybeSingle` para separar "plano não existe" de "a consulta falhou":
  // com `single`, as duas coisas chegam como erro e o cliente lê "plano não
  // encontrado" para um plano que existe.
  const { data: plano, error: erroPlano } = await supabase
    .from("planos")
    .select("preco_centavos")
    .eq("id", parsed.data.planoId)
    .eq("ativo", true)
    .maybeSingle();

  if (erroPlano) {
    console.error("Falha ao consultar o plano na prévia do cupom:", parsed.data.planoId, erroPlano.message);
    return NextResponse.json(
      { error: "Não foi possível verificar o cupom agora. Tente de novo em instantes." },
      { status: 503 }
    );
  }

  if (!plano) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  // O plano vai junto: um cupom pode valer só em alguns planos, e a prévia
  // precisa recusar exatamente o que o checkout vai recusar.
  const resultado = await validarCupom(supabase, parsed.data.codigo, plano.preco_centavos, parsed.data.planoId);

  if (!resultado.ok) {
    // 503 e não 400 quando a falha é nossa: 400 diz ao formulário "não adianta
    // repetir, corrija o que digitou" — e aqui não há nada a corrigir.
    const nossa = resultado.erro === "falha_na_consulta";
    return NextResponse.json({ error: MENSAGENS_ERRO[resultado.erro] }, { status: nossa ? 503 : 400 });
  }

  return NextResponse.json({
    descontoCentavos: resultado.resultado.descontoCentavos,
    valorFinalCentavos: resultado.resultado.valorFinalCentavos
  });
}
