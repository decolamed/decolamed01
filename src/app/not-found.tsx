import Link from "next/link";

// Cobre qualquer notFound() chamado em qualquer parte do app, além de
// qualquer URL que simplesmente não exista. Sem este arquivo, o Next usa a
// página 404 padrão dele, que pode ficar difícil de ler dependendo do fundo
// da área (o site público usa fundo azul-escuro, por exemplo).
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky px-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <h1 className="font-display text-2xl font-bold text-navy-dark">Página não encontrada</h1>
        <p className="mt-2 text-sm text-navy-dark/70">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Ir para o login
        </Link>
      </div>
    </div>
  );
}
