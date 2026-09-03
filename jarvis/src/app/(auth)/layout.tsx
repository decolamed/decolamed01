export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-tinta-950 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-3xl font-bold tracking-tight text-white">
            Jarvis<span className="text-ciano-400">.</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-tinta-400">
            Seu assistente de estudos em medicina.
            <br />
            Conversa, pesquisa no PubMed e deixa tudo organizado.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-carta">{children}</div>
      </div>
    </main>
  );
}
