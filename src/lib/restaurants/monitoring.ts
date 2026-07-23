import { and, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { reservations, restaurants } from "@/db/schema";
import { lookupRuc } from "@/lib/ruc/lookup";

/** observada con plazo vencido y sin reenvío → caducada (§3.4). */
export async function expireObservedApplications() {
  const expired = await db
    .update(restaurants)
    .set({ status: "caducada", updatedAt: new Date() })
    .where(and(eq(restaurants.status, "observada"), lt(restaurants.observationDeadline, new Date())))
    .returning({ id: restaurants.id });
  return expired.length;
}

/** aprobada con período de prueba cumplido → activa (§3.4, graduación). */
export async function graduateTrials() {
  const graduated = await db
    .update(restaurants)
    .set({ status: "activa", updatedAt: new Date() })
    .where(and(eq(restaurants.status, "aprobada"), lt(restaurants.trialEndsAt, new Date())))
    .returning({ id: restaurants.id });
  return graduated.length;
}

/**
 * Revisión mensual del estado tributario del RUC (§3.5): si SUNAT confirma
 * que un restaurante activo pasó a baja o no habido, se suspende
 * automáticamente. Solo revisa aprobada/activa (no tiene sentido re-chequear
 * uno ya rechazado/suspendido), y solo los que no se chequearon en 30 días
 * (o nunca), en lotes chicos para no saturar el proveedor externo.
 */
export async function recheckRucStatus(batchSize = 20) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const candidates = await db.query.restaurants.findMany({
    where: and(
      inArray(restaurants.status, ["aprobada", "activa"]),
      or(isNull(restaurants.lastRucCheckAt), lt(restaurants.lastRucCheckAt, thirtyDaysAgo)),
    ),
    columns: { id: true, ruc: true, status: true },
    limit: batchSize,
  });

  let suspended = 0;
  for (const r of candidates) {
    if (!r.ruc) continue;
    const info = await lookupRuc(r.ruc);
    const isBad = info && (info.estado.toUpperCase() !== "ACTIVO" || info.condicion.toUpperCase() !== "HABIDO");

    await db
      .update(restaurants)
      .set({
        lastRucCheckAt: new Date(),
        ...(isBad
          ? {
              status: "suspendida" as const,
              pausedReason: `RUC con estado "${info?.estado}" / condición "${info?.condicion}" (revisión automática mensual)`,
            }
          : {}),
      })
      .where(eq(restaurants.id, r.id));

    if (isBad) suspended++;
  }

  return { checked: candidates.length, suspended };
}

/**
 * Inactividad prolongada (§3.5): un restaurante "activa" sin ninguna
 * reserva nueva en 30 días se pausa automáticamente y se avisa (el aviso en
 * sí queda para el sistema de notificaciones; aquí solo se aplica la pausa).
 */
export async function pauseInactiveRestaurants() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({ id: restaurants.id, lastReservationAt: sql<Date | null>`max(${reservations.createdAt})` })
    .from(restaurants)
    .leftJoin(reservations, eq(reservations.restaurantId, restaurants.id))
    .where(eq(restaurants.status, "activa"))
    .groupBy(restaurants.id);

  const inactiveIds = rows
    .filter((r) => !r.lastReservationAt || new Date(r.lastReservationAt) < thirtyDaysAgo)
    .map((r) => r.id);

  if (inactiveIds.length === 0) return 0;

  const paused = await db
    .update(restaurants)
    .set({
      status: "pausada",
      pausedReason: "Sin reservas nuevas en 30 días (pausa automática)",
      updatedAt: new Date(),
    })
    .where(and(eq(restaurants.status, "activa"), inArray(restaurants.id, inactiveIds)))
    .returning({ id: restaurants.id });

  return paused.length;
}
