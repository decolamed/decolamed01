import { redirect } from "next/navigation";

// Não existe mais catálogo público de planos — o admin gera um link
// específico por plano em /admin/planos e compartilha diretamente
// (/inscricao/[slug]). Um link antigo pra esta página cai no login em vez
// de dar 404.
export default function PlanosPage() {
  redirect("/login");
}
