"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { onboardingSchema } from "@/lib/validations/onboarding";

export const completeOnboardingAction = authActionClient
  .inputSchema(onboardingSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(users)
      .set({ role: parsedInput.role, phone: parsedInput.phone })
      .where(eq(users.id, ctx.user.id));

    revalidatePath("/", "layout");

    return {
      role: parsedInput.role,
      redirectTo: parsedInput.role === "restaurante" ? "/restaurante" : "/dashboard",
    };
  });
