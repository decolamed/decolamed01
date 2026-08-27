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
// `justify-center` com `py-8`: o bloco fica centrado quando cabe, e a folga
// vertical garante respiro quando o teclado do celular sobe e a área visível
// encolhe.
// ============================================================================
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-dvh flex-col justify-center px-5 py-8"
      style={{
        background: "radial-gradient(1200px 700px at 50% -10%, #0e3a5c 0%, #0a2438 60%, #071a2a 100%)"
      }}
    >
      <div className="mx-auto w-full max-w-md">
        <div className="mb-7 flex justify-center sm:mb-9">
          <Image
            src="/assets/logo-marca.png"
            alt="Decola Med"
            width={803}
            height={333}
            priority
            // A largura manda; a altura acompanha. Assim a marca cresce no
            // celular sem virar um bloco desproporcional no desktop.
            className="h-auto w-56 sm:w-64"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
