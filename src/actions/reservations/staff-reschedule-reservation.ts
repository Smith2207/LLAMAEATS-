"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { reservations, tables } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";
import { isValidSlotForRestaurant } from "@/lib/reservations/time";
import { getEffectiveHours } from "@/lib/reservations/schedule";
import { getPgErrorCode, getPgErrorConstraint } from "@/lib/db/pg-error";

const staffRescheduleSchema = z.object({
  code: z.string(),
  tableId: z.string(),
  timeSlot: z.string(),
});

// Arrastrar una reserva en la línea de tiempo (§7): a diferencia de
// rescheduleReservationAction (comensal), el anfitrión puede reprogramar
// libremente dentro de su propio local — sin ventana de 2h ni tope de 2
// reprogramaciones, y puede usar mesas "solo mostrador". Sigue re-validando
// horario/capacidad/disponibilidad real en el servidor: el arrastre en la
// pantalla es solo la intención, la confirmación real es esta acción.
export const staffRescheduleReservationAction = roleActionClient("restaurante")
  .inputSchema(staffRescheduleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    const reservation = await db.query.reservations.findFirst({
      where: and(eq(reservations.code, parsedInput.code), eq(reservations.restaurantId, restaurant.id)),
    });
    if (!reservation) throw new Error("Reserva no encontrada.");
    if (!["pendiente_pago", "confirmada"].includes(reservation.status)) {
      throw new Error("Solo se pueden mover reservas pendientes o confirmadas.");
    }

    const effectiveHours = await getEffectiveHours(
      restaurant.id,
      reservation.date,
      restaurant.openTime,
      restaurant.closeTime,
    );
    if (
      !effectiveHours ||
      !isValidSlotForRestaurant(
        reservation.date,
        parsedInput.timeSlot,
        effectiveHours.openTime,
        effectiveHours.closeTime,
        restaurant.lastBookingBeforeCloseMinutes,
      )
    ) {
      throw new Error("Ese horario no es válido.");
    }

    const table = await db.query.tables.findFirst({
      where: and(
        eq(tables.id, parsedInput.tableId),
        eq(tables.restaurantId, restaurant.id),
        eq(tables.isActive, true),
      ),
    });
    if (!table) throw new Error("Esa mesa no está disponible.");
    if (reservation.guests < table.minSeats || reservation.guests > table.seats) {
      throw new Error("Esa mesa no tiene la capacidad adecuada para el grupo.");
    }

    try {
      await db
        .update(reservations)
        .set({ tableId: parsedInput.tableId, timeSlot: parsedInput.timeSlot, updatedAt: new Date() })
        .where(eq(reservations.id, reservation.id));
    } catch (error) {
      if (getPgErrorCode(error) === "23505" && getPgErrorConstraint(error)?.includes("table_date_slot")) {
        throw new Error("Esa mesa ya está ocupada en ese horario.");
      }
      throw error;
    }

    return { ok: true };
  });
