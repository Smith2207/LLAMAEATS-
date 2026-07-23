import { and, eq, gte, inArray, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { reservations, tables } from "@/db/schema";
import { generateTimeSlots, isValidSlotForRestaurant } from "./time";

const ACTIVE_STATUSES = ["pendiente", "confirmada"] as const;

async function getBookedTableIds(restaurantId: string, date: string, timeSlot: string) {
  const rows = await db
    .select({ tableId: reservations.tableId })
    .from(reservations)
    .where(
      and(
        eq(reservations.restaurantId, restaurantId),
        eq(reservations.date, date),
        eq(reservations.timeSlot, timeSlot),
        inArray(reservations.status, ACTIVE_STATUSES),
      ),
    );
  return rows.map((r) => r.tableId);
}

export async function getAvailableTables({
  restaurantId,
  date,
  timeSlot,
  guests,
}: {
  restaurantId: string;
  date: string;
  timeSlot: string;
  guests: number;
}) {
  const bookedTableIds = await getBookedTableIds(restaurantId, date, timeSlot);

  return db.query.tables.findMany({
    where: and(
      eq(tables.restaurantId, restaurantId),
      eq(tables.isActive, true),
      gte(tables.seats, guests),
      bookedTableIds.length > 0 ? notInArray(tables.id, bookedTableIds) : undefined,
    ),
    orderBy: (t, { asc }) => [asc(t.zone), asc(t.number)],
  });
}

export async function hasAvailableTable(params: {
  restaurantId: string;
  date: string;
  timeSlot: string;
  guests: number;
}) {
  const available = await getAvailableTables(params);
  return available.length > 0;
}

/** Bloques de 90 min del restaurante que aún tienen al menos una mesa libre. */
export async function getAvailableSlots({
  restaurantId,
  date,
  openTime,
  closeTime,
  guests,
}: {
  restaurantId: string;
  date: string;
  openTime: string;
  closeTime: string;
  guests: number;
}) {
  const candidateSlots = generateTimeSlots(openTime, closeTime).filter((slot) =>
    isValidSlotForRestaurant(date, slot, openTime, closeTime),
  );

  const results = await Promise.all(
    candidateSlots.map(async (slot) => ({
      slot,
      available: await hasAvailableTable({ restaurantId, date, timeSlot: slot, guests }),
    })),
  );

  return results.filter((r) => r.available).map((r) => r.slot);
}
