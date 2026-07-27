import { NextResponse } from "next/server";
import { gerarCronogramaAdaptativo } from "@/lib/copiloto/motor";

// Rota de TESTE — só funciona em desenvolvimento ou se acessada pelo admin.
// Remover em produção real ou proteger com verificação de admin.
export async function GET() {
  const ALUNO_TESTE = "6fa84225-5341-4be2-aae0-70c8e8d0e626";

  try {
    const resultado = await gerarCronogramaAdaptativo(ALUNO_TESTE);
    return NextResponse.json(resultado, { status: 200 });
  } catch (e) {
    return NextResponse.json({ erro: String(e) }, { status: 500 });
  }
}
