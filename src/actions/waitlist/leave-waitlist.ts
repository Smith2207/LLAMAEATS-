"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { waitlistEntries } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { waitlistEntryIdSchema } from "@/lib/validations/waitlist";

export const leaveWaitlistAction = authActionClient
  .inputSchema(waitlistEntryIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const entry = await db.query.waitlistEntries.findFirst({
      where: eq(waitlistEntries.id, parsedInput.id),
    });
    if (!entry || entry.userId !== ctx.user.id) {
      throw new Error("No se encontró ese apunte en la lista de espera.");
    }

    await db
      .update(waitlistEntries)
      .set({ status: "cancelada" })
      .where(eq(waitlistEntries.id, entry.id));

    return { ok: true };
  });
