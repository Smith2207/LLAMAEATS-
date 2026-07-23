import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { reservations, tables } from "@/db/schema";
import { generateTimeSlots, isValidSlotForRestaurant, timeToMinutes } from "./time";
import { getEffectiveHours } from "./schedule";
import { RESERVATION_BLOCK_MINUTES } from "@/lib/constants";

const ACTIVE_STATUSES = ["pendiente_pago", "confirmada", "en_curso"] as const;

type BusyInterval = { tableId: string; start: number; end: number };

/**
 * Intervalos ocupados de cada mesa para todo el día, en minutos desde
 * medianoche, incluyendo el colchón de rotación. Calcularlo una vez para el
 * día completo (en vez de por slot exacto) permite detectar solapes entre
 * bloques de la grilla, no solo coincidencias exactas de horario: una mesa
 * reservada a las 19:30 con bloque de 90 min + 15 de colchón sigue ocupada
 * a las 21:00 aunque ese sea otro slot de la grilla.
 */
async function getBusyIntervals(
  restaurantId: string,
  date: string,
  turnoverBufferMinutes: number,
): Promise<BusyInterval[]> {
  const rows = await db
    .select({ tableId: reservations.tableId, timeSlot: reservations.timeSlot })
    .from(reservations)
    .where(
      and(
        eq(reservations.restaurantId, restaurantId),
        eq(reservations.date, date),
        inArray(reservations.status, ACTIVE_STATUSES),
      ),
    );

  return rows.map((r) => {
    const start = timeToMinutes(r.timeSlot);
    return { tableId: r.tableId, start, end: start + RESERVATION_BLOCK_MINUTES + turnoverBufferMinutes };
  });
}

function isTableBusyAt(intervals: BusyInterval[], tableId: string, slotStart: number) {
  const slotEnd = slotStart + RESERVATION_BLOCK_MINUTES;
  return intervals.some(
    (iv) => iv.tableId === tableId && iv.start < slotEnd && slotStart < iv.end,
  );
}

export async function getAvailableTables({
  restaurantId,
  date,
  timeSlot,
  guests,
  turnoverBufferMinutes = 15,
}: {
  restaurantId: string;
  date: string;
  timeSlot: string;
  guests: number;
  turnoverBufferMinutes?: number;
}) {
  const intervals = await getBusyIntervals(restaurantId, date, turnoverBufferMinutes);
  const slotStart = timeToMinutes(timeSlot);

  const candidates = await db.query.tables.findMany({
    where: and(
      eq(tables.restaurantId, restaurantId),
      eq(tables.isActive, true),
      eq(tables.platformBookable, true),
    ),
    orderBy: (t, { asc }) => [asc(t.zone), asc(t.number)],
  });

  return candidates.filter(
    (t) => guests >= t.minSeats && guests <= t.seats && !isTableBusyAt(intervals, t.id, slotStart),
  );
}

export async function hasAvailableTable(params: {
  restaurantId: string;
  date: string;
  timeSlot: string;
  guests: number;
  turnoverBufferMinutes?: number;
}) {
  const available = await getAvailableTables(params);
  return available.length > 0;
}

/** Bloques del restaurante que aún tienen al menos una mesa libre, respetando excepciones de calendario. */
export async function getAvailableSlots({
  restaurantId,
  date,
  openTime,
  closeTime,
  guests,
  turnoverBufferMinutes = 15,
  lastBookingBeforeCloseMinutes = 0,
}: {
  restaurantId: string;
  date: string;
  openTime: string;
  closeTime: string;
  guests: number;
  turnoverBufferMinutes?: number;
  lastBookingBeforeCloseMinutes?: number;
}) {
  const effective = await getEffectiveHours(restaurantId, date, openTime, closeTime);
  if (!effective) return [];

  const candidateSlots = generateTimeSlots(effective.openTime, effective.closeTime).filter((slot) =>
    isValidSlotForRestaurant(
      date,
      slot,
      effective.openTime,
      effective.closeTime,
      lastBookingBeforeCloseMinutes,
    ),
  );

  const results = await Promise.all(
    candidateSlots.map(async (slot) => ({
      slot,
      available: await hasAvailableTable({
        restaurantId,
        date,
        timeSlot: slot,
        guests,
        turnoverBufferMinutes,
      }),
    })),
  );

  return results.filter((r) => r.available).map((r) => r.slot);
}
