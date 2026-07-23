"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reservations, restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { markAttendanceSchema } from "@/lib/validations/attendance";

export const markAttendanceAction = roleActionClient("restaurante")
  .inputSchema(markAttendanceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.code, parsedInput.code),
    });
    if (!reservation) throw new Error("Reserva no encontrada.");

    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, reservation.restaurantId),
    });
    if (restaurant?.ownerId !== ctx.user.id) {
      throw new Error("No tienes permiso sobre esta reserva.");
    }
    if (reservation.status !== "confirmada") {
      throw new Error("Solo se puede marcar asistencia de reservas confirmadas.");
    }

    await db
      .update(reservations)
      .set({
        status: parsedInput.attended ? "completada" : "no_asistio",
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, reservation.id));

    revalidatePath("/restaurante/reservas");
    return { ok: true };
  });
