"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";
import { uploadImage } from "@/lib/blob/upload";
import {
  uploadHealthCertificateSchema,
  uploadMunicipalLicenseSchema,
} from "@/lib/validations/compliance";

export const uploadMunicipalLicenseAction = roleActionClient("restaurante")
  .inputSchema(uploadMunicipalLicenseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);
    const url = await uploadImage(parsedInput.file, `restaurants/${restaurant.id}/documents/license`);

    await db
      .update(restaurants)
      .set({
        municipalLicenseUrl: url,
        municipalLicenseNumber: parsedInput.number,
        municipalLicenseExpiresAt: parsedInput.expiresAt,
        // Un documento recién actualizado no debe volver a activar el aviso
        // hasta que efectivamente esté por vencer otra vez.
        documentExpiryWarnedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/restaurante/perfil");
    return { ok: true, url };
  });

export const uploadHealthCertificateAction = roleActionClient("restaurante")
  .inputSchema(uploadHealthCertificateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);
    const url = await uploadImage(parsedInput.file, `restaurants/${restaurant.id}/documents/health`);

    await db
      .update(restaurants)
      .set({
        healthCertificateUrl: url,
        healthCertificateExpiresAt: parsedInput.expiresAt,
        documentExpiryWarnedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/restaurante/perfil");
    return { ok: true, url };
  });
