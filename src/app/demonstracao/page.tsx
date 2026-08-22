import { permanentRedirect } from "next/navigation";
import { enderecoCurto } from "@/lib/demonstracao/plano-de-origem";

// ============================================================================
// O ENDEREÇO ANTIGO DA DEMONSTRAÇÃO
//
// `/demonstracao?voltar=%2Finscricao%2Fvooguiado` foi substituído por
// `/demo/vooguiado`. Links já enviados por WhatsApp não podem quebrar — e
// quem clicar num deles passa a ver o endereço bonito na barra do navegador,
// em vez de continuar propagando o antigo.
//
// Redirecionamento permanente: o endereço mudou de vez, e dizer isso aos
// buscadores evita a mesma tela indexada em dois lugares.
// ============================================================================

export default function DemonstracaoAntiga({ searchParams }: { searchParams: { voltar?: string } }) {
  permanentRedirect(enderecoCurto(searchParams.voltar));
}
