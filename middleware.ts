import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { verificarAcessoMatricula } from "@/lib/matricula/acesso";

const PROTECTED_ADMIN = "/admin";
const PROTECTED_ALUNO = "/aluno";
const PROTECTED_PARCEIRO = "/parceiro";

// Para onde mandar cada role quando ele tentar abrir uma área que não é a dele.
const HOME_POR_ROLE: Record<string, string> = {
  admin: "/admin",
  aluno: "/aluno",
  parceiro: "/parceiro",
  // Professor ainda não tem área própria — usa o painel administrativo
  // (mesmo acesso do admin por enquanto, só com o rótulo/role diferente
  // para fins de gestão de usuários).
  professor: "/admin"
};

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith(PROTECTED_ADMIN);
  const isAlunoRoute = pathname.startsWith(PROTECTED_ALUNO);
  const isParceiroRoute = pathname.startsWith(PROTECTED_PARCEIRO);

  if (!isAdminRoute && !isAlunoRoute && !isParceiroRoute) {
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

  // Conta desativada pelo admin: derruba a sessão e manda para o login com
  // um aviso, mesmo que o cookie de sessão ainda seja válido.
  if (profile && profile.ativo === false) {
    await supabase.auth.signOut();
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("erro", "conta-desativada");
    return NextResponse.redirect(loginUrl);
  }

  const role = profile?.role ?? "aluno";
  const home = HOME_POR_ROLE[role] ?? "/aluno";

  // Cada role só acessa a própria área — tentar abrir outra redireciona
  // automaticamente para o painel correto, conforme especificado.
  if ((isAdminRoute && role !== "admin" && role !== "professor") ||
      (isAlunoRoute && role !== "aluno") ||
      (isParceiroRoute && role !== "parceiro")) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Bloqueio real de acesso vencido/bloqueado/cancelado — camada 1 (rota).
  // Roda 100% no servidor, usando `supabase` autenticado pela sessão (RLS
  // garante que só a própria matrícula do aluno é lida). A rota
  // /aluno/acesso-expirado fica de fora da checagem de propósito: é para lá
  // que redirecionamos, então incluí-la geraria um loop de redirecionamento.
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
  matcher: ["/admin/:path*", "/aluno/:path*", "/parceiro/:path*"]
};
