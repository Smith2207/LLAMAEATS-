import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const rucRegex = /^(10|15|17|20)\d{9}$/;

const restaurantFieldsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  address: z.string().trim().max(200).optional(),
  district: z.string().trim().min(2).max(80),
  category: z.enum(["vista_al_lago", "peña_con_show", "comida_tipica"]),
  ruc: z
    .string()
    .trim()
    .regex(rucRegex, "El RUC debe tener 11 dígitos y empezar con 10, 15, 17 o 20."),
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

export const rucLookupSchema = z.object({
  ruc: z.string().trim().regex(rucRegex, "RUC inválido"),
});
