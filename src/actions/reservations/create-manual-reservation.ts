"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { reservations, tables, users } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";
import { createManualReservationSchema } from "@/lib/validations/manual-reservation";
import { generateReservationCode } from "@/lib/reservations/codes";
import { isValidSlotForRestaurant } from "@/lib/reservations/time";
import { getEffectiveHours } from "@/lib/reservations/schedule";
import { getPgErrorCode, getPgErrorConstraint } from "@/lib/db/pg-error";

/** Busca un cliente existente por celular; si no existe, crea una ficha liviana ("guest"). */
async function findOrCreateGuestUser(name: string, phone: string) {
  const existing = await db.query.users.findFirst({
    where: and(eq(users.phone, phone), eq(users.role, "cliente")),
  });
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      name,
      phone,
      email: `guest-${crypto.randomUUID()}@llamaeats.invalid`,
      role: "cliente",
    })
    .returning();
  return created;
}

// Reservas telefónicas / de mostrador (§7): el anfitrión las registra para
// que la disponibilidad refleje la realidad del local, sin pasar por el
// flujo de pago del comensal (no hay tarifa de servicio de por medio — esa
// tarifa es por reservas hechas a través de la plataforma).
export const createManualReservationAction = roleActionClient("restaurante")
  .inputSchema(createManualReservationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    const effectiveHours = await getEffectiveHours(
      restaurant.id,
      parsedInput.date,
      restaurant.openTime,
      restaurant.closeTime,
    );
    if (
      !effectiveHours ||
      !isValidSlotForRestaurant(
        parsedInput.date,
        parsedInput.timeSlot,
        effectiveHours.openTime,
        effectiveHours.closeTime,
        restaurant.lastBookingBeforeCloseMinutes,
      )
    ) {
      throw new Error("El horario elegido ya no es válido.");
    }

    const table = await db.query.tables.findFirst({
      where: and(
        eq(tables.id, parsedInput.tableId),
        eq(tables.restaurantId, restaurant.id),
        eq(tables.isActive, true),
      ),
    });
    if (!table) throw new Error("La mesa elegida no está disponible.");
    if (parsedInput.guests < table.minSeats || parsedInput.guests > table.seats) {
      throw new Error("Esa mesa no tiene la capacidad adecuada para el grupo.");
    }

    const guest = await findOrCreateGuestUser(parsedInput.guestName, parsedInput.guestPhone);

    for (let attempt = 0; attempt < 3; attempt++) {
      const code = generateReservationCode();
      try {
        const [reservation] = await db.transaction(async (tx) => {
          return tx
            .insert(reservations)
            .values({
              code,
              userId: guest.id,
              restaurantId: restaurant.id,
              tableId: table.id,
              date: parsedInput.date,
              timeSlot: parsedInput.timeSlot,
              guests: parsedInput.guests,
              serviceFee: "0.00",
              status: "confirmada",
              paidAt: new Date(),
              notes: parsedInput.notes,
              createdByStaffId: ctx.user.id,
            })
            .returning();
        });
        return { code: reservation.code };
      } catch (error) {
        if (getPgErrorCode(error) === "23505") {
          if (getPgErrorConstraint(error)?.includes("table_date_slot")) {
            throw new Error("Esa mesa ya está ocupada en ese horario.");
          }
          continue; // colisión de código, reintenta
        }
        throw error;
      }
    }

    throw new Error("No se pudo registrar la reserva, intenta nuevamente.");
  });
