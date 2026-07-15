import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_ADMIN = "/admin";
const PROTECTED_ALUNO = "/aluno";

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith(PROTECTED_ADMIN);
  const isAlunoRoute = pathname.startsWith(PROTECTED_ALUNO);

  if (!isAdminRoute && !isAlunoRoute) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "aluno";

  // Admin tentando abrir área do aluno (ou vice-versa) é redirecionado
  // automaticamente para o painel correto — conforme especificado.
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/aluno", request.url));
  }
  if (isAlunoRoute && role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/aluno/:path*"]
};
