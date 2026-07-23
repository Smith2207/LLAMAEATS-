"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { reservations, restaurants, tables } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { rescheduleReservationSchema } from "@/lib/validations/reservation";
import { isValidSlotForRestaurant, reservationInstant } from "@/lib/reservations/time";
import { FREE_CANCELLATION_WINDOW_HOURS } from "@/lib/constants";

type PgError = Error & { code?: string; constraint?: string };

export const rescheduleReservationAction = authActionClient
  .inputSchema(rescheduleReservationSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      return await db.transaction(async (tx) => {
        const [reservation] = await tx
          .select()
          .from(reservations)
          .where(eq(reservations.code, parsedInput.code))
          .for("update");

        if (!reservation || reservation.userId !== ctx.user.id) {
          throw new Error("Reserva no encontrada.");
        }
        if (!["pendiente", "confirmada"].includes(reservation.status)) {
          throw new Error("Esta reserva ya no se puede reprogramar.");
        }

        const currentSlot = reservationInstant(reservation.date, reservation.timeSlot);
        const hoursUntil = (currentSlot.getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursUntil <= FREE_CANCELLATION_WINDOW_HOURS) {
          throw new Error(
            `Solo puedes reprogramar con más de ${FREE_CANCELLATION_WINDOW_HOURS}h de anticipación.`,
          );
        }

        const restaurant = await tx.query.restaurants.findFirst({
          where: eq(restaurants.id, reservation.restaurantId),
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
          throw new Error("El nuevo horario elegido no es válido.");
        }

        const table = await tx.query.tables.findFirst({
          where: and(
            eq(tables.id, parsedInput.tableId),
            eq(tables.restaurantId, reservation.restaurantId),
            eq(tables.isActive, true),
          ),
        });
        if (!table) throw new Error("La mesa elegida no está disponible.");
        if (table.seats < reservation.guests) {
          throw new Error("Esa mesa no tiene capacidad suficiente para el grupo.");
        }

        await tx
          .update(reservations)
          .set({
            tableId: parsedInput.tableId,
            date: parsedInput.date,
            timeSlot: parsedInput.timeSlot,
            updatedAt: new Date(),
          })
          .where(eq(reservations.id, reservation.id));

        return { code: reservation.code };
      });
    } catch (error) {
      const pgError = error as PgError;
      if (pgError.code === "23505" && pgError.constraint?.includes("table_date_slot")) {
        throw new Error("TABLE_ALREADY_BOOKED");
      }
      throw error;
    }
  });
