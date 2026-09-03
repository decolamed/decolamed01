import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Para onde o Supabase manda a pessoa depois que ela clica no link de
// confirmação do e-mail. Aqui o código de uso único vira sessão.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const codigo = searchParams.get("code");

  if (codigo) {
    const supabase = criarClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(`${origin}/tutorias`);
  }

  return NextResponse.redirect(`${origin}/entrar?erro=confirmacao`);
}
