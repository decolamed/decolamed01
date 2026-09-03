import { redirect } from "next/navigation";

// O middleware já resolve os dois casos (com e sem sessão) antes de chegar
// aqui. Este redirecionamento é a rede para uma requisição que escape do
// matcher — nunca deixar a raiz em branco.
export default function Raiz() {
  redirect("/tutorias");
}
