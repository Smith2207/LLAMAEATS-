"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { restaurants, waitlistEntries } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { joinWaitlistSchema } from "@/lib/validations/waitlist";
import { hasAvailableTable } from "@/lib/reservations/availability";
import { getPgErrorCode } from "@/lib/db/pg-error";

export const joinWaitlistAction = authActionClient
  .inputSchema(joinWaitlistSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await db.query.restaurants.findFirst({
      where: and(
        eq(restaurants.id, parsedInput.restaurantId),
        inArray(restaurants.status, ["aprobada", "activa"]),
      ),
    });
    if (!restaurant) throw new Error("Restaurante no encontrado.");

    const stillAvailable = await hasAvailableTable({
      restaurantId: restaurant.id,
      date: parsedInput.date,
      timeSlot: parsedInput.timeSlot,
      guests: parsedInput.guests,
      turnoverBufferMinutes: restaurant.turnoverBufferMinutes,
    });
    if (stillAvailable) {
      throw new Error("Ya hay mesas disponibles para ese horario — puedes reservar directamente.");
    }

    try {
      await db.insert(waitlistEntries).values({
        userId: ctx.user.id,
        restaurantId: restaurant.id,
        date: parsedInput.date,
        timeSlot: parsedInput.timeSlot,
        guests: parsedInput.guests,
      });
    } catch (error) {
      if (getPgErrorCode(error) === "23505") {
        throw new Error("Ya estás en la lista de espera para ese horario.");
      }
      throw error;
    }

    return { ok: true };
  });
