"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// Para onde mandar cada papel depois do login.
const HOME_POR_ROLE: Record<string, string> = {
  admin: "/admin",
  aluno: "/aluno",
  parceiro: "/parceiro"
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(
    searchParams.get("erro") === "conta-desativada"
      ? "Sua conta foi desativada. Entre em contato com o suporte."
      : null
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const supabase = createClient();

    try {
      // Timeout de segurança: se o Supabase nunca responder (rede travada,
      // bloqueador de anúncios, etc.), mostra uma mensagem em vez de deixar
      // o botão preso em "Entrando..." para sempre.
      const resultado = await Promise.race([
        supabase.auth.signInWithPassword({
          email: String(form.get("email")),
          password: String(form.get("senha"))
        }),
        new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 12000))
      ]);

      if (resultado === "timeout") {
        setErro("O servidor não respondeu a tempo. Verifique sua internet e tente de novo.");
        setLoading(false);
        return;
      }

      const { error, data } = resultado;

      if (error) {
        setErro("E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }

      if (!data.user) {
        setErro("Não foi possível confirmar o login. Tente novamente.");
        setLoading(false);
        return;
      }

      // Em vez de mandar todo mundo para /aluno e torcer para o middleware
      // corrigir a rota depois (o que dependia de timing e vinha falhando em
      // produção), já buscamos o papel do usuário aqui e vamos direto para o
      // destino certo. Isso é uma leitura simples da própria linha do
      // usuário em profiles — permitida pela RLS para qualquer usuário
      // autenticado ler o próprio registro.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        setErro(
          `Login funcionou, mas não foi possível carregar seu perfil: ${profileError?.message ?? "perfil não encontrado"}. Contate o suporte.`
        );
        setLoading(false);
        return;
      }

      const destino =
        searchParams.get("redirect") ?? HOME_POR_ROLE[profile.role] ?? "/aluno";

      // Navegação "dura" (window.location, não router.push): garante que o
      // servidor recarregue do zero já com o cookie de sessão gravado.
      window.location.href = destino;
    } catch (e) {
      setErro(`Não foi possível entrar: ${e instanceof Error ? e.message : String(e)}`);
      setLoading(false);
    }
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
