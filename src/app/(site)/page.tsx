import Image from "next/image";
import { LinkButton } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      {/* "Sobre a plataforma": página única com a arte de vendas completa.
          A imagem já traz toda a narrativa (hero, diferenciais, checklist,
          corretor de redação etc.) — o aluno rola a página inteira.
          Os CTAs abaixo são reais (a navbar fixa no topo também tem um). */}
      <Image
        src="/assets/sobre-plataforma.webp"
        alt="Decola Med — sua aprovação em Medicina começa aqui"
        width={683}
        height={7303}
        priority
        className="mx-auto h-auto w-full max-w-[520px]"
      />

      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-5 py-12 text-center">
        <LinkButton href="/planos">Quero agora</LinkButton>
        <p className="text-xs uppercase tracking-widest text-white/50">Clique para acessar</p>
      </div>
    </>
  );
}
