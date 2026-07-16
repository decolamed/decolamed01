import { redirect } from "next/navigation";

// Página de contato do site de vendas descontinuada. O suporte durante a
// inscrição continua acessível pelo botão de WhatsApp no rodapé das páginas
// de inscrição/confirmação.
export default function ContatoPage() {
  redirect("/login");
}
