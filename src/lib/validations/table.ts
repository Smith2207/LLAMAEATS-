import { z } from "zod";

export const createTableSchema = z.object({
  number: z.coerce.number().int().min(1).max(999),
  seats: z.coerce.number().int().min(1).max(30),
  zone: z.string().trim().min(1).max(60),
});

export const updateTableSchema = createTableSchema.extend({
  tableId: z.string(),
});

export const tableIdSchema = z.object({ tableId: z.string() });
