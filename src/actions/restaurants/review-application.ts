"use server";

import { and, eq, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import {
  observeApplicationSchema,
  rejectApplicationSchema,
  restaurantIdSchema,
} from "@/lib/validations/moderation";

const REVIEW_PATH = "/admin/restaurantes";

// enviada → en_revision, bloqueada para este verificador (§3.4: "bandeja...
// bloqueo para evitar revisión duplicada"). Falla si otro verificador ya la
// tomó — evita que dos personas revisen el mismo expediente a la vez.
export const claimReviewAction = roleActionClient("admin")
  .inputSchema(restaurantIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const [updated] = await db
      .update(restaurants)
      .set({ status: "en_revision", reviewerId: ctx.user.id, reviewLockedAt: new Date() })
      .where(
        and(
          eq(restaurants.id, parsedInput.restaurantId),
          or(eq(restaurants.status, "enviada"), isNull(restaurants.reviewerId)),
        ),
      )
      .returning({ id: restaurants.id });

    if (!updated) throw new Error("Otro verificador ya está revisando este expediente.");

    revalidatePath(REVIEW_PATH);
    return { ok: true };
  });

export const releaseReviewAction = roleActionClient("admin")
  .inputSchema(restaurantIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(restaurants)
      .set({ status: "enviada", reviewerId: null, reviewLockedAt: null })
      .where(and(eq(restaurants.id, parsedInput.restaurantId), eq(restaurants.reviewerId, ctx.user.id)));

    revalidatePath(REVIEW_PATH);
    return { ok: true };
  });

// en_revision → observada, con nota obligatoria y plazo (§3.4). El cron de
// vigilancia continua la pasa a "caducada" si nadie responde a tiempo.
export const observeApplicationAction = roleActionClient("admin")
  .inputSchema(observeApplicationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const deadline = new Date(Date.now() + parsedInput.deadlineDays * 24 * 60 * 60 * 1000);

    await db
      .update(restaurants)
      .set({
        status: "observada",
        observationNote: parsedInput.note,
        observationDeadline: deadline,
        updatedAt: new Date(),
      })
      .where(and(eq(restaurants.id, parsedInput.restaurantId), eq(restaurants.reviewerId, ctx.user.id)));

    revalidatePath(REVIEW_PATH);
    return { ok: true };
  });

// en_revision → rechazada, con motivo obligatorio.
export const rejectApplicationAction = roleActionClient("admin")
  .inputSchema(rejectApplicationSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(restaurants)
      .set({ status: "rechazada", observationNote: parsedInput.note, updatedAt: new Date() })
      .where(and(eq(restaurants.id, parsedInput.restaurantId), eq(restaurants.reviewerId, ctx.user.id)));

    revalidatePath(REVIEW_PATH);
    return { ok: true };
  });

// en_revision → aprobada, con período de prueba de 30 días (§3.4).
// Si el riesgo es medio/alto exige aprobación en dos pasos: el primer admin
// que confirma queda registrado como propuesta; un SEGUNDO admin distinto
// debe confirmar para que la aprobación sea efectiva.
export const approveApplicationAction = roleActionClient("admin")
  .inputSchema(restaurantIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, parsedInput.restaurantId),
    });
    if (!restaurant) throw new Error("Expediente no encontrado.");
    if (restaurant.reviewerId !== ctx.user.id) {
      throw new Error("Solo el verificador que tiene el expediente puede aprobarlo.");
    }

    const needsSecondApprover = restaurant.riskLevel === "medio" || restaurant.riskLevel === "alto";

    if (needsSecondApprover && !restaurant.firstApproverId) {
      await db
        .update(restaurants)
        .set({ firstApproverId: ctx.user.id, updatedAt: new Date() })
        .where(eq(restaurants.id, restaurant.id));
      revalidatePath(REVIEW_PATH);
      return { ok: true, needsSecondApprover: true, confirmed: false };
    }

    if (needsSecondApprover && restaurant.firstApproverId === ctx.user.id) {
      throw new Error(
        "Riesgo medio/alto: un segundo administrador distinto debe confirmar esta aprobación.",
      );
    }

    await db
      .update(restaurants)
      .set({
        status: "aprobada",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath(REVIEW_PATH);
    return { ok: true, needsSecondApprover, confirmed: true };
  });
