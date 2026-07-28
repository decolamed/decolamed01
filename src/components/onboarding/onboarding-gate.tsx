"use client";

import { useEffect, useState } from "react";
import { OnboardingCarousel } from "./onboarding-carousel";

// Chave em localStorage: só existe DEPOIS que alguém termina (ou pula) o
// onboarding uma vez neste navegador — daí "primeira utilização" é
// simplesmente "essa chave ainda não existe".
const CHAVE = "dm-onboarding-visto";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [mostrar, setMostrar] = useState(false);

  // Em SSR/primeira renderização no cliente não dá pra saber se é a
  // primeira visita (localStorage só existe no navegador) — por isso a
  // tela de login aparece primeiro e, se for mesmo a primeira visita, o
  // onboarding assume o lugar dela logo em seguida. É um repique mínimo,
  // aceitável por acontecer só uma vez na vida do navegador.
  useEffect(() => {
    try {
      if (!localStorage.getItem(CHAVE)) setMostrar(true);
    } catch {
      // localStorage indisponível (modo privado/restrições): sem onboarding.
    }
  }, []);

  function finalizar() {
    try {
      localStorage.setItem(CHAVE, "1");
    } catch {}
    setMostrar(false);
  }

  if (!mostrar) return <>{children}</>;
  return <OnboardingCarousel onFinish={finalizar} />;
}
