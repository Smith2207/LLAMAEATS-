"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { recordPresencialVisitSchema } from "@/lib/validations/compliance";

// Verificación presencial opcional (§3.4): el verificador registra que
// visitó el local, con nota. No depende de hardware de geolocalización —
// es un registro manual del equipo de LlamaEats.
export const recordPresencialVisitAction = roleActionClient("admin")
  .inputSchema(recordPresencialVisitSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(restaurants)
      .set({
        presencialVisitAt: new Date(),
        presencialVisitNote: parsedInput.note,
        presencialVisitByAdminId: ctx.user.id,
      })
      .where(eq(restaurants.id, parsedInput.restaurantId));

    revalidatePath(`/admin/restaurantes/${parsedInput.restaurantId}`);
    return { ok: true };
  });
