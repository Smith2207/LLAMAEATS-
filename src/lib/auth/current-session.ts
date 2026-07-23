import { cookies } from "next/headers";

/** Nombre de cookie que usa Auth.js v5 para la sesión (varía si es http/https). */
export async function getCurrentSessionToken(): Promise<string | null> {
  const store = await cookies();
  return (
    store.get("__Secure-authjs.session-token")?.value ??
    store.get("authjs.session-token")?.value ??
    null
  );
}
