"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";

function revalidateProfilePaths() {
  revalidatePath("/dashboard/perfil");
  revalidatePath("/admin/seguridad");
  revalidatePath("/restaurante/perfil");
}

export const revokeSessionAction = authActionClient
  .inputSchema(z.object({ sessionToken: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    await db
      .delete(sessions)
      .where(and(eq(sessions.sessionToken, parsedInput.sessionToken), eq(sessions.userId, ctx.user.id)));
    revalidateProfilePaths();
    return { ok: true };
  });

export const revokeAllOtherSessionsAction = authActionClient
  .inputSchema(z.object({ currentSessionToken: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    await db
      .delete(sessions)
      .where(and(eq(sessions.userId, ctx.user.id), ne(sessions.sessionToken, parsedInput.currentSessionToken)));
    revalidateProfilePaths();
    return { ok: true };
  });
