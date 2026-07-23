"use server";

import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { roleActionClient } from "@/lib/actions/safe-action";
import { submitRestaurantSchema } from "@/lib/validations/restaurant";
import { slugify } from "@/lib/utils";
import { lookupRuc } from "@/lib/ruc/lookup";
import { assessRestaurantRisk } from "@/lib/restaurants/risk";

export const submitRestaurantForApprovalAction = roleActionClient("restaurante")
  .inputSchema(submitRestaurantSchema)
  .action(async ({ parsedInput, ctx }) => {
    const baseSlug = slugify(parsedInput.name);
    let slug = baseSlug;
    for (let i = 1; i < 20; i++) {
      const existing = await db.query.restaurants.findFirst({
        where: (r, { eq }) => eq(r.slug, slug),
      });
      if (!existing) break;
      slug = `${baseSlug}-${i + 1}`;
    }

    // Re-verificamos en servidor (no confiamos solo en el botón "Verificar"
    // del cliente): si SUNAT confirma el RUC, queda verificado automáticamente;
    // si no, el admin lo revisa a mano con el documento adjunto.
    const rucInfo = await lookupRuc(parsedInput.ruc);

    const risk = await assessRestaurantRisk({
      name: parsedInput.name,
      address: parsedInput.address,
      district: parsedInput.district,
      rucVerifiedAt: rucInfo ? new Date() : null,
      sunatEstado: rucInfo?.estado ?? null,
      sunatCondicion: rucInfo?.condicion ?? null,
    });

    await db.insert(restaurants).values({
      name: parsedInput.name,
      slug,
      description: parsedInput.description,
      address: parsedInput.address,
      district: parsedInput.district,
      category: parsedInput.category,
      ruc: parsedInput.ruc,
      razonSocial: rucInfo?.razonSocial ?? null,
      sunatEstado: rucInfo?.estado ?? null,
      sunatCondicion: rucInfo?.condicion ?? null,
      rucVerifiedAt: rucInfo ? new Date() : null,
      openTime: parsedInput.openTime,
      closeTime: parsedInput.closeTime,
      ownerId: ctx.user.id,
      status: "enviada",
      riskLevel: risk.level,
      riskSignals: risk.signals,
    });

    revalidatePath("/restaurante");
    return { ok: true };
  });
