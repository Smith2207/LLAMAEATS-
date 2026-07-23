import { z } from "zod";

export const reservationCodeInputSchema = z.object({
  code: z.string(),
});
