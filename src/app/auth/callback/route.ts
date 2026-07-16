import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// O app usa @supabase/ssr (createBrowserClient), que por padrão usa o fluxo
// PKCE: o link de e-mail (recuperação de senha OU convite de aluno) chega
// com "?code=..." na URL, e esse código só vira sessão de fato se for
// trocado AQUI, no servidor, via exchangeCodeForSession — o supabase-js no
// navegador não faz isso sozinho. Configure esta URL como redirectTo em
// resetPasswordForEmail() e em inviteUserByEmail().
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/redefinir-senha";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Código ausente, inválido ou expirado — manda de volta para o pedido de
  // recuperação com um aviso, em vez de deixar o usuário numa página de
  // "criar senha" sem sessão (que falharia silenciosamente ao salvar).
  return NextResponse.redirect(`${origin}/recuperar-senha?erro=link_invalido`);
}
