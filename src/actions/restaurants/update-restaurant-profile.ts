"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { updateRestaurantProfileSchema } from "@/lib/validations/restaurant";

export const updateRestaurantProfileAction = roleActionClient("restaurante")
  .inputSchema(updateRestaurantProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.ownerId, ctx.user.id),
    });
    if (!restaurant) throw new Error("No tienes un restaurante registrado.");

    await db
      .update(restaurants)
      .set({
        name: parsedInput.name,
        description: parsedInput.description,
        address: parsedInput.address,
        district: parsedInput.district,
        category: parsedInput.category,
        openTime: parsedInput.openTime,
        closeTime: parsedInput.closeTime,
        updatedAt: new Date(),
      })
      .where(and(eq(restaurants.id, restaurant.id), eq(restaurants.ownerId, ctx.user.id)));

    revalidatePath("/restaurante/perfil");
    return { ok: true };
  });
