"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Tela de abertura exibida a cada carregamento novo do app (não usa
// localStorage de propósito — o pedido foi "sempre que o app for
// iniciado", não só na primeira visita). Fica montada por um tempo mínimo
// pra não piscar em conexões rápidas, depois some do DOM.
//
// O fade em si é feito pela animação `.dm-splash` (globals.css), não por
// estado do React: como essa camada cobre a tela inteira com z-index alto,
// um fade dependente de JS prenderia o usuário numa tela azul inerte caso
// a hidratação falhasse. Aqui o React só remove o nó depois que a animação
// já terminou.
const DURACAO_VISIVEL_MS = 900;
const DURACAO_FADE_MS = 400;

export function SplashScreen() {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisivel(false), DURACAO_VISIVEL_MS + DURACAO_FADE_MS);
    return () => clearTimeout(t);
  }, []);

  if (!visivel) return null;

  return (
    <div
      aria-hidden="true"
      className="dm-splash"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg,#0d4a79,#01395E)",
        pointerEvents: "none"
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
