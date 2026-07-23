"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { submitRestaurantSchema } from "@/lib/validations/restaurant";
import { lookupRuc } from "@/lib/ruc/lookup";
import { assessRestaurantRisk } from "@/lib/restaurants/risk";

const RESUBMITTABLE_STATUSES = ["observada", "rechazada", "caducada"] as const;

// observada/rechazada/caducada → enviada (§3.1, transición inversa
// "observada → enviada"): el postulante corrige y vuelve a la cola,
// recalculando riesgo desde cero y limpiando el expediente de revisión
// anterior (bloqueo, nota, aprobador previo).
export const resubmitApplicationAction = roleActionClient("restaurante")
  .inputSchema(submitRestaurantSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.ownerId, ctx.user.id),
    });
    if (!restaurant) throw new Error("No tienes una solicitud de afiliación registrada.");
    if (!RESUBMITTABLE_STATUSES.includes(restaurant.status as (typeof RESUBMITTABLE_STATUSES)[number])) {
      throw new Error("Esta solicitud no está en un estado que permita reenviarla.");
    }

    const rucChanged = parsedInput.ruc !== restaurant.ruc;
    const rucInfo = rucChanged
      ? await lookupRuc(parsedInput.ruc)
      : restaurant.rucVerifiedAt
        ? { razonSocial: restaurant.razonSocial!, estado: restaurant.sunatEstado!, condicion: restaurant.sunatCondicion! }
        : null;

    const risk = await assessRestaurantRisk({
      restaurantId: restaurant.id,
      name: parsedInput.name,
      address: parsedInput.address,
      district: parsedInput.district,
      rucVerifiedAt: rucInfo ? (rucChanged ? new Date() : restaurant.rucVerifiedAt) : null,
      sunatEstado: rucInfo?.estado ?? null,
      sunatCondicion: rucInfo?.condicion ?? null,
    });

    await db
      .update(restaurants)
      .set({
        name: parsedInput.name,
        description: parsedInput.description,
        address: parsedInput.address,
        district: parsedInput.district,
        category: parsedInput.category,
        ruc: parsedInput.ruc,
        razonSocial: rucInfo?.razonSocial ?? null,
        sunatEstado: rucInfo?.estado ?? null,
        sunatCondicion: rucInfo?.condicion ?? null,
        rucVerifiedAt: rucChanged ? (rucInfo ? new Date() : null) : restaurant.rucVerifiedAt,
        openTime: parsedInput.openTime,
        closeTime: parsedInput.closeTime,
        status: "enviada",
        riskLevel: risk.level,
        riskSignals: risk.signals,
        reviewerId: null,
        reviewLockedAt: null,
        observationNote: null,
        observationDeadline: null,
        firstApproverId: null,
        updatedAt: new Date(),
      })
      .where(and(eq(restaurants.id, restaurant.id), inArray(restaurants.status, [...RESUBMITTABLE_STATUSES])));

    revalidatePath("/restaurante");
    return { ok: true };
  });
