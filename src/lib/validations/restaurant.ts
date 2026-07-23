import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const restaurantFieldsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  address: z.string().trim().max(200).optional(),
  district: z.string().trim().min(2).max(80),
  category: z.enum(["vista_al_lago", "peña_con_show", "comida_tipica"]),
  openTime: z.string().regex(timeRegex, "Hora inválida"),
  closeTime: z.string().regex(timeRegex, "Hora inválida"),
});

function withHoursCheck<T extends z.ZodType<{ openTime: string; closeTime: string }>>(schema: T) {
  return schema.refine((v) => v.openTime < v.closeTime, {
    message: "La hora de cierre debe ser posterior a la de apertura.",
    path: ["closeTime"],
  });
}

export const submitRestaurantSchema = withHoursCheck(restaurantFieldsSchema);
export const updateRestaurantProfileSchema = submitRestaurantSchema;
