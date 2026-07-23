import { z } from "zod";

export const staffTablesQuerySchema = z.object({
  date: z.string(),
  timeSlot: z.string(),
  guests: z.coerce.number().int().min(1).max(30),
});

export const createManualReservationSchema = z.object({
  tableId: z.string(),
  date: z.string(),
  timeSlot: z.string(),
  guests: z.coerce.number().int().min(1).max(30),
  guestName: z.string().trim().min(2, "Ingresa el nombre del cliente.").max(120),
  guestPhone: z.string().trim().min(6, "Ingresa un celular válido.").max(20),
  notes: z.string().trim().max(300).optional(),
});
