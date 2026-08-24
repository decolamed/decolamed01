import type { Metadata } from "next";
import { PaginaDaDemonstracao } from "@/components/demonstracao/pagina";
import { planoDoCaminho } from "@/lib/demonstracao/plano-de-origem";

// ============================================================================
// /demo — O ENDEREÇO QUE SE COLA NUM WHATSAPP
//
// O antigo era `/demonstracao?voltar=%2Finscricao%2Fvooguiado`: 58 caracteres,
// uma interrogação, um igual e dois `%2F` no meio. Ninguém manda isso para um
// aluno em potencial.
//
// Aqui o plano de origem é um pedaço do caminho, não um parâmetro codificado:
//
//   /demo/vooguiado  → a demonstração, e o botão de compra volta para o
//                      VOO GUIADO
//   /demo            → a demonstração sem plano de origem, para o link
//                      repassado solto; o botão usa o endereço de compra
//                      configurado no painel
//
// O catch-all é opcional (`[[...plano]]`) justamente para os dois caírem na
// mesma página, sem uma rota duplicada só para o caso sem slug.
// ============================================================================

export const metadata: Metadata = {
  title: "Demonstração — Decola MED",
  description:
    "Veja por dentro como funciona a Decola MED: painel do aluno, questões com resolução, cronograma e o Copiloto. Sem precisar criar conta.",
  robots: { index: true, follow: true }
};

export default function DemoPage({ params }: { params: { plano?: string[] } }) {
  // O slug vem do caminho e é validado: qualquer coisa que não seja um slug de
  // plano (inclusive tentativa de escapar com `..`) vira "sem origem", que é o
  // comportamento do link solto. Ver lib/demonstracao/plano-de-origem.ts.
  return <PaginaDaDemonstracao origem={planoDoCaminho(params.plano)} />;
}
