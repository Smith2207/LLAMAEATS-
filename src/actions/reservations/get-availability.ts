"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { getAvailableSlots, getAvailableTables } from "@/lib/reservations/availability";
import { availabilityQuerySchema, tablesQuerySchema } from "@/lib/validations/reservation";

export const getAvailableSlotsAction = authActionClient
  .inputSchema(availabilityQuerySchema)
  .action(async ({ parsedInput }) => {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, parsedInput.restaurantId),
    });
    if (!restaurant) throw new Error("Restaurante no encontrado.");

    const slots = await getAvailableSlots({
      restaurantId: parsedInput.restaurantId,
      date: parsedInput.date,
      openTime: restaurant.openTime,
      closeTime: restaurant.closeTime,
      guests: parsedInput.guests,
    });

    return { slots };
  });

export const getAvailableTablesAction = authActionClient
  .inputSchema(tablesQuerySchema)
  .action(async ({ parsedInput }) => {
    const tables = await getAvailableTables(parsedInput);
    return { tables };
  });
