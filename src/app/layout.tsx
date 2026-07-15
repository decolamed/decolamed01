import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-baloo"
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito"
});

export const metadata: Metadata = {
  title: "Decola Med — Preparação estratégica para Medicina",
  description:
    "Plataforma de preparação para aprovação em Medicina. Cronograma inteligente, questões comentadas, simulados e acompanhamento de desempenho."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
