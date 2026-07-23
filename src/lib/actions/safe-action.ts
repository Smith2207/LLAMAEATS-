import { createSafeActionClient } from "next-safe-action";
import { auth } from "@/auth";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error(error);
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
