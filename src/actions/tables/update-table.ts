"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tables } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { updateTableSchema } from "@/lib/validations/table";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";

export const updateTableAction = roleActionClient("restaurante")
  .inputSchema(updateTableSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    await db
      .update(tables)
      .set({ number: parsedInput.number, seats: parsedInput.seats, zone: parsedInput.zone })
      .where(and(eq(tables.id, parsedInput.tableId), eq(tables.restaurantId, restaurant.id)));

    revalidatePath("/restaurante/mesas");
    return { ok: true };
  });
