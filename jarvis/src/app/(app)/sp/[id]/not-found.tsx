import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-medium text-tinta-700">Esta situação-problema não existe.</p>
      <Link href="/tutorias" className="mt-2 inline-block text-sm text-ciano-600 hover:underline">
        Voltar para as tutorias
      </Link>
    </div>
  );
}
