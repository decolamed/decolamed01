import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { destinoDoLink } from "@/lib/auth/destino-do-link";

// ============================================================================
// ENTRADA DOS LINKS DE E-MAIL (convite do aluno e recuperação de senha)
//
// O Supabase manda o aluno para cá com o resultado do link, mas o FORMATO
// desse resultado muda conforme quem pediu o e-mail — e essa é a origem do
// "Esse link expirou ou já foi usado" que aparecia sempre:
//
//   1. PKCE  — "?code=..."
//      Acontece quando o próprio aluno pede pela tela "Esqueci minha senha".
//      O navegador dele guarda o verificador, e a troca por sessão precisa
//      acontecer aqui no servidor, via exchangeCodeForSession.
//
//   2. token_hash — "?token_hash=...&type=recovery"
//      Formato novo do Supabase. Não depende de nada guardado no navegador,
//      então funciona mesmo se o link for aberto em outro aparelho.
//
//   3. IMPLÍCITO — "#access_token=...&refresh_token=..."
//      Acontece quando o e-mail é disparado pelo PAINEL ADMIN (server action:
//      "Enviar acesso", "Redefinir senha") ou pelo webhook do Asaas. Aí não
//      existe navegador pedindo, logo não existe PKCE — e o Supabase devolve
//      os tokens no FRAGMENTO da URL.
//
//      Fragmento nunca é enviado ao servidor. Este arquivo é código de
//      servidor. Por isso o antigo `searchParams.get("code")` vinha vazio e
//      o aluno era mandado direto para a tela de erro — mesmo com um link
//      perfeitamente válido, recém-criado. Não era expiração: era um caso
//      que o servidor é incapaz de enxergar.
//
//      Como praticamente todo aluno nasce por convite do admin ou do
//      webhook, este era o caminho da maioria.
//
// Para o caso 3 quem resolve é /auth/finalizar, uma página de navegador que
// consegue ler o fragmento. Mandamos para lá em vez de declarar o link
// inválido — a página é que decide, depois de olhar o que realmente veio.
// ============================================================================

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = destinoDoLink(searchParams.get("next"));

  // O próprio Supabase avisa quando o link é velho de verdade. Nesse caso
  // não há o que tentar — e a mensagem dele é mais precisa que a nossa.
  const erroDoSupabase = searchParams.get("error_description") ?? searchParams.get("error");
  if (erroDoSupabase) {
    console.error("Link de e-mail recusado pelo Supabase:", erroDoSupabase);
    return NextResponse.redirect(`${origin}/recuperar-senha?erro=link_invalido`);
  }

  const supabase = createClient();

  // ---- Caso 1: PKCE --------------------------------------------------------
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    // Falha comum e legítima: o link foi aberto em outro aparelho ou outro
    // navegador, onde o verificador do PKCE não existe. Registramos o motivo
    // real em vez de engoli-lo — foi essa falta de log que fez o problema
    // durar tanto.
    console.error("Troca do código PKCE falhou:", error.message);
  }

  // ---- Caso 2: token_hash --------------------------------------------------
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type");
  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: tipo as "recovery" | "invite" | "email" | "signup" | "magiclink"
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("Verificação do token_hash falhou:", error.message);
  }

  // ---- Caso 3: pode estar no fragmento -------------------------------------
  // Sem code e sem token_hash, ainda NÃO dá para dizer que o link é inválido:
  // o servidor simplesmente não enxerga o fragmento. Quem decide é o navegador.
  return NextResponse.redirect(`${origin}/auth/finalizar?next=${encodeURIComponent(next)}`);
}
