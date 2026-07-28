import Image from "next/image";

// Layout compartilhado por login, recuperar-senha e redefinir-senha: a área
// azul superior é só a marca (logo), sem nenhum cartão/retângulo por trás
// dela — o cartão branco abaixo é reservado exclusivamente pros campos de
// cada formulário, que continuam vindo de `children`.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background: "radial-gradient(1200px 700px at 50% -10%, #0e3a5c 0%, #0a2438 60%, #071a2a 100%)"
      }}
    >
      <div className="flex flex-1 items-center justify-center px-5 pb-10 pt-16 sm:pt-20">
        <Image src="/assets/logo.png" alt="Decola Med" width={96} height={96} priority />
      </div>
      <div className="flex justify-center px-5 pb-10 sm:pb-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
