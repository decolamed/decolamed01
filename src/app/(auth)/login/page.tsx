import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";

export default function LoginPage() {
  return (
    <OnboardingGate>
      <div className="rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-center font-display text-2xl font-bold text-navy-dark">Entrar</h1>

        {/* useSearchParams (usado no form para ler ?redirect=) exige um
            Suspense boundary para não quebrar o prerender estático. */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </OnboardingGate>
  );
}
