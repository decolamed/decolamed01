"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

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
      const { error } = await supabase.auth.signInWithPassword({
        email: String(form.get("email")),
        password: String(form.get("senha"))
      });

      if (error) {
        setErro("E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }

      // IMPORTANTE: usamos navegação "dura" (window.location) em vez de
      // router.push()/router.refresh(). Com router.push logo após o login, o
      // middleware às vezes roda antes do cookie de sessão terminar de ser
      // gravado pelo navegador — o usuário parece "não logar", sendo jogado
      // de volta ao login sem nenhum erro. Forçar reload completo garante que
      // o cookie já exista quando o servidor for consultado.
      // Não chamamos setLoading(false) aqui de propósito: a página inteira
      // vai recarregar em seguida, então o botão continua em "Entrando..."
      // até lá em vez de piscar de volta para "Entrar" por uma fração de
      // segundo.
      window.location.href = searchParams.get("redirect") ?? "/aluno";
    } catch (e) {
      // Antes, qualquer falha inesperada aqui (ex.: problema de rede) fazia
      // o botão travar em "Entrando..." pra sempre, sem nenhuma mensagem.
      // Agora o erro aparece explicitamente na tela.
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
