"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// O Supabase já autentica o usuário automaticamente ao clicar no link do
// e-mail (convite ou recuperação) antes de chegar nesta página — aqui só
// pedimos a nova senha.
export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    const form = new FormData(event.currentTarget);
    const senha = String(form.get("senha"));
    const confirmar = String(form.get("confirmar"));

    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);

    if (error) {
      setErro("Não foi possível salvar a nova senha. O link pode ter expirado.");
      return;
    }

    router.push("/aluno");
    router.refresh();
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">
      <h1 className="text-center font-display text-2xl font-bold text-navy-dark">Criar senha</h1>
      <p className="mt-2 text-center text-sm text-navy-dark/60">
        Defina a senha que você vai usar para acessar a plataforma.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-semibold" htmlFor="senha">Nova senha</label>
          <input id="senha" name="senha" type="password" required minLength={8} className="mt-1 w-full rounded-lg border p-3" />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="confirmar">Confirmar senha</label>
          <input id="confirmar" name="confirmar" type="password" required minLength={8} className="mt-1 w-full rounded-lg border p-3" />
        </div>

        {erro && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{erro}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Salvar e entrar"}
        </Button>
      </form>
    </div>
  );
}
