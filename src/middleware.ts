import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Middleware Edge que usa la config edge-safe (adapter sobre `neon-http`,
// sin providers) para resolver la sesión real desde la base de datos y
// aplicar el control de acceso por rol en /dashboard, /restaurante y /admin.
const { auth } = NextAuth(authConfig);

const ROLE_BY_PREFIX: Record<string, "cliente" | "restaurante" | "admin"> = {
  "/dashboard": "cliente",
  "/restaurante": "restaurante",
  "/admin": "admin",
};

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const prefix = Object.keys(ROLE_BY_PREFIX).find(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!prefix) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const callbackUrl = encodeURIComponent(pathname + search);
    return NextResponse.redirect(
      new URL(`/iniciar-sesion?callbackUrl=${callbackUrl}`, req.nextUrl),
    );
  }

  if (!session.user.phone && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl));
  }

  const requiredRole = ROLE_BY_PREFIX[prefix];
  if (session.user.role !== requiredRole) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/restaurante/:path*", "/admin/:path*"],
};
