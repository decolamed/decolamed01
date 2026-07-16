import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verificarAcessoMatricula } from "@/lib/matricula/acesso";
import type { Profile } from "@/types/database";

// Busca o usuário logado + seu profile (com role). Retorna null se deslogado.
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (profile as Profile) ?? null;
}

// Redireciona para uma página informando que a conta foi desativada pelo
// administrador. Usado pelos três requireX abaixo antes de checar o role,
// para que uma conta desativada nunca acesse nenhuma área logada.
function redirectSeInativo(profile: Profile) {
  if (!profile.ativo) redirect("/login?erro=conta-desativada");
}

// Usado no topo de páginas do painel administrativo.
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirectSeInativo(profile);
  if (profile.role !== "admin") redirect(profile.role === "parceiro" ? "/parceiro" : "/aluno");
  return profile;
}

// Usado no topo de páginas da área do aluno.
export async function requireAluno(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirectSeInativo(profile);
  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "parceiro") redirect("/parceiro");
  return profile;
}

// Usado no topo de páginas da área do parceiro/afiliado.
export async function requireParceiro(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirectSeInativo(profile);
  if (profile.role === "admin") redirect("/admin");
  if (profile.role !== "parceiro") redirect("/aluno");
  return profile;
}

// Usado nas páginas de CONTEÚDO da área do aluno (não no layout — o layout
// continua chamando só requireAluno(), senão a própria página
// /aluno/acesso-expirado entraria em loop de redirect consigo mesma).
//
// Camada 2 de proteção: o middleware (raiz do projeto) já bloqueia a
// navegação para /aluno/* quando a matrícula está vencida/bloqueada/
// cancelada, mas cada página de conteúdo chama isto de novo — mesmo padrão
// redundante já usado em requireAdmin() dentro de toda página do painel
// admin, mesmo com o layout já chamando. Redundância é proposital: se o
// middleware um dia for reconfigurado (matcher, etc.) e parar de cobrir uma
// rota, a página ainda se protege sozinha.
export async function requireAcessoAluno(): Promise<Profile> {
  const profile = await requireAluno();
  const supabase = createClient();
  const acesso = await verificarAcessoMatricula(supabase, profile.id);
  if (!acesso.liberado) {
    redirect(`/aluno/acesso-expirado?motivo=${acesso.motivo ?? "expirada"}`);
  }
  return profile;
}
