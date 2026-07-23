"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";
import { pauseRestaurantSchema, restaurantIdSchema } from "@/lib/validations/moderation";

/** Vuelve a "aprobada" si el período de prueba sigue vigente, o "activa" si ya se cumplió/no aplica. */
function resumedStatus(trialEndsAt: Date | null): "aprobada" | "activa" {
  return trialEndsAt && trialEndsAt.getTime() > Date.now() ? "aprobada" : "activa";
}

// activa/aprobada → pausada: bloqueo rápido self-service del local (§3.1
// transición "activa → pausada_por_el_local", §7 "bloqueo rápido").
export const pauseByOwnerAction = roleActionClient("restaurante")
  .inputSchema(pauseRestaurantSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);
    if (!["aprobada", "activa"].includes(restaurant.status)) {
      throw new Error("Solo puedes pausar un restaurante aprobado o activo.");
    }

    await db
      .update(restaurants)
      .set({
        status: "pausada",
        pausedReason: parsedInput.reason ?? "Pausado por el restaurante",
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/restaurante");
    return { ok: true };
  });

export const resumeByOwnerAction = roleActionClient("restaurante")
  .inputSchema(restaurantIdSchema)
  .action(async ({ ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);
    if (restaurant.status !== "pausada") {
      throw new Error("Este restaurante no está pausado.");
    }
    if (restaurant.pausedReason && !restaurant.pausedReason.startsWith("Pausado por el restaurante")) {
      throw new Error("Esta pausa la aplicó la plataforma; contacta a soporte para reactivar.");
    }

    await db
      .update(restaurants)
      .set({
        status: resumedStatus(restaurant.trialEndsAt),
        pausedReason: null,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/restaurante");
    return { ok: true };
  });

// Baja permanente, iniciada por el propio restaurante.
export const deactivateByOwnerAction = roleActionClient("restaurante")
  .inputSchema(restaurantIdSchema)
  .action(async ({ ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);
    await db
      .update(restaurants)
      .set({ status: "dada_de_baja", updatedAt: new Date() })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/restaurante");
    return { ok: true };
  });

// Suspensión impuesta por la plataforma (manual o desde vigilancia
// continua) — distinta de la pausa self-service: solo un admin puede
// levantarla.
export const suspendRestaurantAction = roleActionClient("admin")
  .inputSchema(pauseRestaurantSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(restaurants)
      .set({
        status: "suspendida",
        pausedReason: parsedInput.reason ?? "Suspendido por el equipo de LlamaEats",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(restaurants.id, parsedInput.restaurantId),
          inArray(restaurants.status, ["aprobada", "activa", "pausada"]),
        ),
      );

    revalidatePath("/admin/restaurantes");
    return { ok: true };
  });

// Reincorporación (§3.5): reutiliza el expediente existente, no pide
// documentos de nuevo.
export const reactivateRestaurantAction = roleActionClient("admin")
  .inputSchema(restaurantIdSchema)
  .action(async ({ parsedInput }) => {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, parsedInput.restaurantId),
    });
    if (!restaurant || restaurant.status !== "suspendida") {
      throw new Error("Solo se puede reactivar un restaurante suspendido.");
    }

    await db
      .update(restaurants)
      .set({
        status: resumedStatus(restaurant.trialEndsAt),
        pausedReason: null,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/admin/restaurantes");
    return { ok: true };
  });
