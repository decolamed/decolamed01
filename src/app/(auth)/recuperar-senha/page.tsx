import { Suspense } from "react";
import { RecuperarSenhaForm } from "@/components/auth/recuperar-senha-form";

export default function RecuperarSenhaPage() {
  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
      <h1 className="font-display text-2xl font-bold text-navy-dark">Recuperar senha</h1>

      {/* useSearchParams (para ler ?erro=) precisa de Suspense boundary,
          senão quebra o prerender estático — mesmo problema já corrigido
          antes em /login. */}
      <Suspense fallback={null}>
        <RecuperarSenhaForm />
      </Suspense>
    </div>
  );
}
