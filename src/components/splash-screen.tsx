"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Tela de abertura exibida a cada carregamento novo do app (não usa
// localStorage de propósito — o pedido foi "sempre que o app for
// iniciado", não só na primeira visita). Fica montada por um tempo mínimo
// pra não piscar em conexões rápidas, depois faz fade-out e some do DOM.
const DURACAO_VISIVEL_MS = 900;
const DURACAO_FADE_MS = 400;

export function SplashScreen() {
  const [fase, setFase] = useState<"visivel" | "saindo" | "escondida">("visivel");

  useEffect(() => {
    const t1 = setTimeout(() => setFase("saindo"), DURACAO_VISIVEL_MS);
    const t2 = setTimeout(() => setFase("escondida"), DURACAO_VISIVEL_MS + DURACAO_FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (fase === "escondida") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg,#0d4a79,#01395E)",
        opacity: fase === "visivel" ? 1 : 0,
        transition: `opacity ${DURACAO_FADE_MS}ms ease`,
        pointerEvents: fase === "visivel" ? "auto" : "none"
      }}
    >
      <div style={{ width: 220, maxWidth: "60vw" }}>
        <Image src="/assets/logo-decola-med.png" alt="Decola Med" width={2000} height={2000} priority style={{ width: "100%", height: "auto" }} />
      </div>
      <div style={{ width: 110, maxWidth: "30vw", marginTop: 18 }}>
        <Image src="/assets/logo-by-decola.png" alt="By Decola" width={3000} height={2120} priority style={{ width: "100%", height: "auto" }} />
      </div>
    </div>
  );
}
