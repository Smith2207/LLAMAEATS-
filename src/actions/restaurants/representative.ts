"use server";

import { createHash, randomInt } from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";
import { sendRepresentativeVerificationEmail } from "@/lib/email/send";
import {
  updateRepresentativeSchema,
  verifyRepresentativeEmailSchema,
} from "@/lib/validations/representative";

const CODE_TTL_MS = 10 * 60 * 1000;

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export const updateRepresentativeAction = roleActionClient("restaurante")
  .inputSchema(updateRepresentativeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);
    const emailChanged = parsedInput.email !== restaurant.representativeEmail;

    await db
      .update(restaurants)
      .set({
        representativeName: parsedInput.name,
        representativeDocument: parsedInput.document,
        representativeRole: parsedInput.role,
        representativeEmail: parsedInput.email,
        representativePhone: parsedInput.phone,
        // Un correo nuevo debe volver a verificarse.
        ...(emailChanged
          ? {
              representativeEmailVerifiedAt: null,
              representativeEmailCodeHash: null,
              representativeEmailCodeExpiresAt: null,
            }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/restaurante/perfil");
    return { ok: true, emailChanged };
  });

export const sendRepresentativeEmailCodeAction = roleActionClient("restaurante")
  .inputSchema(updateRepresentativeSchema.pick({ email: true }))
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);
    if (parsedInput.email !== restaurant.representativeEmail) {
      throw new Error("Guarda los datos del representante antes de enviar el código.");
    }

    // Evita reenvíos en ráfaga: si el código vigente se generó hace menos
    // de un minuto (expira en más de 9 de los 10 minutos de vida), no se
    // genera uno nuevo todavía.
    if (
      restaurant.representativeEmailCodeExpiresAt &&
      restaurant.representativeEmailCodeExpiresAt.getTime() - Date.now() > CODE_TTL_MS - 60_000
    ) {
      throw new Error("Ya enviamos un código hace un momento. Espera un minuto para reenviarlo.");
    }

    const code = randomInt(100000, 999999).toString();

    await db
      .update(restaurants)
      .set({
        representativeEmailCodeHash: hashCode(code),
        representativeEmailCodeExpiresAt: new Date(Date.now() + CODE_TTL_MS),
      })
      .where(eq(restaurants.id, restaurant.id));

    await sendRepresentativeVerificationEmail({
      to: parsedInput.email,
      restaurantName: restaurant.name,
      code,
    });

    return { ok: true };
  });

export const verifyRepresentativeEmailCodeAction = roleActionClient("restaurante")
  .inputSchema(verifyRepresentativeEmailSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    if (!restaurant.representativeEmailCodeHash || !restaurant.representativeEmailCodeExpiresAt) {
      throw new Error("Solicita un código primero.");
    }
    if (restaurant.representativeEmailCodeExpiresAt.getTime() < Date.now()) {
      throw new Error("El código venció. Solicita uno nuevo.");
    }
    if (hashCode(parsedInput.code) !== restaurant.representativeEmailCodeHash) {
      throw new Error("Código incorrecto.");
    }

    await db
      .update(restaurants)
      .set({
        representativeEmailVerifiedAt: new Date(),
        representativeEmailCodeHash: null,
        representativeEmailCodeExpiresAt: null,
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/restaurante/perfil");
    return { ok: true };
  });
