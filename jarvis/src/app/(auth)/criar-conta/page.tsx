import Link from "next/link";
import { criarConta } from "../acoes";
import { FormularioAuth } from "@/components/auth/formulario";

export default function PaginaCriarConta() {
  return (
    <>
      <h1 className="mb-5 text-lg font-semibold text-tinta-900">Criar conta</h1>
      <FormularioAuth modo="criar" acao={criarConta} />
      <p className="mt-5 text-center text-sm text-tinta-500">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-ciano-600 hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
