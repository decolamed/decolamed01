"use client";

import { useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { destinoDoLink } from "@/lib/auth/destino-do-link";

// ============================================================================
// O PEDAÇO DO LINK QUE SÓ O NAVEGADOR ENXERGA
//
// Quando o e-mail é disparado pelo painel admin ou pelo webhook do Asaas, não
// há navegador do lado de quem pede — então não há PKCE, e o Supabase devolve
// a sessão no FRAGMENTO da URL:
//
//   /auth/callback#access_token=...&refresh_token=...&type=recovery
//
// Fragmento não é enviado ao servidor em nenhuma requisição HTTP. O route
// handler em /auth/callback, sendo código de servidor, via a URL sem nada
// depois do "#" e concluía que o link era inválido — mesmo recém-criado.
// Era esse o "Esse link expirou ou já foi usado" que aparecia sempre.
//
// Esta página existe para ler esse pedaço. É a primeira vez no fluxo que o
// código roda no navegador, que é o único lugar onde o fragmento existe.
// ============================================================================

export default function FinalizarLoginPage() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const next = destinoDoLink(url.searchParams.get("next"));
    const linkInvalido = () => window.location.replace("/recuperar-senha?erro=link_invalido");

    // O fragmento vem no mesmo formato de uma query string.
    const fragmento = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const erro = fragmento.get("error_description") ?? fragmento.get("error");
    if (erro) {
      // Aqui sim o link está velho ou já foi usado — quem diz é o Supabase.
      console.error("Link de e-mail recusado:", erro);
      linkInvalido();
      return;
    }

    const accessToken = fragmento.get("access_token");
    const refreshToken = fragmento.get("refresh_token");
    if (!accessToken || !refreshToken) {
      linkInvalido();
      return;
    }

    createClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          console.error("Não foi possível abrir a sessão a partir do link:", error.message);
          linkInvalido();
          return;
        }
        // Navegação "dura", pelo mesmo motivo do login e do redefinir-senha:
        // garante que o servidor já enxergue o cookie da sessão no próximo
        // carregamento, sem depender do timing entre gravar o cookie e o
        // middleware ser consultado.
        window.location.replace(next);
      });
  }, []);

  // O fragmento fica fora do alcance do servidor, então esta tela sempre
  // aparece por um instante. Ela repete a moldura das telas de autenticação
  // para não piscar uma página em branco no meio do fluxo.
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
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center">
          <p className="font-display text-lg font-bold text-navy-dark">Preparando seu acesso…</p>
          <p className="mt-2 text-sm text-navy-dark/60">Só um instante.</p>
        </div>
      </div>
    </div>
  );
}
