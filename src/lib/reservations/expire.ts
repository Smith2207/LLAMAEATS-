import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { reservations, restaurants, users } from "@/db/schema";
import { sendReservationCancelledEmail } from "@/lib/email/send";
import { RESERVATION_EXPIRY_MINUTES } from "@/lib/constants";

/**
 * Cancela toda reserva `pendiente` cuyo `createdAt` supere la ventana de
 * pago. Recalcula el corte en cada llamada, así que es correcto sin
 * importar cada cuánto se invoque (cron diario de Vercel, cron externo, etc.).
 */
export async function expireStaleReservations() {
  const cutoff = new Date(Date.now() - RESERVATION_EXPIRY_MINUTES * 60 * 1000);

  const expired = await db.transaction((tx) =>
    tx
      .update(reservations)
      .set({ status: "cancelada", updatedAt: new Date() })
      .where(and(eq(reservations.status, "pendiente"), lt(reservations.createdAt, cutoff)))
      .returning({
        id: reservations.id,
        code: reservations.code,
        userId: reservations.userId,
        restaurantId: reservations.restaurantId,
        date: reservations.date,
        timeSlot: reservations.timeSlot,
      }),
  );

  await Promise.allSettled(
    expired.map(async (r) => {
      const [user, restaurant] = await Promise.all([
        db.query.users.findFirst({ where: eq(users.id, r.userId) }),
        db.query.restaurants.findFirst({ where: eq(restaurants.id, r.restaurantId) }),
      ]);
      if (!user?.email || !restaurant) return;
      await sendReservationCancelledEmail({
        to: user.email,
        restaurantName: restaurant.name,
        date: r.date,
        timeSlot: r.timeSlot,
        code: r.code,
        refunded: false,
      });
    }),
  );

  return expired.length;
}
