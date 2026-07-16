// Next.js mostra este componente automaticamente enquanto a Server Component
// da rota está buscando dados (fetch em Server Components ativa Suspense
// automaticamente no App Router) — evita tela em branco durante navegação.
export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex items-center gap-3 text-navy-dark/60">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy-dark/20 border-t-navy-dark" />
        <span className="text-sm font-semibold">Carregando...</span>
      </div>
    </div>
  );
}
