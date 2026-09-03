import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { sair } from "@/app/(auth)/acoes";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const supabase = criarClienteServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome")
    .eq("id", user.id)
    .maybeSingle<{ nome: string }>();

  const primeiroNome = (perfil?.nome || user.email || "").split(/[\s@]/)[0];

  return (
    <div className="min-h-screen">
      {/* `nao-imprimir`: ao salvar um resumo em PDF, a barra não vai junto. */}
      <header className="nao-imprimir sticky top-0 z-20 border-b border-tinta-800 bg-tinta-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
          <Link href="/tutorias" className="text-lg font-bold tracking-tight text-white">
            Jarvis<span className="text-ciano-400">.</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/tutorias"
              className="rounded-md px-3 py-1.5 text-tinta-300 transition hover:bg-tinta-800 hover:text-white"
            >
              Tutorias
            </Link>
            <Link
              href="/configuracoes"
              className="rounded-md px-3 py-1.5 text-tinta-300 transition hover:bg-tinta-800 hover:text-white"
            >
              Configurações
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-tinta-400 sm:inline">{primeiroNome}</span>
            <form action={sair}>
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm text-tinta-400 transition hover:bg-tinta-800 hover:text-white"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
