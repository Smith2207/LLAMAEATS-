import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { restaurantScheduleExceptions } from "@/db/schema";

export type EffectiveHours = { openTime: string; closeTime: string } | null;

/**
 * Resuelve el horario real de un restaurante para una fecha puntual,
 * aplicando la excepción de calendario si existe (§4.2): "cerrado" y
 * "evento_privado" devuelven null (no se acepta ninguna reserva ese día),
 * "horario_especial" reemplaza el horario base, y si no hay excepción se
 * usa el horario base sin cambios.
 */
export async function getEffectiveHours(
  restaurantId: string,
  date: string,
  baseOpenTime: string,
  baseCloseTime: string,
): Promise<EffectiveHours> {
  const exception = await db.query.restaurantScheduleExceptions.findFirst({
    where: and(
      eq(restaurantScheduleExceptions.restaurantId, restaurantId),
      eq(restaurantScheduleExceptions.date, date),
    ),
  });

  if (!exception) return { openTime: baseOpenTime, closeTime: baseCloseTime };
  if (exception.type === "cerrado" || exception.type === "evento_privado") return null;

  return {
    openTime: exception.openTime ?? baseOpenTime,
    closeTime: exception.closeTime ?? baseCloseTime,
  };
}

export async function getRestaurantScheduleExceptions(restaurantId: string) {
  return db.query.restaurantScheduleExceptions.findMany({
    where: eq(restaurantScheduleExceptions.restaurantId, restaurantId),
    orderBy: (t, { asc }) => [asc(t.date)],
  });
}

export async function getUpcomingHolidays(limit = 12) {
  const today = new Date().toISOString().slice(0, 10);
  return db.query.holidays.findMany({
    where: (h, { gte }) => gte(h.date, today),
    orderBy: (h, { asc }) => [asc(h.date)],
    limit,
  });
}
