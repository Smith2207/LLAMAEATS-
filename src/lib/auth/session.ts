import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Session } from "next-auth";

export async function getSession() {
  return auth();
}

export async function requireSession(callbackUrl?: string): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    const suffix = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
    redirect(`/iniciar-sesion${suffix}`);
  }
  return session;
}

export async function requireRole(
  role: "cliente" | "restaurante" | "admin",
): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== role) {
    redirect("/");
  }
  return session;
}
