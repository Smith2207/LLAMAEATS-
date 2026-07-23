"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";

const restaurantIdSchema = z.object({ restaurantId: z.string() });

export const approveRestaurantAction = roleActionClient("admin")
  .inputSchema(restaurantIdSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(restaurants)
      .set({ status: "aprobado", updatedAt: new Date() })
      .where(eq(restaurants.id, parsedInput.restaurantId));

    revalidatePath("/admin/restaurantes");
    return { ok: true };
  });

export const rejectRestaurantAction = roleActionClient("admin")
  .inputSchema(restaurantIdSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(restaurants)
      .set({ status: "rechazado", updatedAt: new Date() })
      .where(eq(restaurants.id, parsedInput.restaurantId));

    revalidatePath("/admin/restaurantes");
    return { ok: true };
  });
