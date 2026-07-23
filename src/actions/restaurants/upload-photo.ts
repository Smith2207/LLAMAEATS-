"use server";

import { z } from "zod";
import { roleActionClient } from "@/lib/actions/safe-action";
import { uploadImage } from "@/lib/blob/upload";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_SIZE_BYTES, "La imagen no puede superar 5MB.")
    .refine((f) => ALLOWED_TYPES.has(f.type), "Formato no soportado (usa JPG, PNG o WEBP)."),
  kind: z.enum(["cover", "gallery"]),
});

export const uploadRestaurantPhotoAction = roleActionClient("restaurante")
  .inputSchema(uploadSchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);
    const url = await uploadImage(parsedInput.file, `restaurants/${restaurant.id}/${parsedInput.kind}`);
    return { url };
  });
