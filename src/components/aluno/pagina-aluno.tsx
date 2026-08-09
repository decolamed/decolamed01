import Link from "next/link";
import type { ReactNode } from "react";

// ============================================================================
// MOLDURA DAS PÁGINAS AVULSAS DO ALUNO (itens 10 e 11)
//
// Raio-X e Desempenho são rotas próprias do Next, fora do app imersivo
// (decola-app.tsx), e por isso cresceram sem moldura nenhuma: fundo branco
// herdado do body, título colado no topo, emoji no lugar de ícone e um
// "Voltar ao painel" que era só um link de texto. Ao lado do resto da
// plataforma — toda em azul navy — pareciam páginas de outro produto.
//
// Este componente dá a elas a mesma casca: fundo #01395E, título centralizado
// com respiro, laranja #F36C21 nos elementos de ação e Montserrat (que já é a
// fonte de toda a plataforma, via --font-baloo / --font-nunito no layout raiz).
//
// É só moldura. Nada aqui sabe o que as páginas calculam ou mostram — a
// estrutura, a lógica e o conteúdo delas continuam exatamente como estavam.
// ============================================================================

export function PaginaAluno({
  titulo,
  descricao,
  children
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy">
      {/* Cabeçalho: o botão de voltar fica numa linha própria, e o título
          ganha espaço acima e abaixo — antes ele nascia colado no canto
          superior, disputando lugar com o link de voltar. */}
      <header className="mx-auto w-full max-w-4xl px-5 pb-2 pt-6 sm:px-8 sm:pt-8">
        <Link
          href="/aluno"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white/80 transition hover:border-orange hover:bg-orange hover:text-white"
        >
          <span aria-hidden>←</span> Voltar ao painel
        </Link>

        <div className="mt-6 text-center sm:mt-8">
          <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">{titulo}</h1>
          {descricao && (
            <p className="mx-auto mt-2.5 max-w-2xl text-sm leading-relaxed text-white/65">{descricao}</p>
          )}
          <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-orange" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 pb-16 pt-6 sm:px-8">{children}</main>
    </div>
  );
}

/**
 * Cartão branco sobre o fundo navy. Mesmo arredondamento e sombra dos
 * cartões do app, para as duas telas não parecerem de produtos diferentes.
 */
export function CartaoAluno({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-6 shadow-lg shadow-black/10 ${className}`}>{children}</div>;
}
