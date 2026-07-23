"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tables } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { createTableSchema } from "@/lib/validations/table";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";

export const createTableAction = roleActionClient("restaurante")
  .inputSchema(createTableSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    await db.insert(tables).values({
      restaurantId: restaurant.id,
      number: parsedInput.number,
      seats: parsedInput.seats,
      zone: parsedInput.zone,
    });

    revalidatePath("/restaurante/mesas");
    return { ok: true };
  });
