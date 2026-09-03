import { createBrowserClient } from "@supabase/ssr";

/** Cliente do navegador. Só a chave anônima — nunca a service role. */
export function criarClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
