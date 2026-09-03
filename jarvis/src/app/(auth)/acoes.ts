"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export interface EstadoDoFormulario {
  erro?: string;
  aviso?: string;
}

/**
 * O destino pós-login vem da query string, ou seja, do usuário — e um destino
 * vindo do usuário é um redirecionamento aberto esperando para acontecer.
 * Só caminho interno passa: tem que começar com uma barra e não pode começar
 * com duas ("//evil.com" é uma URL absoluta que o navegador segue).
 */
function destinoSeguro(bruto: FormDataEntryValue | null): string {
  const valor = typeof bruto === "string" ? bruto : "";
  return valor.startsWith("/") && !valor.startsWith("//") ? valor : "/tutorias";
}

export async function entrar(
  _anterior: EstadoDoFormulario,
  formulario: FormData
): Promise<EstadoDoFormulario> {
  const email = String(formulario.get("email") ?? "").trim();
  const senha = String(formulario.get("senha") ?? "");

  if (!email || !senha) return { erro: "Preencha o e-mail e a senha." };

  const supabase = criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    // Mensagem única para e-mail inexistente e senha errada: dizer qual dos
    // dois falhou entrega a quem tenta invadir a informação de que aquele
    // e-mail tem conta aqui.
    return { erro: "E-mail ou senha incorretos." };
  }

  revalidatePath("/", "layout");
  redirect(destinoSeguro(formulario.get("destino")));
}

export async function criarConta(
  _anterior: EstadoDoFormulario,
  formulario: FormData
): Promise<EstadoDoFormulario> {
  const nome = String(formulario.get("nome") ?? "").trim();
  const email = String(formulario.get("email") ?? "").trim();
  const senha = String(formulario.get("senha") ?? "");

  if (!nome) return { erro: "Diga como você quer ser chamado." };
  if (!email) return { erro: "Informe seu e-mail." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };

  const supabase = criarClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      // Lido pelo gatilho `criar_perfil_do_usuario` no banco, que cria o perfil
      // no mesmo instante em que o usuário nasce.
      data: { nome },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`
    }
  });

  if (error) {
    return { erro: error.message.includes("already") ? "Já existe uma conta com esse e-mail." : error.message };
  }

  // Com confirmação de e-mail ligada no Supabase, `session` vem nula e a pessoa
  // ainda não está logada. Sem esta ramificação, ela seria mandada para a área
  // interna e voltaria para a tela de login sem entender o motivo.
  if (!data.session) {
    return { aviso: "Conta criada. Confirme o e-mail que acabamos de enviar para entrar." };
  }

  revalidatePath("/", "layout");
  redirect("/tutorias");
}

export async function sair() {
  const supabase = criarClienteServidor();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/entrar");
}
