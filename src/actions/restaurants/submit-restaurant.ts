"use server";

import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { roleActionClient } from "@/lib/actions/safe-action";
import { submitRestaurantSchema } from "@/lib/validations/restaurant";
import { slugify } from "@/lib/utils";

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

    await db.insert(restaurants).values({
      name: parsedInput.name,
      slug,
      description: parsedInput.description,
      address: parsedInput.address,
      district: parsedInput.district,
      category: parsedInput.category,
      openTime: parsedInput.openTime,
      closeTime: parsedInput.closeTime,
      ownerId: ctx.user.id,
      status: "pendiente",
    });

    revalidatePath("/restaurante");
    return { ok: true };
  });
