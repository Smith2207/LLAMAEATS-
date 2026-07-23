import { z } from "zod";

export const createReviewSchema = z.object({
  reservationCode: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});
