"use server";

import { and, eq, gte, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reservations, tables } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { tableIdSchema } from "@/lib/validations/table";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";
import { todayInLima } from "@/lib/reservations/time";

export const deleteTableAction = roleActionClient("restaurante")
  .inputSchema(tableIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    const futureActive = await db.query.reservations.findFirst({
      where: and(
        eq(reservations.tableId, parsedInput.tableId),
        eq(reservations.restaurantId, restaurant.id),
        gte(reservations.date, todayInLima()),
        inArray(reservations.status, ["pendiente_pago", "confirmada", "en_curso"]),
      ),
    });
    if (futureActive) {
      throw new Error(
        "Esta mesa tiene reservas futuras activas. Desactívala en vez de eliminarla.",
      );
    }

    await db
      .delete(tables)
      .where(and(eq(tables.id, parsedInput.tableId), eq(tables.restaurantId, restaurant.id)));

    revalidatePath("/restaurante/mesas");
    return { ok: true };
  });
