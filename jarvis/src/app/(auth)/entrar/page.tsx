import Link from "next/link";
import { entrar } from "../acoes";
import { FormularioAuth } from "@/components/auth/formulario";

export default function PaginaEntrar({
  searchParams
}: {
  searchParams: { destino?: string };
}) {
  return (
    <>
      <h1 className="mb-5 text-lg font-semibold text-tinta-900">Entrar</h1>
      <FormularioAuth modo="entrar" acao={entrar} destino={searchParams.destino} />
      <p className="mt-5 text-center text-sm text-tinta-500">
        Ainda não tem conta?{" "}
        <Link href="/criar-conta" className="font-semibold text-ciano-600 hover:underline">
          Criar conta
        </Link>
      </p>
    </>
  );
}
