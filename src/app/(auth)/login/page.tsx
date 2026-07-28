import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">
      <div className="flex justify-center">
        <Image src="/assets/logo.png" alt="Decola Med" width={72} height={72} />
      </div>
      <h1 className="mt-4 text-center font-display text-2xl font-bold text-navy-dark">Entrar</h1>

      {/* useSearchParams (usado no form para ler ?redirect=) exige um
          Suspense boundary para não quebrar o prerender estático. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
