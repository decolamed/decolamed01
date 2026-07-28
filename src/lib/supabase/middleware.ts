// Usado pelo middleware.ts na raiz para renovar a sessão a cada requisição
// e disponibilizar o usuário logado para as rotas protegidas.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        }
      }
    }
  );

  // getUser() valida o token direto com o servidor de auth (por isso é
  // mais seguro que ler só o JWT local) — mas quando o refresh token do
  // cookie já foi invalidado (girou em outra aba/requisição concorrente,
  // ou expirou de verdade), a própria biblioteca lança em vez de devolver
  // um erro comum. Sem este try/catch, isso vira um erro 500 não tratado
  // em vez de simplesmente pedir login de novo — exatamente o sintoma de
  // "a sessão quebra sozinha" relatado. signOut() limpa os cookies
  // inválidos, senão a mesma requisição quebrada se repete pra sempre.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (e) {
    console.error("Sessão inválida, tratando como deslogado:", e);
    await supabase.auth.signOut();
  }

  return { response, user, supabase };
}
