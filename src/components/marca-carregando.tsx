import Image from "next/image";

// Azul da marca. É o MESMO valor de `background_color` no manifesto do PWA
// (src/app/manifest.webmanifest/route.ts) e de `themeColor` no layout raiz —
// e essa igualdade é funcional, não estética. Ver o comentário da splash.
export const AZUL_MARCA = "#01395E";

/**
 * Identidade única de carregamento: logo da Decola Med sobre o azul da marca.
 *
 * Existe para que toda espera da plataforma tenha a mesma cara. Antes, a
 * abertura mostrava a splash azul e as navegações internas mostravam um
 * spinner cinza sobre fundo branco — duas linguagens visuais diferentes para
 * a mesma coisa.
 */
export function MarcaCarregando({
  tamanhoLogo = 220,
  comAssinatura = true
}: {
  tamanhoLogo?: number;
  comAssinatura?: boolean;
}) {
  return (
    <>
      <div style={{ width: tamanhoLogo, maxWidth: "60vw" }}>
        <Image
          src="/assets/logo-decola-med.png"
          alt="Decola Med"
          width={2000}
          height={2000}
          priority
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      {comAssinatura && (
        <div style={{ width: tamanhoLogo / 2, maxWidth: "30vw", marginTop: 18 }}>
          {/* `alt=""` de propósito: a assinatura é ornamento, e a marca já foi
              anunciada pela logo acima. O que decide isto não é acessibilidade
              e sim o MODO DE FALHAR — com um alt escrito, uma imagem que não
              carrega vira ícone quebrado com "By Decola" ao lado, bem no meio
              da abertura que o visitante vê primeiro. Foi o que aconteceu. Sem
              alt, a mesma falha simplesmente não aparece. */}
          <Image
            src="/assets/logo-by-decola.png"
            alt=""
            width={3000}
            height={2120}
            priority
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
    </>
  );
}

/**
 * Tela de espera usada pelos `loading.tsx` de rota.
 *
 * Ocupa a área de conteúdo (não a tela inteira) de propósito: estes
 * carregamentos acontecem durante navegação interna, com a barra lateral já
 * na tela. Cobrir tudo de azul a cada clique seria mais agressivo do que a
 * espera justifica — a unificação pedida é de identidade visual, não de
 * transformar toda navegação numa abertura de app.
 */
export function CarregandoRota({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="w-16 opacity-90">
        <Image
          src="/assets/logo-decola-med.png"
          alt=""
          width={2000}
          height={2000}
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      <div className="flex items-center gap-2.5 text-navy-dark/60">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-dark/20 border-t-navy-dark" />
        <span className="text-sm font-semibold">{texto}</span>
      </div>
    </div>
  );
}
