"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tables } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { tableIdSchema } from "@/lib/validations/table";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";

export const toggleTableActiveAction = roleActionClient("restaurante")
  .inputSchema(tableIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    const table = restaurant.tables.find((t) => t.id === parsedInput.tableId);
    if (!table) throw new Error("Mesa no encontrada.");

    await db
      .update(tables)
      .set({ isActive: !table.isActive })
      .where(and(eq(tables.id, parsedInput.tableId), eq(tables.restaurantId, restaurant.id)));

    revalidatePath("/restaurante/mesas");
    return { ok: true };
  });
