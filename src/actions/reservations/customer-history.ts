"use server";

import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";
import { getCustomerVisitHistory } from "@/lib/reservations/queries";

export const getCustomerHistoryAction = roleActionClient("restaurante")
  .inputSchema(z.object({ userId: z.string(), reservationCode: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);
    const reservation = await db.query.reservations.findFirst({
      where: and(eq(reservations.code, parsedInput.reservationCode), eq(reservations.restaurantId, restaurant.id)),
    });
    if (!reservation) throw new Error("Reserva no encontrada.");

    return getCustomerVisitHistory(parsedInput.userId, restaurant.id, reservation.id);
  });

export const updateReservationStaffNotesAction = roleActionClient("restaurante")
  .inputSchema(z.object({ code: z.string(), staffNotes: z.string().trim().max(500) }))
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);
    await db
      .update(reservations)
      .set({ staffNotes: parsedInput.staffNotes || null, updatedAt: new Date() })
      .where(and(eq(reservations.code, parsedInput.code), eq(reservations.restaurantId, restaurant.id)));
    return { ok: true };
  });
