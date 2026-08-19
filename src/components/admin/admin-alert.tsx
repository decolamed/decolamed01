// Mensagem de erro/sucesso lida da query string (?erro=...&sucesso=...),
// preenchida pelas server actions do admin via redirect() após salvar.
// Não precisa ser client component: só lê searchParams já recebidos pelo
// Server Component pai.
export function AdminAlert({ erro, sucesso }: { erro?: string; sucesso?: string }) {
  if (!erro && !sucesso) return null;

  return (
    <div
      className={`mt-4 rounded-lg p-3 text-sm ${
        erro ? "bg-red-soft text-red" : "bg-green-soft text-green"
      }`}
    >
      {erro ?? sucesso}
    </div>
  );
}
