"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function RecuperarSenhaPage() {
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErro(null);

    const email = String(new FormData(event.currentTarget).get("email"));
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha`
    });

    setLoading(false);
    if (error) {
      setErro("Não foi possível enviar o e-mail de recuperação.");
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
      <h1 className="font-display text-2xl font-bold text-navy-dark">Recuperar senha</h1>

      {enviado ? (
        <p className="mt-4 text-navy-dark/70">
          Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label className="text-sm font-semibold" htmlFor="email">E-mail cadastrado</label>
            <input id="email" name="email" type="email" required className="mt-1 w-full rounded-lg border p-3" />
          </div>
          {erro && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{erro}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </Button>
        </form>
      )}
    </div>
  );
}
