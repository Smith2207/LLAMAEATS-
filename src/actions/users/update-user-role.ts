"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { updateUserRoleSchema } from "@/lib/validations/user-admin";

export const updateUserRoleAction = roleActionClient("admin")
  .inputSchema(updateUserRoleSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(users)
      .set({ role: parsedInput.role })
      .where(eq(users.id, parsedInput.userId));

    revalidatePath("/admin/usuarios");
    return { ok: true };
  });
