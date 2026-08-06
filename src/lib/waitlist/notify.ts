import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { restaurants, users, waitlistEntries } from "@/db/schema";
import { hasAvailableTable } from "@/lib/reservations/availability";
import { isWithinBookingLeadWindow } from "@/lib/reservations/time";
import { sendWaitlistSlotAvailableEmail } from "@/lib/email/send";

/**
 * Se llama después de cualquier evento que libere un cupo (cancelación,
 * expiración, reprogramación fuera de ese horario). Avisa a todos los que
 * esperan ese restaurante+fecha+horario cuyo tamaño de grupo ahora entra —
 * no es una reserva retenida para ellos, es "es por orden de llegada",
 * igual que la lista de espera de un restaurante real: la propia
 * disponibilidad en vivo y el índice único de `reservations` siguen siendo
 * el único guardia real contra doble reserva.
 */
export async function notifyWaitlistIfSlotFreed(restaurantId: string, date: string, timeSlot: string) {
  // Si ese horario ya no se puede reservar (pasó o está fuera de la
  // ventana de antelación mínima), avisar solo generaría un email que
  // termina en error al intentar reservar — mejor no notificar.
  if (!isWithinBookingLeadWindow(date, timeSlot)) return;

  const waiting = await db.query.waitlistEntries.findMany({
    where: and(
      eq(waitlistEntries.restaurantId, restaurantId),
      eq(waitlistEntries.date, date),
      eq(waitlistEntries.timeSlot, timeSlot),
      inArray(waitlistEntries.status, ["activa"]),
    ),
  });
  if (waiting.length === 0) return;

  const restaurant = await db.query.restaurants.findFirst({ where: eq(restaurants.id, restaurantId) });
  if (!restaurant) return;

  await Promise.allSettled(
    waiting.map(async (entry) => {
      const available = await hasAvailableTable({
        restaurantId,
        date,
        timeSlot,
        guests: entry.guests,
        turnoverBufferMinutes: restaurant.turnoverBufferMinutes,
      });
      if (!available) return;

      await db
        .update(waitlistEntries)
        .set({ status: "notificada", notifiedAt: new Date() })
        .where(eq(waitlistEntries.id, entry.id));

      const user = await db.query.users.findFirst({ where: eq(users.id, entry.userId) });
      if (!user?.email) return;

      try {
        await sendWaitlistSlotAvailableEmail({
          to: user.email,
          restaurantName: restaurant.name,
          restaurantSlug: restaurant.slug,
          date,
          timeSlot,
          guests: entry.guests,
        });
      } catch (err) {
        console.error("No se pudo notificar cupo liberado en lista de espera", err);
      }
    }),
  );
}
