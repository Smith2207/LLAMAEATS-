import { createSafeActionClient } from "next-safe-action";
import { auth } from "@/auth";

// Drizzle envuelve los errores del driver dentro de `.cause` y arma su
// propio `.message` como "Failed query: <sql> params: <...>" — si eso se
// deja pasar tal cual, el cliente ve la consulta SQL cruda y los valores
// de los parámetros. Cualquier error que venga del driver de base de datos
// (en vez de un `throw new Error("mensaje para el usuario")` intencional
// del propio código) se reemplaza por un mensaje genérico; todo lo demás
// sigue mostrándose tal cual, como hasta ahora.
function isLeakyDriverError(error: Error): boolean {
  const cause = (error as { cause?: { code?: string } }).cause;
  return error.message.startsWith("Failed query:") || typeof cause?.code === "string";
}

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error(error);
    if (isLeakyDriverError(error)) return "Ocurrió un error inesperado.";
    return error.message || "Ocurrió un error inesperado.";
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Debes iniciar sesión para continuar.");
  }
  return next({ ctx: { session, user: session.user } });
});

export function roleActionClient(role: "cliente" | "restaurante" | "admin") {
  return authActionClient.use(async ({ next, ctx }) => {
    if (ctx.user.role !== role) {
      throw new Error("No tienes permiso para realizar esta acción.");
    }
    return next({ ctx });
  });
}
