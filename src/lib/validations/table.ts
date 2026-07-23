import { z } from "zod";

const tableFieldsSchema = z.object({
  number: z.coerce.number().int().min(1).max(999),
  minSeats: z.coerce.number().int().min(1).max(30).default(1),
  seats: z.coerce.number().int().min(1).max(30),
  zone: z.string().trim().min(1).max(60),
  platformBookable: z.boolean().default(true),
});

function withSeatsCheck<T extends z.ZodType<{ minSeats: number; seats: number }>>(schema: T) {
  return schema.refine((v) => v.minSeats <= v.seats, {
    message: "El mínimo no puede ser mayor que la capacidad máxima.",
    path: ["minSeats"],
  });
}

export const createTableSchema = withSeatsCheck(tableFieldsSchema);
export const updateTableSchema = withSeatsCheck(tableFieldsSchema.extend({ tableId: z.string() }));

export const tableIdSchema = z.object({ tableId: z.string() });
