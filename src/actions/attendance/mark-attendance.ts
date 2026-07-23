"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reservations, restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { reservationCodeInputSchema } from "@/lib/validations/attendance";

async function loadOwnedReservation(code: string, ownerUserId: string) {
  const reservation = await db.query.reservations.findFirst({
    where: eq(reservations.code, code),
  });
  if (!reservation) throw new Error("Reserva no encontrada.");

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, reservation.restaurantId),
  });
  if (restaurant?.ownerId !== ownerUserId) {
    throw new Error("No tienes permiso sobre esta reserva.");
  }
  return reservation;
}

// confirmada → en_curso: el anfitrión valida el código o busca por nombre y
// marca la llegada; la mesa pasa a ocupada (§4.5, §7).
export const markArrivalAction = roleActionClient("restaurante")
  .inputSchema(reservationCodeInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const reservation = await loadOwnedReservation(parsedInput.code, ctx.user.id);
    if (reservation.status !== "confirmada") {
      throw new Error("Solo se puede marcar llegada de reservas confirmadas.");
    }

    await db
      .update(reservations)
      .set({ status: "en_curso", arrivedAt: new Date(), updatedAt: new Date() })
      .where(eq(reservations.id, reservation.id));

    revalidatePath("/restaurante/reservas");
    return { ok: true };
  });

// en_curso → completada: el grupo terminó y la mesa se libera.
export const releaseTableAction = roleActionClient("restaurante")
  .inputSchema(reservationCodeInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const reservation = await loadOwnedReservation(parsedInput.code, ctx.user.id);
    if (reservation.status !== "en_curso") {
      throw new Error("Solo se puede liberar una mesa que está en curso.");
    }

    await db
      .update(reservations)
      .set({ status: "completada", updatedAt: new Date() })
      .where(eq(reservations.id, reservation.id));

    revalidatePath("/restaurante/reservas");
    return { ok: true };
  });

// confirmada → no_asistio: el anfitrión constata que el comensal nunca
// llegó (el sistema también lo marca automáticamente pasado el margen de
// tolerancia vía cron; esto es el marcado manual anticipado).
export const markNoShowAction = roleActionClient("restaurante")
  .inputSchema(reservationCodeInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const reservation = await loadOwnedReservation(parsedInput.code, ctx.user.id);
    if (reservation.status !== "confirmada") {
      throw new Error("Solo se puede marcar no-asistencia de reservas confirmadas.");
    }

    await db
      .update(reservations)
      .set({ status: "no_asistio", updatedAt: new Date() })
      .where(eq(reservations.id, reservation.id));

    revalidatePath("/restaurante/reservas");
    return { ok: true };
  });
