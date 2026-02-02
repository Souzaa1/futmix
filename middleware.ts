import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/invite",
];

function isPublicPath(pathname: string): boolean {
  // Rotas exatas
  if (publicPaths.includes(pathname)) return true;
  // /invite/[token] - aceitar convite sem estar logado
  if (pathname.startsWith("/invite/")) return true;
  // APIs - cada rota trata auth internamente
  if (pathname.startsWith("/api/")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  runtime: "nodejs", // Necessário para Prisma/Better Auth (Edge não suporta)
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
