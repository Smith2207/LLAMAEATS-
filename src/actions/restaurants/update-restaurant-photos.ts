"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";

const schema = z.object({
  coverBlobUrl: z.string().url().optional(),
  gallery: z.array(z.string().url()).max(12).optional(),
});

export const updateRestaurantPhotosAction = roleActionClient("restaurante")
  .inputSchema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    await db
      .update(restaurants)
      .set({
        ...(parsedInput.coverBlobUrl ? { coverBlobUrl: parsedInput.coverBlobUrl } : {}),
        ...(parsedInput.gallery ? { gallery: parsedInput.gallery } : {}),
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/restaurante/perfil");
    return { ok: true };
  });
