"use client";

import { useEffect, useState } from "react";

// ============================================================================
// INSTALAR A DECOLA MED COMO APLICATIVO
//
// Mesmo mecanismo que o app do aluno já usa (ver decola-app.tsx): o navegador
// dispara `beforeinstallprompt` quando a página é instalável — o manifest e o
// service worker já são registrados em layout.tsx para o site inteiro, então
// isto funciona aqui sem nenhuma infraestrutura nova.
//
// O evento precisa ser guardado: `prompt()` só pode ser chamado dentro de um
// gesto do usuário, então não dá para instalar no carregamento.
//
// iOS nunca dispara o evento — no Safari a instalação é manual, pelo menu de
// compartilhamento. Por isso o botão sempre existe: sem prompt disponível ele
// abre as instruções em vez de sumir, que deixaria o aluno de iPhone sem
// caminho nenhum.
// ============================================================================

export function InstalarApp() {
  const [prompt, setPrompt] = useState<any>(null);
  const [instalado, setInstalado] = useState(false);
  const [instrucoes, setInstrucoes] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalado(
      window.matchMedia?.("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
    );
    setIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const aoPoderInstalar = (e: any) => {
      e.preventDefault();
      setPrompt(e);
    };
    const aoInstalar = () => {
      setPrompt(null);
      setInstalado(true);
      setInstrucoes(false);
    };

    window.addEventListener("beforeinstallprompt", aoPoderInstalar);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoPoderInstalar);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  if (instalado) {
    return (
      <div className="rounded-2xl bg-sky p-5 text-left">
        <p className="font-display font-bold text-navy-dark">📱 App instalado</p>
        <p className="mt-1 text-sm text-navy-dark/70">
          A Decola Med já está instalada neste aparelho. É só abrir pelo ícone na sua tela inicial.
        </p>
      </div>
    );
  }

  async function instalar() {
    if (!prompt) {
      setInstrucoes(true);
      return;
    }
    prompt.prompt();
    const escolha = await prompt.userChoice?.catch(() => null);
    // O evento só serve uma vez: depois de usado, o navegador não o entrega
    // de novo. Descartar evita um segundo clique que não faria nada.
    setPrompt(null);
    if (escolha?.outcome !== "accepted") setInstrucoes(true);
  }

  return (
    <div className="rounded-2xl bg-sky p-5 text-left">
      <p className="font-display font-bold text-navy-dark">📱 Instale a Decola Med</p>
      <p className="mt-1 text-sm text-navy-dark/70">
        Você também pode instalar a Decola Med no seu celular para acessar seus estudos de forma mais rápida e
        prática.
      </p>

      <button
        type="button"
        onClick={instalar}
        className="mt-4 rounded-full bg-navy px-6 py-3 font-display text-sm font-bold text-white hover:bg-navy-light"
      >
        Instalar o aplicativo
      </button>

      {instrucoes && (
        <div className="mt-4 rounded-xl bg-white p-4 text-sm text-navy-dark/80">
          {ios ? (
            <>
              <p className="font-semibold text-navy-dark">No iPhone ou iPad</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  Toque no botão <strong>Compartilhar</strong> (o quadrado com a seta para cima), na barra do
                  Safari.
                </li>
                <li>
                  Role a lista e toque em <strong>Adicionar à Tela de Início</strong>.
                </li>
                <li>
                  Confirme em <strong>Adicionar</strong>.
                </li>
              </ol>
            </>
          ) : (
            <>
              <p className="font-semibold text-navy-dark">No Android ou no computador</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  Abra o menu do navegador (os três pontinhos, <strong>⋮</strong>).
                </li>
                <li>
                  Toque em <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.
                </li>
                <li>Confirme a instalação.</li>
              </ol>
            </>
          )}
          <p className="mt-3 text-xs text-navy-dark/50">
            Você pode instalar depois — o e-mail de acesso continua valendo, e a plataforma funciona
            normalmente pelo navegador.
          </p>
        </div>
      )}
    </div>
  );
}
