import { z } from "zod";

export const availabilityQuerySchema = z.object({
  restaurantId: z.string(),
  date: z.string(),
  guests: z.coerce.number().int().min(1).max(30),
});

export const tablesQuerySchema = availabilityQuerySchema.extend({
  timeSlot: z.string(),
});

export const createReservationSchema = z.object({
  restaurantId: z.string(),
  tableId: z.string(),
  date: z.string(),
  timeSlot: z.string(),
  guests: z.coerce.number().int().min(1).max(30),
  notes: z.string().trim().max(300).optional(),
});

export const reservationCodeSchema = z.object({
  code: z.string(),
});

export const rescheduleReservationSchema = z.object({
  code: z.string(),
  tableId: z.string(),
  date: z.string(),
  timeSlot: z.string(),
});
