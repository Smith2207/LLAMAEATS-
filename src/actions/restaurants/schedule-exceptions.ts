"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { restaurantScheduleExceptions } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";
import {
  createScheduleExceptionSchema,
  scheduleExceptionIdSchema,
} from "@/lib/validations/schedule-exception";

export const createScheduleExceptionAction = roleActionClient("restaurante")
  .inputSchema(createScheduleExceptionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    await db
      .insert(restaurantScheduleExceptions)
      .values({
        restaurantId: restaurant.id,
        date: parsedInput.date,
        type: parsedInput.type,
        openTime: parsedInput.type === "horario_especial" ? parsedInput.openTime : null,
        closeTime: parsedInput.type === "horario_especial" ? parsedInput.closeTime : null,
        note: parsedInput.note,
      })
      .onConflictDoUpdate({
        target: [restaurantScheduleExceptions.restaurantId, restaurantScheduleExceptions.date],
        set: {
          type: parsedInput.type,
          openTime: parsedInput.type === "horario_especial" ? parsedInput.openTime : null,
          closeTime: parsedInput.type === "horario_especial" ? parsedInput.closeTime : null,
          note: parsedInput.note,
        },
      });

    revalidatePath("/restaurante/perfil");
    return { ok: true };
  });

export const deleteScheduleExceptionAction = roleActionClient("restaurante")
  .inputSchema(scheduleExceptionIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    await db
      .delete(restaurantScheduleExceptions)
      .where(
        and(
          eq(restaurantScheduleExceptions.id, parsedInput.exceptionId),
          eq(restaurantScheduleExceptions.restaurantId, restaurant.id),
        ),
      );

    revalidatePath("/restaurante/perfil");
    return { ok: true };
  });
