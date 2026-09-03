import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { bancoConfigurado } from "@/lib/config";

// Renova a sessão a cada navegação e decide quem entra onde. Sem isto, o token
// do Supabase expira no meio do uso e o aluno é jogado para fora no meio de uma
// conversa, sem nenhuma explicação.
export async function middleware(request: NextRequest) {
  const caminhoPedido = request.nextUrl.pathname;

  // Antes de qualquer coisa: sem as chaves do Supabase, `createServerClient`
  // abaixo estoura com um erro sobre URL inválida, e TODA página do app vira
  // tela de erro — inclusive a que explicaria o problema. Então a checagem
  // vem primeiro, e manda para o guia de instalação.
  if (!bancoConfigurado()) {
    // As duas telas que existem PARA este momento não podem ser redirecionadas
    // por ele: o guia ensina o que fazer e o diagnóstico diz o que está
    // faltando. Mandar o diagnóstico para o guia seria esconder a resposta.
    const ehTelaDeSocorro =
      caminhoPedido === "/comece-aqui" || caminhoPedido.startsWith("/diagnostico");
    if (ehTelaDeSocorro) return NextResponse.next();

    const destino = request.nextUrl.clone();
    destino.pathname = "/comece-aqui";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

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

  const caminho = caminhoPedido;
  const ehAreaPublica =
    caminho === "/" ||
    caminho.startsWith("/entrar") ||
    caminho.startsWith("/criar-conta") ||
    caminho.startsWith("/comece-aqui") ||
    // O diagnóstico é público de propósito: se o login estiver quebrado,
    // exigir login para chegar à tela que explica o que quebrou seria a
    // definição de inútil.
    caminho.startsWith("/diagnostico") ||
    caminho.startsWith("/auth");

  // A raiz é pública, mas para quem não entrou ela não tem nada — e deixar o
  // `page.tsx` mandar para /tutorias só para o middleware devolver para
  // /entrar gasta uma viagem extra a cada visita.
  if (!user && caminho === "/") {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

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
