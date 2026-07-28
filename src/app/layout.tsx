import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
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
    "Plataforma de preparação para aprovação em Medicina. Cronograma inteligente, questões comentadas, simulados e acompanhamento de desempenho."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserratDisplay.variable} ${montserratBody.variable}`}>
      <body>{children}</body>
    </html>
  );
}
