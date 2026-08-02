import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { SplashScreen } from "@/components/splash-screen";
import { AZUL_MARCA } from "@/components/marca-carregando";
import "./globals.css";

// Nova identidade visual (Fase 1): tudo em Montserrat, com pesos diferentes
// pra manter contraste entre título (display) e texto (body) — mesma fonte
// usada no protótipo. Mantemos os nomes de variável CSS (--font-baloo,
// --font-nunito) para não precisar tocar no tailwind.config.ts nem em
// nenhuma classe já usada nas páginas — só troca o que está "por trás".
const montserratDisplay = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-baloo"
});

const montserratBody = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito"
});

export const metadata: Metadata = {
  title: "Decola Med — Preparação estratégica para Medicina",
  description:
    "Plataforma de preparação para aprovação em Medicina. Cronograma inteligente, questões comentadas, simulados e acompanhamento de desempenho.",
  // Manifesto dinâmico (src/app/manifest.webmanifest/route.ts) — permite
  // trocar o ícone do app pelo painel administrativo sem novo deploy.
  manifest: "/manifest.webmanifest",
  // apple-touch-icon precisa ser um PNG opaco: o iOS não respeita
  // transparência e pintaria de branco o fundo da logo (que também é
  // branca), deixando o ícone "vazio" na tela de início.
  icons: {
    icon: [
      { url: "/assets/icone-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icone-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/assets/icone-apple-180.png", sizes: "180x180", type: "image/png" }]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Decola Med"
  }
};

export const viewport = {
  // Mesma cor do manifesto e da splash — ver components/splash-screen. Com
  // valores diferentes, a barra do sistema destoa da tela de abertura e
  // reaparece a emenda que a unificação da splash corrigiu.
  themeColor: AZUL_MARCA
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserratDisplay.variable} ${montserratBody.variable}`}>
      <body>
        <SplashScreen />
        {children}
        <script
          // Registra o service worker mínimo (public/sw.js) — necessário
          // pros navegadores considerarem o app "instalável" (PWA) e
          // dispararem o evento beforeinstallprompt usado em decola-app.tsx.
          dangerouslySetInnerHTML={{
            __html: `if ("serviceWorker" in navigator) { window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); }); }`
          }}
        />
      </body>
    </html>
  );
}
