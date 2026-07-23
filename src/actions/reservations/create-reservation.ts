"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { reservations, restaurants, tables } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { createReservationSchema } from "@/lib/validations/reservation";
import { computeServiceFee, isLaunchPromoActive } from "@/lib/reservations/pricing";
import { generateReservationCode } from "@/lib/reservations/codes";
import { isValidSlotForRestaurant } from "@/lib/reservations/time";
import { RESERVATION_EXPIRY_MINUTES, type RestaurantCategory } from "@/lib/constants";

type PgError = Error & { code?: string; constraint?: string };

export const createReservationAction = authActionClient
  .inputSchema(createReservationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await db.query.restaurants.findFirst({
      where: and(eq(restaurants.id, parsedInput.restaurantId), eq(restaurants.status, "aprobado")),
    });
    if (!restaurant) throw new Error("Restaurante no encontrado.");

    if (
      !isValidSlotForRestaurant(
        parsedInput.date,
        parsedInput.timeSlot,
        restaurant.openTime,
        restaurant.closeTime,
      )
    ) {
      throw new Error("El horario elegido ya no es válido.");
    }

    const table = await db.query.tables.findFirst({
      where: and(
        eq(tables.id, parsedInput.tableId),
        eq(tables.restaurantId, parsedInput.restaurantId),
        eq(tables.isActive, true),
      ),
    });
    if (!table) throw new Error("La mesa elegida no está disponible.");
    if (table.seats < parsedInput.guests) {
      throw new Error("Esa mesa no tiene capacidad suficiente para el grupo.");
    }

    const serviceFee = computeServiceFee(restaurant.category as RestaurantCategory);

    // Reintenta un par de veces solo por si el código (aleatorio, 6 chars)
    // colisiona con uno existente; la mesa/fecha/hora se protege con el
    // índice único parcial dentro de la misma inserción transaccional.
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = generateReservationCode();
      try {
        const [reservation] = await db.transaction(async (tx) => {
          return tx
            .insert(reservations)
            .values({
              code,
              userId: ctx.user.id,
              restaurantId: restaurant.id,
              tableId: table.id,
              date: parsedInput.date,
              timeSlot: parsedInput.timeSlot,
              guests: parsedInput.guests,
              serviceFee: serviceFee.toFixed(2),
              status: "pendiente",
              notes: parsedInput.notes,
            })
            .returning();
        });

        return {
          code: reservation.code,
          serviceFee,
          promoApplied: isLaunchPromoActive(),
          expiresAt: new Date(
            reservation.createdAt.getTime() + RESERVATION_EXPIRY_MINUTES * 60 * 1000,
          ).toISOString(),
        };
      } catch (error) {
        const pgError = error as PgError;
        if (pgError.code === "23505") {
          if (pgError.constraint?.includes("table_date_slot")) {
            throw new Error("TABLE_ALREADY_BOOKED");
          }
          // Colisión de código: reintenta con uno nuevo.
          continue;
        }
        throw error;
      }
    }

    throw new Error("No se pudo generar la reserva, intenta nuevamente.");
  });
