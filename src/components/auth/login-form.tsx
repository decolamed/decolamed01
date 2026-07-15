"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("senha"))
    });

    setLoading(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    // O middleware cuida do redirecionamento correto (admin vs. aluno);
    // aqui apenas navegamos para a rota solicitada ou para a área do aluno.
    router.push(searchParams.get("redirect") ?? "/aluno");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-semibold" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required className="mt-1 w-full rounded-lg border p-3" />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" required className="mt-1 w-full rounded-lg border p-3" />
        </div>

        {erro && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{erro}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <Link href="/recuperar-senha" className="mt-4 block text-center text-sm text-navy/70 underline">
        Esqueci minha senha
      </Link>
    </>
  );
}
