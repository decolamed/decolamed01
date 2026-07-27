import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { verificarAcessoMatricula } from "@/lib/matricula/acesso";

const HOME_POR_ROLE: Record<string, string> = {
  admin: "/admin",
  aluno: "/aluno",
  parceiro: "/parceiro",
  professor: "/professor"
};

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAlunoRoute = pathname.startsWith("/aluno");
  const isParceiroRoute = pathname.startsWith("/parceiro");
  const isProfessorRoute = pathname.startsWith("/professor");
  const isPreviewRoute = pathname.startsWith("/preview-aluno");

  if (!isAdminRoute && !isAlunoRoute && !isParceiroRoute && !isProfessorRoute && !isPreviewRoute) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, ativo")
    .eq("id", user.id)
    .single();

  if (profile && profile.ativo === false) {
    await supabase.auth.signOut();
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("erro", "conta-desativada");
    return NextResponse.redirect(loginUrl);
  }

  const role = profile?.role ?? "aluno";
  const home = HOME_POR_ROLE[role] ?? "/aluno";

  // Preview: só admin e parceiro podem ver a vitrine do app do aluno.
  if (isPreviewRoute && role !== "admin" && role !== "parceiro") {
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Cada role só acessa a própria área.
  if (
    (isAdminRoute && role !== "admin") ||
    (isAlunoRoute && role !== "aluno") ||
    (isParceiroRoute && role !== "parceiro") ||
    (isProfessorRoute && role !== "professor")
  ) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Bloqueio de acesso vencido para alunos (camada 1 — rota).
  const ROTA_ACESSO_EXPIRADO = "/aluno/acesso-expirado";
  if (isAlunoRoute && role === "aluno" && pathname !== ROTA_ACESSO_EXPIRADO) {
    const acesso = await verificarAcessoMatricula(supabase, user.id);
    if (!acesso.liberado) {
      const url = new URL(ROTA_ACESSO_EXPIRADO, request.url);
      url.searchParams.set("motivo", acesso.motivo ?? "expirada");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/aluno/:path*", "/parceiro/:path*", "/professor/:path*", "/preview-aluno/:path*"]
};
