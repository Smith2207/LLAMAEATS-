import { and, count, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { reservations } from "@/db/schema";

export async function getUserReservations(userId: string) {
  return db.query.reservations.findMany({
    where: eq(reservations.userId, userId),
    orderBy: [desc(reservations.date), desc(reservations.timeSlot)],
    with: {
      restaurant: { columns: { name: true, slug: true, district: true, coverBlobUrl: true } },
      table: { columns: { number: true, zone: true } },
      review: { columns: { id: true } },
    },
  });
}

export async function getReservationByCode(code: string) {
  return db.query.reservations.findFirst({
    where: eq(reservations.code, code),
    with: {
      restaurant: true,
      table: true,
      review: true,
      payments: { orderBy: (p, { desc }) => [desc(p.createdAt)] },
      user: { columns: { name: true, email: true } },
    },
  });
}

export async function getRestaurantReservationsForDate(restaurantId: string, date: string) {
  return db.query.reservations.findMany({
    where: and(eq(reservations.restaurantId, restaurantId), eq(reservations.date, date)),
    orderBy: [reservations.timeSlot],
    with: {
      table: { columns: { number: true, zone: true } },
      user: { columns: { id: true, name: true, phone: true, email: true } },
    },
  });
}

/**
 * Ficha del comensal para el anfitrión (§7): visitas y no-shows previos en
 * ESTE restaurante, para calibrar el riesgo antes de sentar al grupo.
 * Excluye la reserva actual del conteo.
 */
export async function getCustomerVisitHistory(
  userId: string,
  restaurantId: string,
  excludeReservationId?: string,
) {
  const base = [
    eq(reservations.userId, userId),
    eq(reservations.restaurantId, restaurantId),
    ...(excludeReservationId ? [ne(reservations.id, excludeReservationId)] : []),
  ];

  const [[completed], [noShows]] = await Promise.all([
    db
      .select({ value: count() })
      .from(reservations)
      .where(and(...base, eq(reservations.status, "completada"))),
    db
      .select({ value: count() })
      .from(reservations)
      .where(and(...base, eq(reservations.status, "no_asistio"))),
  ]);

  return { completedVisits: completed?.value ?? 0, noShows: noShows?.value ?? 0 };
}
