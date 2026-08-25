import type { ReactNode } from "react";

// ============================================================================
// AS AÇÕES DE CADASTRO, NO TOPO DA TELA
//
// Os formulários de "adicionar aluno" e "adicionar professor" ficavam DEPOIS
// da tabela de usuários. Com dezenas de contas isso já era uma rolagem longa;
// com milhares, a ação some — e a tela de Usuários passa a ser uma tela de
// leitura, com o cadastro escondido no fim de uma lista que só cresce.
//
// Aqui eles viram botões no topo que abrem o formulário no lugar. `<details>`
// e não um componente de cliente com estado: a expansão é exatamente o que o
// elemento faz nativamente, com teclado e leitor de tela funcionando de
// graça, e sem transformar a página inteira num bundle de cliente por causa
// de um `useState`.
//
// Fechado, ocupa a largura de um botão; aberto, toma a linha inteira
// (`[&[open]]:w-full`) para o formulário não ficar espremido em um terço da
// tela ao lado dos outros dois.
// ============================================================================

export function AcaoDeCadastro({
  titulo,
  descricao,
  children
}: {
  /** O texto do botão. Curto — ele fica ao lado de outros dois. */
  titulo: string;
  /** O que essa ação faz, lido só depois de abrir. */
  descricao: string;
  children: ReactNode;
}) {
  return (
    <details className="group w-full rounded-2xl border border-navy-dark/10 bg-white shadow-sm sm:w-auto [&[open]]:w-full">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl px-5 py-3.5 font-display text-sm font-bold text-navy-dark hover:bg-navy/5">
        <span className="text-lg leading-none text-orange">+</span>
        {titulo}
        <span className="ml-auto text-navy-dark/30 transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="border-t border-navy-dark/10 p-5">
        <p className="text-sm text-navy-dark/60">{descricao}</p>
        <div className="mt-4">{children}</div>
      </div>
    </details>
  );
}
