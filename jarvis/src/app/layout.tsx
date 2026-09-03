import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jarvis — assistente de estudos em medicina",
  description:
    "Assistente de estudos para quem faz medicina por PBL: conversa, pesquisa no PubMed e organiza tudo em resumos por tutoria e situação-problema."
};

export const viewport: Viewport = {
  themeColor: "#0f151c",
  width: "device-width",
  initialScale: 1
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
