import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Renova a sessão a cada navegação e decide quem entra onde. Sem isto, o token
// do Supabase expira no meio do uso e o aluno é jogado para fora no meio de uma
// conversa, sem nenhuma explicação.
export async function middleware(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          // A resposta é recriada DEPOIS de atualizar os cookies do pedido:
          // é isso que faz o Server Component desta mesma navegação enxergar
          // a sessão já renovada, em vez da anterior.
          resposta = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
        }
      }
    }
  );

  // `getUser` e não `getSession`: só o primeiro valida o token contra o
  // servidor do Supabase. O segundo confia no cookie, que é justamente o que
  // não se pode fazer numa decisão de acesso.
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;
  const ehAreaPublica =
    caminho === "/" ||
    caminho.startsWith("/entrar") ||
    caminho.startsWith("/criar-conta") ||
    caminho.startsWith("/auth");

  if (!user && !ehAreaPublica) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    // Guarda onde a pessoa queria chegar, para levá-la até lá depois do login
    // em vez de despejá-la na home.
    destino.searchParams.set("destino", caminho);
    return NextResponse.redirect(destino);
  }

  if (user && (caminho === "/" || caminho.startsWith("/entrar") || caminho.startsWith("/criar-conta"))) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/tutorias";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return resposta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
