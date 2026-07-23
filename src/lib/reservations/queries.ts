import { and, desc, eq } from "drizzle-orm";
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
      user: { columns: { name: true, phone: true, email: true } },
    },
  });
}
