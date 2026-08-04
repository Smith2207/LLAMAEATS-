"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { restaurantCommissions } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { restaurantIdSchema } from "@/lib/validations/moderation";

// El restaurante paga la comisión acumulada fuera de la plataforma (aún no
// hay pasarela para cobrarle automáticamente, §ver commissions.ts). Este
// registro es manual: un admin confirma el pago y marca el saldo pendiente
// como liquidado.
export const settleRestaurantCommissionsAction = roleActionClient("admin")
  .inputSchema(restaurantIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(restaurantCommissions)
      .set({ status: "liquidado", settledAt: new Date(), settledByStaffId: ctx.user.id })
      .where(
        and(
          eq(restaurantCommissions.restaurantId, parsedInput.restaurantId),
          eq(restaurantCommissions.status, "pendiente"),
        ),
      );

    revalidatePath(`/admin/restaurantes/${parsedInput.restaurantId}`);
    return { ok: true };
  });
