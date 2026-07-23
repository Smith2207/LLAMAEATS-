"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { deactivateUserSchema } from "@/lib/validations/user-admin";

export const deactivateUserAction = roleActionClient("admin")
  .inputSchema(deactivateUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.userId === ctx.user.id) {
      throw new Error("No puedes desactivar tu propia cuenta.");
    }

    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, parsedInput.userId));

    revalidatePath("/admin/usuarios");
    return { ok: true };
  });
