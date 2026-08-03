import { CarregandoRota } from "@/components/marca-carregando";

// Next mostra este componente enquanto a Server Component da rota busca
// dados. Usa a identidade compartilhada em components/marca-carregando para
// que toda espera da plataforma tenha a mesma cara — antes cada carregamento
// era um spinner cinza anônimo, sem relação visual com a splash de abertura.
export default function Loading() {
  return <CarregandoRota />;
}
