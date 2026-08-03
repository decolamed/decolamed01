"use client";

import { useEffect, useState } from "react";
import { MarcaCarregando, AZUL_MARCA } from "./marca-carregando";

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
//
// ---------------------------------------------------------------------------
// POR QUE O FUNDO É CHAPADO, E NÃO UM GRADIENTE
//
// Instalado como PWA, o app abre em duas etapas que o usuário enxergava como
// duas telas de carregamento seguidas:
//
//   1. Android/iOS desenham um splash próprio, a partir do `background_color`
//      e do ícone do manifesto. Isso acontece ANTES de qualquer código nosso
//      rodar e NÃO pode ser desativado num app standalone.
//   2. Só então o app carrega e esta splash aparece.
//
// Como a etapa 1 é um azul chapado (#01395E) e esta tela usava um gradiente
// (#0d4a79 → #01395E), a troca entre as duas era visível — daí a impressão de
// "tela azul padrão, depois a splash By Decola". Usando exatamente a mesma cor
// do manifesto, a passagem de uma para a outra fica imperceptível e o usuário
// vê uma única tela.
//
// Ou seja: a cor aqui está amarrada ao manifesto. Trocar uma sem a outra faz
// o problema voltar.
// ---------------------------------------------------------------------------

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
        background: AZUL_MARCA,
        pointerEvents: "none"
      }}
    >
      <MarcaCarregando />
    </div>
  );
}
