"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reservations, reviews } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { createReviewSchema } from "@/lib/validations/review";

export const createReviewAction = authActionClient
  .inputSchema(createReviewSchema)
  .action(async ({ parsedInput, ctx }) => {
    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.code, parsedInput.reservationCode),
    });

    if (!reservation || reservation.userId !== ctx.user.id) {
      throw new Error("Reserva no encontrada.");
    }
    if (reservation.status !== "completada") {
      throw new Error("Solo puedes reseñar reservas completadas.");
    }

    await db.insert(reviews).values({
      reservationId: reservation.id,
      userId: ctx.user.id,
      restaurantId: reservation.restaurantId,
      rating: parsedInput.rating,
      comment: parsedInput.comment,
    });

    revalidatePath(`/dashboard/reservas/${parsedInput.reservationCode}`);

    return { ok: true };
  });
