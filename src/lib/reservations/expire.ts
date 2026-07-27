import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { reservations, restaurants, users, waitlistEntries } from "@/db/schema";
import { sendReservationCancelledEmail } from "@/lib/email/send";
import { NO_SHOW_GRACE_MINUTES, RESERVATION_EXPIRY_MINUTES } from "@/lib/constants";
import { reservationInstant, todayInLima } from "./time";
import { notifyWaitlistIfSlotFreed } from "@/lib/waitlist/notify";

/**
 * Expira toda reserva `pendiente_pago` cuyo `createdAt` supere la ventana de
 * retención de la mesa. Recalcula el corte en cada llamada, así que es
 * correcto sin importar cada cuánto se invoque (cron diario de Vercel, cron
 * externo, etc.) y reejecutable sin efectos duplicados (una vez expirada,
 * ya no vuelve a aparecer en el WHERE).
 */
export async function expireStaleReservations() {
  const cutoff = new Date(Date.now() - RESERVATION_EXPIRY_MINUTES * 60 * 1000);

  const expired = await db.transaction((tx) =>
    tx
      .update(reservations)
      .set({ status: "expirada", updatedAt: new Date() })
      .where(and(eq(reservations.status, "pendiente_pago"), lt(reservations.createdAt, cutoff)))
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
      if (user?.email && restaurant) {
        await sendReservationCancelledEmail({
          to: user.email,
          restaurantName: restaurant.name,
          date: r.date,
          timeSlot: r.timeSlot,
          code: r.code,
          refunded: false,
        });
      }
      await notifyWaitlistIfSlotFreed(r.restaurantId, r.date, r.timeSlot);
    }),
  );

  return expired.length;
}

/**
 * Marca como `no_asistio` toda reserva `confirmada` cuyo bloque horario más
 * el margen de tolerancia ya pasó y a la que el anfitrión nunca marcó
 * llegada. Recorre solo confirmadas de los últimos 2 días (evita escanear
 * todo el historial) y recalcula el corte contra `reservationInstant`, que
 * ya resuelve correctamente la zona horaria de Lima.
 */
export async function markNoShowReservations() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const candidates = await db.query.reservations.findMany({
    where: and(eq(reservations.status, "confirmada"), gte(reservations.date, twoDaysAgo)),
    columns: { id: true, date: true, timeSlot: true },
  });

  const overdueIds = candidates
    .filter((r) => {
      const cutoff = reservationInstant(r.date, r.timeSlot).getTime() + NO_SHOW_GRACE_MINUTES * 60 * 1000;
      return Date.now() > cutoff;
    })
    .map((r) => r.id);

  if (overdueIds.length === 0) return 0;

  const updated = await db
    .update(reservations)
    .set({ status: "no_asistio", updatedAt: new Date() })
    .where(and(eq(reservations.status, "confirmada"), inArray(reservations.id, overdueIds)))
    .returning({ id: reservations.id });

  return updated.length;
}

/**
 * Cierra los apuntes de lista de espera cuya fecha ya pasó y a los que
 * nunca se les avisó de un cupo (o se les avisó pero nunca reservaron) —
 * evita que queden colgados para siempre bloqueando el índice único de
 * "un apunte activo por horario".
 */
export async function expireStaleWaitlistEntries() {
  const today = todayInLima();

  const updated = await db
    .update(waitlistEntries)
    .set({ status: "expirada" })
    .where(
      and(
        lt(waitlistEntries.date, today),
        inArray(waitlistEntries.status, ["activa", "notificada"]),
      ),
    )
    .returning({ id: waitlistEntries.id });

  return updated.length;
}
