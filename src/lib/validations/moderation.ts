import { z } from "zod";

export const restaurantIdSchema = z.object({ restaurantId: z.string() });

export const observeApplicationSchema = z.object({
  restaurantId: z.string(),
  note: z.string().trim().min(10, "Explica qué debe corregir el postulante.").max(500),
  deadlineDays: z.coerce.number().int().min(1).max(30).default(7),
});

export const rejectApplicationSchema = z.object({
  restaurantId: z.string(),
  note: z.string().trim().min(10, "Explica el motivo del rechazo.").max(500),
});

export const pauseRestaurantSchema = z.object({
  restaurantId: z.string(),
  reason: z.string().trim().max(300).optional(),
});
