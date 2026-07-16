import { redirect } from "next/navigation";

// O domínio principal agora é da plataforma (app), não do site de vendas.
// A home institucional (com toda a arte de "sobre a plataforma") continua
// existindo no código, mas a raiz do domínio manda direto pro login.
// Se um dia o site de vendas voltar a ser necessário, é só reverter este
// arquivo para o conteúdo anterior (ver histórico do git).
export default function HomePage() {
  redirect("/login");
}
