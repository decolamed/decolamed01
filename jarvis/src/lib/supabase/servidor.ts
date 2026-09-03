import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Cliente para Server Components, Server Actions e Route Handlers.
 *
 * Roda com a chave anônima e o cookie de sessão do usuário — ou seja, TODA
 * consulta feita por aqui passa pela RLS. É o cliente padrão: a regra é usar
 * este em tudo, e só descer para o `admin` quando houver um motivo escrito.
 */
export function criarClienteServidor() {
  const armazem = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return armazem.getAll();
        },
        setAll(cookiesParaGravar: Array<{ name: string; value: string; options: CookieOptions }>) {
          try {
            cookiesParaGravar.forEach(({ name, value, options }) =>
              armazem.set(name, value, options)
            );
          } catch {
            // Server Component não pode gravar cookie. Não é erro: o
            // middleware já renovou a sessão antes de chegar aqui.
          }
        }
      }
    }
  );
}
