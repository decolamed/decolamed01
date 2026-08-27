import Image from "next/image";

// ============================================================================
// LOGIN, RECUPERAR SENHA E REDEFINIR SENHA
//
// A marca em cima, o cartão branco embaixo — e os dois JUNTOS, centrados na
// tela como um bloco só.
//
// COMO ERA
// --------
// A faixa da logo tinha `flex-1`: ela esticava e ocupava toda a altura que
// sobrava, empurrando o cartão para o rodapé. Num celular alto o resultado
// era uma logo pequena boiando no meio de um vazio enorme e o formulário
// espremido na barra de navegação — que foi exatamente o que apareceu na
// tela de um aluno.
//
// A logo também era fixa em 96px — e o arquivo engana. `logo.png` é 900×900,
// mas o desenho ocupa 802×332 dentro dele: 37% da altura, o resto é
// transparência (252px em cima, 316px embaixo). Uma caixa de 96px renderia
// uma marca de ~35px de altura. Era essa a "logo pequena".
//
// `logo-marca.png` é o MESMO desenho, pixel a pixel, sem a margem morta em
// volta. Fica só aqui: o `logo.png` quadrado continua servindo o painel, o
// ícone do app e tudo o mais que já o usa.
//
// DUAS DECISÕES QUE PARECEM DETALHE
// ---------------------------------
// `min-h-dvh` e não `min-h-screen`: no celular, `100vh` conta a altura da
// janela COM a barra do navegador recolhida, então sobra altura que não
// existe na tela e o conteúdo é empurrado para baixo do que se vê. `dvh`
// acompanha a altura real.
//
// A FOLGA É MAIOR EMBAIXO, DE PROPÓSITO: `pt-6 pb-16`.
//
// Com padding igual dos dois lados o bloco fica geometricamente centrado e
// ainda assim parece baixo — em parte porque olho lê o centro um pouco acima
// do meio real, em parte porque no Android a área da página se estende por
// baixo da barra de navegação do sistema, que rouba do fundo um pedaço que a
// conta não enxerga. Mais respiro embaixo empurra o bloco para cima e
// devolve o equilíbrio na tela de verdade.
// ============================================================================
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-dvh flex-col justify-center px-5 pb-16 pt-6"
      style={{
        background: "radial-gradient(1200px 700px at 50% -10%, #0e3a5c 0%, #0a2438 60%, #071a2a 100%)"
      }}
    >
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex justify-center sm:mb-7">
          <Image
            src="/assets/logo-marca.png"
            alt="Decola Med"
            width={803}
            height={333}
            priority
            // A largura manda; a altura acompanha. Assim a marca cresce no
            // celular sem virar um bloco desproporcional no desktop.
            className="h-auto w-40 sm:w-48"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
