"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// O Supabase já autentica o usuário automaticamente ao clicar no link do
// e-mail (convite ou recuperação) antes de chegar nesta página — a troca do
// código pela sessão acontece em /auth/callback. Aqui só pedimos a nova senha.
export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [semSessao, setSemSessao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setSemSessao(!data.user);
      setVerificandoSessao(false);
    });
  }, []);

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
      // Mesmo ajuste que já ajudou a diagnosticar o problema do link antes:
      // mostrar a mensagem real do Supabase em vez de um texto genérico.
      setErro(`Não foi possível salvar a nova senha: ${error.message}`);
      return;
    }

    router.push("/aluno");
    router.refresh();
  }

  if (verificandoSessao) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
        <p className="text-navy-dark/60">Verificando link...</p>
      </div>
    );
  }

  if (semSessao) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
        <h1 className="font-display text-2xl font-bold text-navy-dark">Link inválido ou expirado</h1>
        <p className="mt-2 text-sm text-navy-dark/60">
          Peça um novo link de redefinição de senha.
        </p>
        <Button className="mt-6 w-full" onClick={() => router.push("/recuperar-senha")}>
          Solicitar novo link
        </Button>
      </div>
    );
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
