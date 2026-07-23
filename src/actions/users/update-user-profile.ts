"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { updateProfileSchema } from "@/lib/validations/user-admin";

export const updateUserProfileAction = authActionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(users)
      .set({ name: parsedInput.name, phone: parsedInput.phone })
      .where(eq(users.id, ctx.user.id));

    revalidatePath("/", "layout");
    return { ok: true };
  });
