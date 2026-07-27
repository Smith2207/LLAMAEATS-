import { z } from "zod";

export const joinWaitlistSchema = z.object({
  restaurantId: z.string(),
  date: z.string(),
  timeSlot: z.string(),
  guests: z.coerce.number().int().min(1).max(30),
});

export const waitlistEntryIdSchema = z.object({
  id: z.string(),
});
