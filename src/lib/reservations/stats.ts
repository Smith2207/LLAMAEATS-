import { and, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { reservations, restaurants } from "@/db/schema";
import { todayInLima } from "./time";

function daysAgoInLima(days: number): string {
  const d = new Date(todayInLima());
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function getRestaurantOccupancyByDay(restaurantId: string, days = 14) {
  const since = daysAgoInLima(days);

  const rows = await db
    .select({
      date: reservations.date,
      count: sql<number>`count(*)::int`,
    })
    .from(reservations)
    .where(
      and(
        eq(reservations.restaurantId, restaurantId),
        gte(reservations.date, since),
        inArray(reservations.status, ["confirmada", "en_curso", "completada", "no_asistio"]),
      ),
    )
    .groupBy(reservations.date)
    .orderBy(reservations.date);

  const byDate = new Map(rows.map((r) => [r.date, r.count]));
  const result: { date: string; reservas: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgoInLima(i);
    result.push({ date, reservas: byDate.get(date) ?? 0 });
  }
  return result;
}

export async function getPlatformStatsByDay(days = 14) {
  const since = daysAgoInLima(days);

  const rows = await db
    .select({
      date: reservations.date,
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${reservations.serviceFee}), 0)::float`,
    })
    .from(reservations)
    .where(
      and(
        gte(reservations.date, since),
        inArray(reservations.status, ["confirmada", "en_curso", "completada", "no_asistio"]),
      ),
    )
    .groupBy(reservations.date)
    .orderBy(reservations.date);

  const byDate = new Map(rows.map((r) => [r.date, r]));
  const result: { date: string; reservas: number; ingresos: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgoInLima(i);
    const row = byDate.get(date);
    result.push({ date, reservas: row?.count ?? 0, ingresos: row?.revenue ?? 0 });
  }
  return result;
}

export async function getCancellationRate(days = 30) {
  const since = daysAgoInLima(days);

  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      cancelled: sql<number>`count(*) filter (where ${reservations.status} in ('cancelada_comensal', 'cancelada_local'))::int`,
    })
    .from(reservations)
    .where(and(gte(reservations.date, since), ne(reservations.status, "pendiente_pago")));

  const total = row?.total ?? 0;
  const cancelled = row?.cancelled ?? 0;
  return { total, cancelled, rate: total > 0 ? cancelled / total : 0 };
}

export async function getTopRestaurants(limit = 5) {
  const rows = await db
    .select({
      restaurantId: reservations.restaurantId,
      name: restaurants.name,
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${reservations.serviceFee}), 0)::float`,
    })
    .from(reservations)
    .innerJoin(restaurants, eq(restaurants.id, reservations.restaurantId))
    .where(inArray(reservations.status, ["confirmada", "en_curso", "completada", "no_asistio"]))
    .groupBy(reservations.restaurantId, restaurants.name)
    .orderBy(sql`count(*) desc`)
    .limit(limit);

  return rows;
}
